import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getBacklotBalance } from "@/lib/wallet";

const MAX_MESSAGE_LENGTH = 500;

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
    const { walletAddress, message } = await req.json();

    if (!walletAddress || !message) {
      return NextResponse.json({ error: "walletAddress and message required" }, { status: 400 });
    }

    if (typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json({ error: `Message too long (max ${MAX_MESSAGE_LENGTH} chars)` }, { status: 400 });
    }

    // Validate wallet address
    let pubkey: PublicKey;
    try {
      pubkey = new PublicKey(walletAddress);
    } catch {
      return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
    }

    // Verify on-chain balance to determine tier (server-verified, not client-provided)
    const rpcUrl = (process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com").trim();
    const connection = new Connection(rpcUrl);
    const balance = await getBacklotBalance(connection, pubkey);
    const tier = getTierFromBalance(balance);

    if (tier === "viewer") {
      return NextResponse.json({ error: "Must hold $BACKLOT to chat" }, { status: 403 });
    }

    const shortAddr = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;

    const { error } = await supabaseAdmin.from("chat_messages").insert({
      wallet_address: walletAddress,
      display_name: shortAddr,
      message: message.trim().slice(0, MAX_MESSAGE_LENGTH),
      tier,
      is_highlighted: tier === "producer" || tier === "executive_producer",
    });

    if (error) {
      console.error("Chat insert error:", error);
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
