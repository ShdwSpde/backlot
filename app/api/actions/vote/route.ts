import { NextRequest, NextResponse } from "next/server";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { ACTIONS_CORS_HEADERS, SITE_URL } from "@/lib/actions";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getBacklotBalance } from "@/lib/wallet";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidPublicKey(value: string): boolean {
  try {
    new PublicKey(value);
    return true;
  } catch {
    return false;
  }
}

function getTierFromBalance(balance: number): string {
  const EXEC = Number(process.env.NEXT_PUBLIC_EXEC_PRODUCER_THRESHOLD || 100000);
  const PRODUCER = Number(process.env.NEXT_PUBLIC_PRODUCER_THRESHOLD || 10000);
  const SUPPORTER = Number(process.env.NEXT_PUBLIC_SUPPORTER_THRESHOLD || 1);
  if (balance >= EXEC) return "executive_producer";
  if (balance >= PRODUCER) return "producer";
  if (balance >= SUPPORTER) return "supporter";
  return "viewer";
}

// GET — return action metadata + poll options as linked actions
export async function GET(req: NextRequest) {
  const pollId = req.nextUrl.searchParams.get("pollId");

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
      description: poll.description || "Vote on what happens next in the Backlot experiment.",
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

    // Get actual on-chain balance for tier
    const connection = new Connection(
      process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com"
    );
    const balance = await getBacklotBalance(connection, account);
    const tier = getTierFromBalance(balance);

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
    tx.add(
      new TransactionInstruction({
        programId: MEMO_PROGRAM_ID,
        keys: [{ pubkey: account, isSigner: true, isWritable: false }],
        data: Buffer.from(memoText),
      })
    );

    const serialized = tx.serialize({ requireAllSignatures: false }).toString("base64");

    // Insert vote as pending — should be confirmed after tx lands on-chain
    const { data: vote } = await supabaseAdmin
      .from("votes")
      .insert({
        poll_id: pollId,
        option_id: optionId,
        wallet_address: walletAddr,
        tier_at_vote: tier,
        weight: Math.max(balance, 1),
      })
      .select()
      .single();

    if (vote) {
      // Try atomic increment via RPC, fall back to read-then-write
      const { error: rpcError } = await supabaseAdmin.rpc("increment_vote_count", { option_id_param: optionId });
      if (rpcError) {
        const { data: current } = await supabaseAdmin
          .from("poll_options")
          .select("vote_count")
          .eq("id", optionId)
          .single();
        await supabaseAdmin
          .from("poll_options")
          .update({ vote_count: (current?.vote_count || 0) + 1 })
          .eq("id", optionId);
      }

      await supabaseAdmin.from("vote_receipts").insert({
        vote_id: vote.id,
        wallet_address: walletAddr,
        poll_title: poll?.title || "",
        option_label: option?.label || "",
      });
    }

    return NextResponse.json(
      {
        transaction: serialized,
        message: `Voted: ${option?.label || "recorded"} on "${poll?.title || "poll"}"`,
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
