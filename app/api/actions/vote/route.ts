import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  createBurnInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { ACTIONS_CORS_HEADERS, SITE_URL } from "@/lib/actions";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getBacklotBalance, getHoldingSince, getHoldingMultiplier } from "@/lib/wallet";

const BACKLOT_MINT = new PublicKey(
  (process.env.NEXT_PUBLIC_BACKLOT_TOKEN_MINT || "DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump").trim()
);
const VOTE_COST = 10;
const TOKEN_DECIMALS = 6;
const VOTE_COST_RAW = VOTE_COST * 10 ** TOKEN_DECIMALS;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidPublicKey(value: string): boolean {
  try {
    new PublicKey(value);
    return true;
  } catch {
    return false;
  }
}

// GET — return action metadata + poll options as linked actions
export async function GET(req: NextRequest) {
  const pollId = req.nextUrl.searchParams.get("pollId");

  // Redirect browsers to the vote page (Blink clients send Accept: application/json)
  const accept = req.headers.get("accept") || "";
  if (accept.includes("text/html") && !accept.includes("application/json")) {
    const dest = pollId ? `${SITE_URL}/vote?pollId=${pollId}` : `${SITE_URL}/vote`;
    return NextResponse.redirect(dest, { status: 302 });
  }

  if (!pollId || !UUID_RE.test(pollId)) {
    return NextResponse.json(
      { error: "Valid pollId required" },
      { status: 400, headers: ACTIONS_CORS_HEADERS }
    );
  }

  const { data: poll } = await supabaseAdmin
    .from("polls")
    .select("*, options:poll_options(*)")
    .eq("id", pollId)
    .single();

  if (!poll) {
    return NextResponse.json(
      { error: "Poll not found" },
      { status: 404, headers: ACTIONS_CORS_HEADERS }
    );
  }

  const actions = (poll.options || []).map(
    (opt: { id: string; label: string }) => ({
      label: opt.label,
      href: `${SITE_URL}/api/actions/vote?pollId=${pollId}&optionId=${opt.id}`,
    })
  );

  return NextResponse.json(
    {
      icon: `${SITE_URL}/brand/banner.jpeg`,
      title: `BACKLOT Vote: ${poll.title}`,
      description: (poll.description || "Vote on what happens next in the Backlot experiment.") + ` (Cost: ${VOTE_COST} $BACKLOT — burned)`,
      label: "Vote",
      links: { actions },
    },
    { headers: ACTIONS_CORS_HEADERS }
  );
}

// POST — build and return the vote transaction (Memo program)
export async function POST(req: NextRequest) {
  try {
    const pollId = req.nextUrl.searchParams.get("pollId");
    const optionId = req.nextUrl.searchParams.get("optionId");

    if (!pollId || !optionId || !UUID_RE.test(pollId) || !UUID_RE.test(optionId)) {
      return NextResponse.json(
        { error: "Valid pollId and optionId required" },
        { status: 400, headers: ACTIONS_CORS_HEADERS }
      );
    }

    const body = await req.json();
    if (!body.account || !isValidPublicKey(body.account)) {
      return NextResponse.json(
        { error: "Valid wallet address required" },
        { status: 400, headers: ACTIONS_CORS_HEADERS }
      );
    }

    const account = new PublicKey(body.account);
    const walletAddr = account.toBase58();

    // Check for duplicate vote
    const { data: existingVote } = await supabaseAdmin
      .from("votes")
      .select("id")
      .eq("poll_id", pollId)
      .eq("wallet_address", walletAddr)
      .maybeSingle();

    if (existingVote) {
      return NextResponse.json(
        { error: "Already voted on this poll" },
        { status: 409, headers: ACTIONS_CORS_HEADERS }
      );
    }

    // Verify option belongs to poll
    const { data: option } = await supabaseAdmin
      .from("poll_options")
      .select("label, poll_id")
      .eq("id", optionId)
      .single();

    if (!option || option.poll_id !== pollId) {
      return NextResponse.json(
        { error: "Invalid option for this poll" },
        { status: 400, headers: ACTIONS_CORS_HEADERS }
      );
    }

    const { data: poll } = await supabaseAdmin
      .from("polls")
      .select("title")
      .eq("id", pollId)
      .single();

    // Get actual on-chain balance to check vote eligibility
    const connection = new Connection(
      (process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com").trim()
    );
    const balance = await getBacklotBalance(connection, account);
    const holdingSince = await getHoldingSince(connection, account);
    const multiplier = getHoldingMultiplier(holdingSince);

    if (balance < VOTE_COST) {
      return NextResponse.json(
        { error: `Insufficient $BACKLOT balance (need ${VOTE_COST}, have ${balance})` },
        { status: 400, headers: ACTIONS_CORS_HEADERS }
      );
    }

    // Derive voter ATA for burn
    const voterATA = getAssociatedTokenAddressSync(BACKLOT_MINT, account, false, TOKEN_2022_PROGRAM_ID);

    const memoText = JSON.stringify({
      type: "backlot_vote",
      poll: pollId,
      option: optionId,
      label: option?.label || "",
    });

    const MEMO_PROGRAM_ID = new PublicKey(
      "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
    );

    const { blockhash } = await connection.getLatestBlockhash();

    const tx = new Transaction();
    tx.recentBlockhash = blockhash;
    tx.feePayer = account;

    // Burn 10 $BACKLOT — permanently removed from supply
    tx.add(
      createBurnInstruction(voterATA, BACKLOT_MINT, account, VOTE_COST_RAW, [], TOKEN_2022_PROGRAM_ID)
    );

    // Memo instruction for on-chain vote record
    tx.add(
      new TransactionInstruction({
        programId: MEMO_PROGRAM_ID,
        keys: [{ pubkey: account, isSigner: true, isWritable: false }],
        data: Buffer.from(memoText),
      })
    );

    const serialized = tx.serialize({ requireAllSignatures: false }).toString("base64");

    // After returning the TX, poll for on-chain confirmation and record the vote
    // This runs in the background — the response is returned immediately
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.backlotsocial.xyz";
    const pollForConfirmation = async () => {
      try {
        // Wait for the TX to appear on-chain (user needs to sign first)
        await new Promise((r) => setTimeout(r, 5000));

        // Poll for the signature in recent transactions for this wallet
        const signatures = await connection.getSignaturesForAddress(account, { limit: 5 });
        for (const sig of signatures) {
          const parsed = await connection.getParsedTransaction(sig.signature, {
            commitment: "confirmed",
            maxSupportedTransactionVersion: 0,
          });
          if (!parsed || !parsed.meta || parsed.meta.err) continue;

          // Check if this TX contains our memo with the vote data
          const logMessages = parsed.meta.logMessages || [];
          const hasMemo = logMessages.some((log) => log.includes("backlot_vote") && log.includes(pollId));
          if (!hasMemo) continue;

          // Found the confirmed vote TX — record it via /api/vote
          const mintHeaders: Record<string, string> = { "Content-Type": "application/json" };
          if (process.env.INTERNAL_API_SECRET) {
            mintHeaders["x-internal-secret"] = process.env.INTERNAL_API_SECRET;
          }
          await fetch(`${siteUrl}/api/vote`, {
            method: "POST",
            headers: mintHeaders,
            body: JSON.stringify({ pollId, optionId, txSignature: sig.signature }),
          });
          return;
        }

        // Retry a few more times with longer delays
        for (let attempt = 0; attempt < 6; attempt++) {
          await new Promise((r) => setTimeout(r, 5000));
          const sigs = await connection.getSignaturesForAddress(account, { limit: 5 });
          for (const sig of sigs) {
            const parsed = await connection.getParsedTransaction(sig.signature, {
              commitment: "confirmed",
              maxSupportedTransactionVersion: 0,
            });
            if (!parsed || !parsed.meta || parsed.meta.err) continue;
            const logMessages = parsed.meta.logMessages || [];
            const hasMemo = logMessages.some((log) => log.includes("backlot_vote") && log.includes(pollId));
            if (!hasMemo) continue;

            await fetch(`${siteUrl}/api/vote`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ pollId, optionId, txSignature: sig.signature }),
            });
            return;
          }
        }
      } catch (err) {
        console.error("Blink vote poll error:", err);
      }
    };

    // Keep serverless function alive after response to poll for TX confirmation
    waitUntil(pollForConfirmation());

    return NextResponse.json(
      {
        transaction: serialized,
        message: `Vote: ${option?.label || "recorded"} on "${poll?.title || "poll"}" (10 $BACKLOT burned)${multiplier > 1 ? ` — ${multiplier.toFixed(1)}x holding bonus!` : ""}`,
      },
      { headers: ACTIONS_CORS_HEADERS }
    );
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json(
      { error: "Failed to process vote" },
      { status: 500, headers: ACTIONS_CORS_HEADERS }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: ACTIONS_CORS_HEADERS });
}
