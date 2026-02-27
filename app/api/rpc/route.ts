import { NextRequest, NextResponse } from "next/server";

const RPC_URL = (process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com").trim();

const ALLOWED_METHODS = new Set([
  "getBalance",
  "getAccountInfo",
  "getLatestBlockhash",
  "getSignatureStatuses",
  "getTokenAccountsByOwner",
  "getTokenAccountBalance",
  "getParsedTransaction",
  "getTransaction",
  "sendTransaction",
  "simulateTransaction",
  "getRecentBlockhash",
  "getBlockHeight",
  "getSlot",
  "getSignaturesForAddress",
  "getMultipleAccounts",
  "getTokenLargestAccounts",
  "getMinimumBalanceForRentExemption",
  "getFeeForMessage",
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const method = body?.method;
    if (!method || !ALLOWED_METHODS.has(method)) {
      return NextResponse.json(
        { error: `RPC method not allowed: ${method}` },
        { status: 403 }
      );
    }

    const res = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "RPC proxy error" }, { status: 502 });
  }
}
