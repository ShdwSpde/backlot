import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getBacklotBalance } from "@/lib/wallet";

const BACKLOT_MINT = new PublicKey(
  (process.env.NEXT_PUBLIC_BACKLOT_TOKEN_MINT || "DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump").trim()
);
const TREASURY_WALLET = new PublicKey(
  (process.env.TREASURY_WALLET || "H3HQzT6PqyFWzQLAtexP98FWsY4cUJjBHUSKDbec93Bt").trim()
);
const VOTE_COST = 10;
const TOKEN_DECIMALS = 6;
const VOTE_COST_RAW = BigInt(VOTE_COST * 10 ** TOKEN_DECIMALS);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getTierFromBalance(balance: number): string {
  const EXEC = Number(process.env.NEXT_PUBLIC_EXEC_PRODUCER_THRESHOLD || 100000);
  const PRODUCER = Number(process.env.NEXT_PUBLIC_PRODUCER_THRESHOLD || 10000);
  const SUPPORTER = Number(process.env.NEXT_PUBLIC_SUPPORTER_THRESHOLD || 1);
  if (balance >= EXEC) return "executive_producer";
  if (balance >= PRODUCER) return "producer";
  if (balance >= SUPPORTER) return "supporter";
  return "viewer";
}

export async function POST(req: NextRequest) {
  try {
    const { pollId, optionId, txSignature } = await req.json();

    if (!pollId || !optionId || !txSignature) {
      return NextResponse.json({ error: "pollId, optionId, and txSignature required" }, { status: 400 });
    }
    if (!UUID_RE.test(pollId) || !UUID_RE.test(optionId)) {
      return NextResponse.json({ error: "Invalid pollId or optionId" }, { status: 400 });
    }

    const rpcUrl = (process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com").trim();
    const connection = new Connection(rpcUrl);

    // Fetch and verify the transaction on-chain (retry up to 5 times for propagation delay)
    console.log(`[vote] Looking up TX: ${txSignature} via RPC: ${rpcUrl.substring(0, 40)}...`);
    let tx = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      tx = await connection.getParsedTransaction(txSignature, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });
      if (tx) {
        console.log(`[vote] TX found on attempt ${attempt + 1}`);
        break;
      }
      console.log(`[vote] TX not found, attempt ${attempt + 1}/5, retrying in 2s...`);
      await new Promise((r) => setTimeout(r, 2000));
    }

    if (!tx) {
      console.error(`[vote] TX not found after 5 retries: ${txSignature}`);
      return NextResponse.json({ error: "Transaction not found — it may not have confirmed on-chain" }, { status: 400 });
    }
    if (!tx.meta) {
      console.error(`[vote] TX has no meta: ${txSignature}`);
      return NextResponse.json({ error: "Transaction metadata missing" }, { status: 400 });
    }
    if (tx.meta.err) {
      console.error(`[vote] TX failed on-chain:`, tx.meta.err);
      return NextResponse.json({ error: `Transaction failed on-chain: ${JSON.stringify(tx.meta.err)}` }, { status: 400 });
    }

    // Extract the signer (fee payer)
    const signer = tx.transaction.message.accountKeys.find((k) =>
      "signer" in k ? k.signer : false
    );
    const walletAddr = signer
      ? (typeof signer === "object" && "pubkey" in signer ? signer.pubkey.toBase58() : String(signer))
      : tx.transaction.message.accountKeys[0]?.pubkey?.toBase58();

    if (!walletAddr) {
      return NextResponse.json({ error: "Could not determine signer" }, { status: 400 });
    }

    const voterPubkey = new PublicKey(walletAddr);

    // Verify the TX contains a transfer to the treasury for the correct amount
    const preBalances = tx.meta.preTokenBalances || [];
    const postBalances = tx.meta.postTokenBalances || [];

    // Find treasury ATA in post-token balances and verify it received tokens
    const treasuryPost = postBalances.find(
      (b) => b.mint === BACKLOT_MINT.toBase58() && b.owner === TREASURY_WALLET.toBase58()
    );
    const treasuryPre = preBalances.find(
      (b) => b.mint === BACKLOT_MINT.toBase58() && b.owner === TREASURY_WALLET.toBase58()
    );

    const preAmount = BigInt(treasuryPre?.uiTokenAmount?.amount || "0");
    const postAmount = BigInt(treasuryPost?.uiTokenAmount?.amount || "0");
    const transferred = postAmount - preAmount;

    if (transferred < VOTE_COST_RAW) {
      return NextResponse.json(
        { error: `Insufficient transfer: expected ${VOTE_COST_RAW.toString()}, got ${transferred.toString()}` },
        { status: 400 }
      );
    }

    // Check for duplicate vote
    const { data: existingVote } = await supabaseAdmin
      .from("votes")
      .select("id")
      .eq("poll_id", pollId)
      .eq("wallet_address", walletAddr)
      .maybeSingle();

    if (existingVote) {
      return NextResponse.json({ error: "Already voted on this poll" }, { status: 409 });
    }

    // Verify option belongs to poll
    const { data: option } = await supabaseAdmin
      .from("poll_options")
      .select("label, poll_id")
      .eq("id", optionId)
      .single();

    if (!option || option.poll_id !== pollId) {
      return NextResponse.json({ error: "Invalid option for this poll" }, { status: 400 });
    }

    const { data: poll } = await supabaseAdmin
      .from("polls")
      .select("title, is_active, ends_at")
      .eq("id", pollId)
      .single();

    if (!poll || !poll.is_active) {
      return NextResponse.json({ error: "Poll is closed" }, { status: 400 });
    }
    if (poll.ends_at && new Date(poll.ends_at) < new Date()) {
      return NextResponse.json({ error: "Poll has ended" }, { status: 400 });
    }

    // Get on-chain balance for tier/weight (server-verified, not client-provided)
    const balance = await getBacklotBalance(connection, voterPubkey);
    const tier = getTierFromBalance(balance);

    // Insert vote
    const { data: vote, error: voteError } = await supabaseAdmin
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

    if (voteError) {
      console.error("Vote insert error:", voteError);
      return NextResponse.json({ error: "Failed to record vote" }, { status: 500 });
    }

    // Increment vote count atomically
    const { error: rpcError } = await supabaseAdmin.rpc("increment_vote_count", { option_id_param: optionId });
    if (rpcError) {
      const { data: current } = await supabaseAdmin
        .from("poll_options")
        .select("vote_count, weighted_count")
        .eq("id", optionId)
        .single();
      await supabaseAdmin
        .from("poll_options")
        .update({
          vote_count: (current?.vote_count || 0) + 1,
          weighted_count: (current?.weighted_count || 0) + Math.max(balance, 1),
        })
        .eq("id", optionId);
    }

    // Insert vote receipt
    await supabaseAdmin.from("vote_receipts").insert({
      vote_id: vote.id,
      wallet_address: walletAddr,
      poll_title: poll.title || "",
      option_label: option.label || "",
    });

    // Trigger cNFT mint in background
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.backlotsocial.xyz";
    const mintHeaders: Record<string, string> = { "Content-Type": "application/json" };
    if (process.env.INTERNAL_API_SECRET) {
      mintHeaders["x-internal-secret"] = process.env.INTERNAL_API_SECRET;
    }
    fetch(`${siteUrl}/api/mint-vote-receipt`, {
      method: "POST",
      headers: mintHeaders,
      body: JSON.stringify({
        voteId: vote.id,
        walletAddress: walletAddr,
        pollTitle: poll.title || "",
        optionLabel: option.label || "",
      }),
    }).catch(console.error);

    return NextResponse.json({ success: true, voteId: vote.id });
  } catch (error) {
    console.error("Vote verification error:", error);
    return NextResponse.json({ error: "Failed to verify vote" }, { status: 500 });
  }
}
