import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const BACKLOT_MINT = "DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump";
const TOKEN_DECIMALS = 6;
const TOTAL_SUPPLY = 1_000_000_000;

const SUPPORTER_THRESHOLD = Number(process.env.NEXT_PUBLIC_SUPPORTER_THRESHOLD || 1);
const PRODUCER_THRESHOLD = Number(process.env.NEXT_PUBLIC_PRODUCER_THRESHOLD || 10000);
const EXEC_PRODUCER_THRESHOLD = Number(process.env.NEXT_PUBLIC_EXEC_PRODUCER_THRESHOLD || 100000);

function getTier(balance: number) {
  if (balance >= EXEC_PRODUCER_THRESHOLD) return { name: "Executive Producer", color: "#C5A644", emoji: "⭐" };
  if (balance >= PRODUCER_THRESHOLD) return { name: "Producer", color: "#2DD4BF", emoji: "🎬" };
  if (balance >= SUPPORTER_THRESHOLD) return { name: "Supporter", color: "#B8A9D4", emoji: "🎟️" };
  return { name: "Viewer", color: "#8B8B9E", emoji: "👀" };
}

function formatBalance(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");

  if (!wallet || wallet.length < 32 || wallet.length > 44) {
    return new Response(JSON.stringify({ error: "Invalid wallet address" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const heliusKey = process.env.HELIUS_API_KEY;
  let balance = 0;
  let rank = 0;
  let totalHolders = 0;

  if (heliusKey) {
    try {
      const res = await fetch(
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
        }
      );

      const data = await res.json();
      const accounts: { owner: string; amount: number }[] =
        data?.result?.token_accounts || [];
      totalHolders = data?.result?.total || accounts.length;

      const sorted = accounts
        .map((a) => ({
          owner: a.owner,
          amount: a.amount / Math.pow(10, TOKEN_DECIMALS),
        }))
        .sort((a, b) => b.amount - a.amount);

      const idx = sorted.findIndex((a) => a.owner === wallet);
      if (idx !== -1) {
        rank = idx + 1;
        balance = sorted[idx].amount;
      }
    } catch {
      // fallback: balance stays 0
    }
  }

  const tier = getTier(balance);
  const pct = ((balance / TOTAL_SUPPLY) * 100).toFixed(4);
  const truncated = `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "600px",
          height: "340px",
          backgroundColor: "#0A0A0F",
          border: "2px solid #1A1525",
          borderRadius: "24px",
          padding: "32px",
          fontFamily: "Georgia, serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Gradient accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: `linear-gradient(90deg, ${tier.color}, #B8A9D4)`,
            display: "flex",
          }}
        />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "28px" }}>{tier.emoji}</span>
            <span style={{ fontSize: "22px", color: tier.color, fontWeight: "bold" }}>
              {tier.name}
            </span>
          </div>
          <span style={{ fontSize: "14px", color: "#8B8B9E" }}>BACKLOT</span>
        </div>

        {/* Wallet */}
        <div style={{ marginTop: "20px", display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "12px", color: "#8B8B9E", letterSpacing: "2px" }}>
            WALLET
          </span>
          <span style={{ fontSize: "18px", color: "#F5F5F5", marginTop: "4px" }}>
            {truncated}
          </span>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            marginTop: "24px",
            gap: "32px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "12px", color: "#8B8B9E", letterSpacing: "2px" }}>
              HOLDINGS
            </span>
            <span style={{ fontSize: "28px", color: "#F5F5F5", fontWeight: "bold", marginTop: "4px" }}>
              {formatBalance(balance)}
            </span>
          </div>

          {rank > 0 && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "12px", color: "#8B8B9E", letterSpacing: "2px" }}>
                RANK
              </span>
              <span style={{ fontSize: "28px", color: "#C5A644", fontWeight: "bold", marginTop: "4px" }}>
                #{rank}
              </span>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "12px", color: "#8B8B9E", letterSpacing: "2px" }}>
              SUPPLY %
            </span>
            <span style={{ fontSize: "28px", color: "#B8A9D4", fontWeight: "bold", marginTop: "4px" }}>
              {pct}%
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "auto",
          }}
        >
          <span style={{ fontSize: "12px", color: "#8B8B9E" }}>
            backlotsocial.xyz
          </span>
          <span style={{ fontSize: "12px", color: "#8B8B9E" }}>
            {totalHolders > 0 ? `${totalHolders} holders` : ""}
          </span>
        </div>
      </div>
    ),
    {
      width: 600,
      height: 340,
    }
  );
}
