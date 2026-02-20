import { NextRequest, NextResponse } from "next/server";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

function isValidPublicKey(value: string): boolean {
  try {
    new PublicKey(value);
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const treasuryAddress = process.env.TREASURY_WALLET;
    if (!treasuryAddress) {
      return NextResponse.json(
        { error: "Treasury not configured" },
        { status: 503 }
      );
    }

    const { milestoneId, amount, walletAddress } = await req.json();

    if (!milestoneId || !amount || !walletAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || amount <= 0 || amount > 1000) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    if (!isValidPublicKey(walletAddress)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    const TREASURY_WALLET = new PublicKey(treasuryAddress);
    const connection = new Connection(
      process.env.SOLANA_RPC_URL ||
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
