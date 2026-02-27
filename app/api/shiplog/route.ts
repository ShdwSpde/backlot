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
  // Feb 27, 2026 — Security audit + hardening
  { hash: "a4cb821", message: "sec: RPC proxy method whitelist — blocks arbitrary JSON-RPC calls, only 18 safe methods allowed", date: "2026-02-27", type: "sec", tags: ["security", "solana", "infra"] },
  { hash: "a4cb821", message: "sec: chat moved server-side — /api/chat with on-chain tier verification and 500-char limit", date: "2026-02-27", type: "sec", tags: ["security", "supabase", "api"] },
  { hash: "a4cb821", message: "sec: milestone funding verified on-chain — /api/fund-milestone/confirm checks SOL transfer before recording", date: "2026-02-27", type: "sec", tags: ["security", "solana", "api"] },
  { hash: "a4cb821", message: "sec: removed Helius API key from client bundle — NEXT_PUBLIC_SOLANA_RPC_URL eliminated", date: "2026-02-27", type: "sec", tags: ["security", "solana", "infra"] },
  { hash: "a4cb821", message: "sec: TX signature replay protection — votes store and enforce unique tx_signature", date: "2026-02-27", type: "sec", tags: ["security", "voting", "solana"] },
  { hash: "a4cb821", message: "sec: mint-receipt auth fail-closed — rejects all requests when INTERNAL_API_SECRET is unset", date: "2026-02-27", type: "sec", tags: ["security", "api"] },
  { hash: "a4cb821", message: "sec: Content-Security-Policy header added — restricts scripts, styles, connects, and frames", date: "2026-02-27", type: "sec", tags: ["security", "infra"] },
  // Feb 26, 2026 — Hackathon polish: governance dashboard + charts + price ticker
  { hash: "gov001a", message: "feat: governance dashboard — voting power, participation stats, vote history table, cNFT gallery", date: "2026-02-26", type: "feat", tags: ["ui", "voting", "governance"] },
  { hash: "gov001b", message: "feat: animated vote result charts — framer-motion horizontal bar chart replaces text results", date: "2026-02-26", type: "feat", tags: ["ui", "framer-motion", "voting"] },
  { hash: "gov001c", message: "feat: live price ticker in navbar — $BACKLOT price + 24h change from DexScreener", date: "2026-02-26", type: "feat", tags: ["ui", "dexscreener", "tokenomics"] },
  { hash: "gov001d", message: "feat: priceChange24h added to /api/token-stats — DexScreener 24h delta", date: "2026-02-26", type: "feat", tags: ["api", "dexscreener"] },
  { hash: "gov001e", message: "feat: tokenomics section on pitch page — tiers, burn mechanics, diamond hands multiplier, voting power formula", date: "2026-02-26", type: "feat", tags: ["ui", "pitch", "tokenomics"] },
  // Feb 26, 2026 — Time-weighted voting + diamond hands
  { hash: "aaff4bd", message: "feat: time-weighted voting — holding duration multiplies vote weight up to 4x", date: "2026-02-26", type: "feat", tags: ["solana", "voting", "tokenomics"] },
  { hash: "aaff4bd", message: "feat: Diamond Hands badge — tiered badge for long-term holders in navbar + polls", date: "2026-02-26", type: "feat", tags: ["ui", "solana", "gamification"] },
  { hash: "aaff4bd", message: "feat: on-chain holding duration lookup — paginated ATA signature history", date: "2026-02-26", type: "feat", tags: ["solana", "spl-token"] },
  { hash: "3cbc845", message: "feat: burn vote tokens — 10 $BACKLOT permanently removed from supply per vote", date: "2026-02-26", type: "feat", tags: ["solana", "voting", "tokenomics"] },
  { hash: "0b58b13", message: "fix: React hydration mismatch on WalletMultiButton — deferred client render", date: "2026-02-26", type: "fix", tags: ["ui", "solana"] },
  { hash: "f1751eb", message: "fix: replace WebSocket TX confirmation with HTTP polling — RPC proxy compatible", date: "2026-02-26", type: "fix", tags: ["solana", "infra"] },
  { hash: "6bac39b", message: "fix: redirect browsers visiting Blink URLs to /vote page", date: "2026-02-26", type: "fix", tags: ["blinks", "ux"] },
  { hash: "45bb2a6", message: "fix: Blinks vote recording + www domain routing", date: "2026-02-26", type: "fix", tags: ["blinks", "infra"] },
  // Feb 26, 2026 — Vote fee + security hardening
  { hash: "826934b", message: "feat: 10 $BACKLOT vote fee — SPL transfer to treasury on every vote", date: "2026-02-26", type: "feat", tags: ["solana", "voting", "treasury"] },
  { hash: "826934b", message: "sec: server-side TX verification — /api/vote validates on-chain before recording", date: "2026-02-26", type: "sec", tags: ["security", "solana", "voting"] },
  { hash: "826934b", message: "sec: Supabase RLS enabled — client anon key restricted to read-only", date: "2026-02-26", type: "sec", tags: ["security", "supabase"] },
  { hash: "826934b", message: "fix: Token-2022 program ID — balance detection and ATA derivation corrected", date: "2026-02-26", type: "fix", tags: ["solana", "spl-token"] },
  { hash: "826934b", message: "feat: Blink share buttons — Copy URL + Share on X for is_blink polls", date: "2026-02-26", type: "feat", tags: ["ui", "blinks", "twitter"] },
  { hash: "6db4ab8", message: "sec: RPC proxy — Helius API key no longer exposed in client bundle", date: "2026-02-26", type: "sec", tags: ["security", "solana", "infra"] },
  { hash: "826934b", message: "fix: treasury ATA auto-creation — idempotent instruction on first vote", date: "2026-02-26", type: "fix", tags: ["solana", "spl-token"] },
  // Feb 24, 2026 — Owner notes + episodes restructure
  { hash: "a887d1d", message: "feat: About link in footer — points to GitHub wiki", date: "2026-02-24", type: "feat", tags: ["ui", "transparency"] },
  { hash: "b560377", message: "feat: Now Casting CTA links to Google Form for founder submissions", date: "2026-02-24", type: "feat", tags: ["ui", "content"] },
  { hash: "853f974", message: "feat: 'Now Casting' idea submission section — open call for Caribbean founders", date: "2026-02-24", type: "feat", tags: ["ui", "content"] },
  { hash: "853f974", message: "feat: episodes restructured into chapters — YouTube preludes + livestreams", date: "2026-02-24", type: "feat", tags: ["ui", "content", "youtube"] },
  { hash: "853f974", message: "feat: treasury labels top wallet as Supply Pool when >50% supply", date: "2026-02-24", type: "feat", tags: ["ui", "transparency", "solana"] },
  { hash: "853f974", message: "fix: verbiage updates across site — owner notes implemented", date: "2026-02-24", type: "fix", tags: ["ui", "content"] },
  // Feb 20, 2026 — Polish + bells & whistles
  { hash: "pw0001a", message: "feat: animated page transitions — smooth fade/slide between routes", date: "2026-02-20", type: "feat", tags: ["ui", "framer-motion"] },
  { hash: "pw0001b", message: "feat: skeleton loading states — shimmering placeholders replace spinners", date: "2026-02-20", type: "feat", tags: ["ui", "ux"] },
  { hash: "pw0001c", message: "feat: PWA install — service worker + manifest for mobile home screen", date: "2026-02-20", type: "feat", tags: ["infra", "pwa"] },
  { hash: "pw0001d", message: "feat: confetti burst on wallet connect — canvas particle animation", date: "2026-02-20", type: "feat", tags: ["ui", "solana"] },
  { hash: "pw0001e", message: "feat: holder rank card generator — /api/card renders personalized PNG", date: "2026-02-20", type: "feat", tags: ["solana", "helius", "og"] },
  { hash: "pw0001f", message: "feat: scroll-triggered counter animations on all dashboards", date: "2026-02-20", type: "feat", tags: ["ui", "framer-motion"] },
  // Feb 20, 2026 — Polish + hardening
  { hash: "1088363", message: "feat: add Backlot logo as favicon + Apple touch icon", date: "2026-02-20", type: "feat", tags: ["ui", "branding"] },
  { hash: "b2c4cd4", message: "feat: Upstash Redis rate limiter — survives deploys", date: "2026-02-20", type: "feat", tags: ["security", "infra", "upstash"] },
  { hash: "b2c4cd4", message: "feat: OG image + Twitter Card meta tags for social sharing", date: "2026-02-20", type: "feat", tags: ["ui", "twitter", "seo"] },
  { hash: "efb3ec1", message: "feat: replace FeaturedEpisode placeholder with real latest episode", date: "2026-02-20", type: "feat", tags: ["ui", "pump.fun"] },
  { hash: "3906531", message: "chore: add hackathon-winning PRD — strategy + priorities doc", date: "2026-02-20", type: "chore", tags: ["planning", "transparency"] },
  { hash: "svckey1", message: "sec: Supabase service role key configured — server-side writes enabled", date: "2026-02-20", type: "sec", tags: ["supabase", "security"] },
  { hash: "siteurl", message: "fix: update SITE_URL to backlotsocial.xyz — Blinks now resolve correctly", date: "2026-02-20", type: "fix", tags: ["solana", "blinks", "infra"] },
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
