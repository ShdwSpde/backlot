import { NextResponse } from "next/server";

const BACKLOT_MINT = "DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump";
const TOKEN_DECIMALS = 6;
const TOTAL_SUPPLY = 1_000_000_000; // 1B total supply

export const revalidate = 60;

interface HeliusTokenAccount {
  owner: string;
  amount: number;
}

interface HolderRow {
  rank: number;
  wallet: string;
  walletFull: string;
  amount: number;
  percentage: number;
}

interface TreasuryResponse {
  holders: HolderRow[];
  totalHolders: number;
  topHolderPercentage: number;
  top5Percentage: number;
  top10Percentage: number;
  totalSupply: number;
  lastUpdated: string;
}

function truncateWallet(address: string): string {
  if (address.length <= 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export async function GET() {
  try {
    const heliusKey = process.env.HELIUS_API_KEY;
    if (!heliusKey) {
      return NextResponse.json(
        { error: "Helius API key not configured" },
        { status: 500 }
      );
    }

    // Fetch token accounts from Helius DAS API
    const response = await fetch(
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

    const data = await response.json();
    const tokenAccounts: HeliusTokenAccount[] =
      data?.result?.token_accounts || [];
    const totalFromApi: number = data?.result?.total || tokenAccounts.length;

    // Convert raw amounts (6 decimals) and sort descending
    const parsed = tokenAccounts
      .map((account: HeliusTokenAccount) => ({
        owner: account.owner,
        amount: account.amount / Math.pow(10, TOKEN_DECIMALS),
      }))
      .sort((a, b) => b.amount - a.amount);

    // Build ranked holder rows
    const holders: HolderRow[] = parsed.map((h, i) => ({
      rank: i + 1,
      wallet: truncateWallet(h.owner),
      walletFull: h.owner,
      amount: h.amount,
      percentage: (h.amount / TOTAL_SUPPLY) * 100,
    }));

    // Concentration metrics
    const topHolderPercentage =
      holders.length > 0 ? holders[0].percentage : 0;
    const top5Percentage = holders
      .slice(0, 5)
      .reduce((sum, h) => sum + h.percentage, 0);
    const top10Percentage = holders
      .slice(0, 10)
      .reduce((sum, h) => sum + h.percentage, 0);

    const result: TreasuryResponse = {
      holders,
      totalHolders: totalFromApi,
      topHolderPercentage: Math.round(topHolderPercentage * 100) / 100,
      top5Percentage: Math.round(top5Percentage * 100) / 100,
      top10Percentage: Math.round(top10Percentage * 100) / 100,
      totalSupply: TOTAL_SUPPLY,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Treasury API error:", error);
    return NextResponse.json(
      {
        holders: [],
        totalHolders: 0,
        topHolderPercentage: 0,
        top5Percentage: 0,
        top10Percentage: 0,
        totalSupply: TOTAL_SUPPLY,
        lastUpdated: null,
        error: "Failed to fetch on-chain data",
      },
      { status: 200 }
    );
  }
}
