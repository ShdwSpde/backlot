import { NextResponse } from "next/server";

const BACKLOT_MINT = "DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump";

export const revalidate = 30;

export async function GET() {
  try {
    // Use DexScreener (free, no auth) for price + market data
    const dexRes = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${BACKLOT_MINT}`,
      { next: { revalidate: 30 } }
    );
    const dexData = await dexRes.json();
    const pair = dexData?.pairs?.[0];

    const tokenPrice = pair ? parseFloat(pair.priceUsd || "0") : 0;
    const marketCap = pair?.marketCap || pair?.fdv || 0;
    const supply = marketCap > 0 && tokenPrice > 0 ? Math.round(marketCap / tokenPrice) : 1_000_000_000;

    let holders = 0;

    // Try Helius DAS for accurate holder count
    const heliusKey = process.env.HELIUS_API_KEY;
    if (heliusKey) {
      try {
        const holdersRes = await fetch(
          `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              method: "getTokenAccounts",
              params: {
                mint: BACKLOT_MINT,
                limit: 1000,
                options: { showZeroBalance: false },
              },
            }),
            next: { revalidate: 60 },
          }
        );
        const holdersData = await holdersRes.json();
        holders = holdersData?.result?.total || 0;
      } catch {
        // Helius unavailable
      }
    }

    // Fallback: use Solana RPC getTokenLargestAccounts for minimum holder count
    if (holders === 0) {
      try {
        const rpcUrl = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
        const largestRes = await fetch(rpcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 2,
            method: "getTokenLargestAccounts",
            params: [BACKLOT_MINT],
          }),
          next: { revalidate: 120 },
        });
        const largestData = await largestRes.json();
        if (largestData?.error) {
          // RPC rate limited (429) or other error
          holders = 6;
        } else {
          const accounts = largestData?.result?.value || [];
          const active = accounts.filter((a: { amount: string }) => a.amount !== "0").length;
          holders = active > 0 ? active : 6;
        }
      } catch {
        // Network error — use known minimum from pump.fun page
        holders = 6;
      }
    }

    return NextResponse.json({
      price: tokenPrice,
      marketCap,
      holders,
      supply,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Token stats error:", error);
    return NextResponse.json(
      { price: 0, marketCap: 0, holders: 0, supply: 0, lastUpdated: null },
      { status: 200 }
    );
  }
}
