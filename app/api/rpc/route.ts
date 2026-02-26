import { NextRequest, NextResponse } from "next/server";

const RPC_URL = (process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com").trim();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

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
