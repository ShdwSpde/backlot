import { NextRequest, NextResponse } from "next/server";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

const TREASURY_WALLET = new PublicKey(
  process.env.NEXT_PUBLIC_TREASURY_WALLET || "11111111111111111111111111111112"
);

export async function POST(req: NextRequest) {
  try {
    const { milestoneId, amount, walletAddress } = await req.json();

    if (!milestoneId || !amount || !walletAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
        "https://api.mainnet-beta.solana.com"
    );

    const payer = new PublicKey(walletAddress);
    const lamports = Math.round(amount * LAMPORTS_PER_SOL);

    const { blockhash } = await connection.getLatestBlockhash();

    const tx = new Transaction();
    tx.recentBlockhash = blockhash;
    tx.feePayer = payer;
    tx.add(
      SystemProgram.transfer({
        fromPubkey: payer,
        toPubkey: TREASURY_WALLET,
        lamports,
      })
    );

    const serialized = tx
      .serialize({ requireAllSignatures: false })
      .toString("base64");

    return NextResponse.json({
      transaction: serialized,
      milestoneId,
      amount,
    });
  } catch (error) {
    console.error("Fund milestone error:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
