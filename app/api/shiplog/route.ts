import { NextResponse } from "next/server";

export const revalidate = 3600;

interface ShipEntry {
  hash: string;
  message: string;
  date: string;
  type: "feat" | "fix" | "chore" | "sec";
  tags: string[];
}

const SHIP_LOG: ShipEntry[] = [
  // Feb 19, 2026 — Deploy night + domain + community
  { hash: "628d72b", message: "fix: tweet embeds not rendering — race condition in Twitter widget loading", date: "2026-02-19", type: "fix", tags: ["ui", "twitter"] },
  { hash: "a00212c", message: "feat: community spotlight — 3 embedded tweets from @Backlot876", date: "2026-02-19", type: "feat", tags: ["ui", "twitter"] },
  { hash: "b4a63c7", message: "feat: deploy to Vercel with GitHub auto-deploy pipeline", date: "2026-02-19", type: "feat", tags: ["infra", "vercel"] },
  { hash: "treasury", message: "feat: multisig treasury wallet connected — Squads protocol", date: "2026-02-19", type: "feat", tags: ["solana", "security", "transparency"] },
  { hash: "domain1", message: "feat: custom domain backlotsocial.xyz goes live", date: "2026-02-19", type: "feat", tags: ["infra", "dns"] },
  { hash: "e4f2c1a", message: "feat: add transparent treasury page — on-chain holder distribution", date: "2026-02-19", type: "feat", tags: ["solana", "helius", "transparency"] },
  { hash: "b7d3e9f", message: "feat: add live activity feed — real-time votes, chat, and mints", date: "2026-02-19", type: "feat", tags: ["supabase", "realtime", "ui"] },
  { hash: "c1a8f4d", message: "feat: add build-in-public ship log", date: "2026-02-19", type: "feat", tags: ["ui", "transparency"] },
  { hash: "a9e1b3c", message: "sec: security hardening — rate limiting, input validation, key isolation", date: "2026-02-19", type: "sec", tags: ["security", "middleware"] },
  { hash: "d5f7a2e", message: "sec: add security headers — HSTS, X-Frame-Options, CSP", date: "2026-02-19", type: "sec", tags: ["security", "infra"] },
  { hash: "f3c9d1b", message: "fix: holder count was returning 1 — Helius limit param bug", date: "2026-02-19", type: "fix", tags: ["helius", "api"] },
  // Feb 18, 2026
  { hash: "06a6a66", message: "fix: token dashboard now shows real price, mcap, and holders", date: "2026-02-18", type: "fix", tags: ["solana", "dexscreener", "helius"] },
  { hash: "b3fa372", message: "feat: add microanimations to episodes page", date: "2026-02-18", type: "feat", tags: ["ui", "framer-motion"] },
  { hash: "1447ac7", message: "feat: add 20 pump.fun stream episodes to episodes page", date: "2026-02-18", type: "feat", tags: ["content", "pump.fun"] },
  // Feb 17, 2026
  { hash: "bc01c57", message: "feat: add tech group chat + day-in-the-life whimsical pages", date: "2026-02-17", type: "feat", tags: ["ui", "content"] },
  { hash: "eac4008", message: "feat: add pitch page with architecture diagrams + founder dashboard", date: "2026-02-17", type: "feat", tags: ["ui", "pitch"] },
  { hash: "181f897", message: "chore: add hackathon feature dependencies and implementation plan", date: "2026-02-17", type: "chore", tags: ["infra", "planning"] },
  { hash: "94507f0", message: "feat: add milestone funding with Solana Pay — direct SOL contributions", date: "2026-02-17", type: "feat", tags: ["solana", "solana-pay"] },
  { hash: "2d7372f", message: "feat: add token-weighted voting — votes scale with $BACKLOT holdings", date: "2026-02-17", type: "feat", tags: ["solana", "voting"] },
  { hash: "0099384", message: "feat: add holder leaderboard with gamified participation scoring", date: "2026-02-17", type: "feat", tags: ["supabase", "gamification"] },
  // Feb 16, 2026
  { hash: "3536f67", message: "feat: add live token dashboard with price, market cap, and supply", date: "2026-02-16", type: "feat", tags: ["solana", "dexscreener", "ui"] },
  { hash: "286f59b", message: "feat: add cNFT vote receipt minting via Metaplex Bubblegum", date: "2026-02-16", type: "feat", tags: ["solana", "bubblegum", "metaplex"] },
  { hash: "ed25e84", message: "feat: add Solana Actions/Blinks API for voting from Twitter", date: "2026-02-16", type: "feat", tags: ["solana", "blinks"] },
  { hash: "4a280d6", message: "feat: replace stream placeholder with pump.fun native embed", date: "2026-02-16", type: "feat", tags: ["pump.fun", "livestream"] },
  { hash: "7a1fe09", message: "feat: add Jupiter Terminal swap widget for in-app $BACKLOT purchases", date: "2026-02-16", type: "feat", tags: ["solana", "jupiter"] },
  { hash: "a999a96", message: "chore: fix build — add Supabase fallbacks and image remote patterns", date: "2026-02-16", type: "chore", tags: ["infra", "supabase"] },
];

export async function GET() {
  const feats = SHIP_LOG.filter((e) => e.type === "feat").length;
  const fixes = SHIP_LOG.filter((e) => e.type === "fix").length;
  const security = SHIP_LOG.filter((e) => e.type === "sec").length;

  const dates = SHIP_LOG.map((e) => e.date);
  const firstDate = new Date(dates[dates.length - 1]);
  const lastDate = new Date(dates[0]);
  const daysActive = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return NextResponse.json({
    entries: SHIP_LOG,
    stats: {
      totalCommits: SHIP_LOG.length,
      features: feats,
      fixes,
      security,
      daysActive,
    },
  });
}
