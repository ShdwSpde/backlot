import { NextRequest, NextResponse } from "next/server";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { ACTIONS_CORS_HEADERS, SITE_URL } from "@/lib/actions";
import { supabase } from "@/lib/supabase";

// GET — return action metadata + poll options as linked actions
export async function GET(req: NextRequest) {
  const pollId = req.nextUrl.searchParams.get("pollId");

  if (!pollId) {
    return NextResponse.json(
      { error: "pollId required" },
      { status: 400, headers: ACTIONS_CORS_HEADERS }
    );
  }

  const { data: poll } = await supabase
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
  const pollId = req.nextUrl.searchParams.get("pollId");
  const optionId = req.nextUrl.searchParams.get("optionId");

  if (!pollId || !optionId) {
    return NextResponse.json(
      { error: "pollId and optionId required" },
      { status: 400, headers: ACTIONS_CORS_HEADERS }
    );
  }

  const body = await req.json();
  const account = new PublicKey(body.account);

  const { data: option } = await supabase
    .from("poll_options")
    .select("label, poll_id")
    .eq("id", optionId)
    .single();

  const { data: poll } = await supabase
    .from("polls")
    .select("title")
    .eq("id", pollId)
    .single();

  const memoText = JSON.stringify({
    type: "backlot_vote",
    poll: pollId,
    option: optionId,
    label: option?.label || "",
  });

  const MEMO_PROGRAM_ID = new PublicKey(
    "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
  );

  const connection = new Connection(
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com"
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

  const walletAddr = account.toBase58();
  const { data: vote } = await supabase
    .from("votes")
    .insert({
      poll_id: pollId,
      option_id: optionId,
      wallet_address: walletAddr,
      tier_at_vote: "supporter",
    })
    .select()
    .single();

  if (vote) {
    await supabase
      .from("poll_options")
      .update({
        vote_count:
          ((await supabase.from("poll_options").select("vote_count").eq("id", optionId).single()).data?.vote_count || 0) + 1,
      })
      .eq("id", optionId);

    await supabase.from("vote_receipts").insert({
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
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: ACTIONS_CORS_HEADERS });
}
