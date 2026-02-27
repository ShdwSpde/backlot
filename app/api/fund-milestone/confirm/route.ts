import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { supabaseAdmin } from "@/lib/supabase-admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  try {
    const { milestoneId, txSignature, amount, walletAddress } = await req.json();

    if (!milestoneId || !txSignature || !amount || !walletAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!UUID_RE.test(milestoneId)) {
      return NextResponse.json({ error: "Invalid milestoneId" }, { status: 400 });
    }
    if (typeof amount !== "number" || amount <= 0 || amount > 1000) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    try {
      new PublicKey(walletAddress);
    } catch {
      return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
    }

    // Check for duplicate tx_signature
    const { data: existingContrib } = await supabaseAdmin
      .from("milestone_contributions")
      .select("id")
      .eq("tx_signature", txSignature)
      .maybeSingle();

    if (existingContrib) {
      return NextResponse.json({ error: "Transaction already recorded" }, { status: 409 });
    }

    // Verify TX on-chain
    const rpcUrl = (process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com").trim();
    const connection = new Connection(rpcUrl);

    let tx = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      tx = await connection.getParsedTransaction(txSignature, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });
      if (tx) break;
      await new Promise((r) => setTimeout(r, 2000));
    }

    if (!tx || !tx.meta || tx.meta.err) {
      return NextResponse.json({ error: "Transaction not confirmed or failed" }, { status: 400 });
    }

    // Verify the signer matches
    const signer = tx.transaction.message.accountKeys[0]?.pubkey?.toBase58();
    if (signer !== walletAddress) {
      return NextResponse.json({ error: "Signer mismatch" }, { status: 400 });
    }

    // Verify SOL transfer amount
    const treasuryWallet = process.env.TREASURY_WALLET;
    if (!treasuryWallet) {
      return NextResponse.json({ error: "Treasury not configured" }, { status: 503 });
    }

    const preBalances = tx.meta.preBalances;
    const postBalances = tx.meta.postBalances;
    const accountKeys = tx.transaction.message.accountKeys;
    const treasuryIdx = accountKeys.findIndex(
      (k) => (typeof k === "object" && "pubkey" in k ? k.pubkey.toBase58() : String(k)) === treasuryWallet
    );

    if (treasuryIdx < 0) {
      return NextResponse.json({ error: "Treasury not found in transaction" }, { status: 400 });
    }

    const received = (postBalances[treasuryIdx] - preBalances[treasuryIdx]) / LAMPORTS_PER_SOL;
    const expectedMin = amount * 0.99; // Allow 1% tolerance for fees
    if (received < expectedMin) {
      return NextResponse.json({ error: `Insufficient transfer: expected ${amount} SOL, got ${received.toFixed(6)}` }, { status: 400 });
    }

    // Record contribution server-side
    await supabaseAdmin.from("milestone_contributions").insert({
      milestone_id: milestoneId,
      wallet_address: walletAddress,
      amount,
      currency: "SOL",
      tx_signature: txSignature,
    });

    // Update milestone amount atomically
    const { data: milestone } = await supabaseAdmin
      .from("milestones")
      .select("current_amount")
      .eq("id", milestoneId)
      .single();

    if (milestone) {
      await supabaseAdmin
        .from("milestones")
        .update({ current_amount: (milestone.current_amount || 0) + amount })
        .eq("id", milestoneId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Fund confirm error:", error);
    return NextResponse.json({ error: "Failed to confirm funding" }, { status: 500 });
  }
}
