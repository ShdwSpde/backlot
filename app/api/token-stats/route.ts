import { NextResponse } from "next/server";

const BACKLOT_MINT = "DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump";

export const revalidate = 30;

export async function GET() {
  try {
    const priceRes = await fetch(
      `https://api.jup.ag/price/v2?ids=${BACKLOT_MINT}`,
      { next: { revalidate: 30 } }
    );
    const priceData = await priceRes.json();
    const tokenPrice = priceData?.data?.[BACKLOT_MINT]?.price || 0;

    const holders = 0;
    let supply = 0;

    try {
      const heliusKey = process.env.HELIUS_API_KEY;
      if (heliusKey) {
        const assetRes = await fetch(
          `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              method: "getAsset",
              params: { id: BACKLOT_MINT },
            }),
            next: { revalidate: 60 },
          }
        );
        const assetData = await assetRes.json();
        supply = assetData?.result?.token_info?.supply || 0;
      }
    } catch {
      // Helius unavailable
    }

    const marketCap = tokenPrice * (supply / 1e6);

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
