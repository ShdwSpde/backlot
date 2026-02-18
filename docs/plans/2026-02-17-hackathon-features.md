# Hackathon Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 8 competition-winning features to the Backlot platform for the pump.fun Build In Public Hackathon ($250K prize).

**Architecture:** Each feature is a self-contained addition to the existing Next.js 14 App Router + Supabase + Solana stack. Features 1-6 are independent. Feature 7 depends on the voting system (Feature 5). Feature 8 extends milestones.

**Tech Stack:** Next.js 14, Supabase, @solana/web3.js, @solana/actions, @metaplex-foundation/mpl-bubblegum + Umi, Jupiter Terminal (script tag), Solana Pay, Tailwind CSS, Framer Motion

**Token:** $BACKLOT — `DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump`

---

## Task 1: Jupiter Swap Widget

Embed Jupiter Terminal as an in-app swap modal so users can buy $BACKLOT without leaving the site.

**Files:**
- Create: `components/swap/JupiterSwapButton.tsx`
- Create: `types/jupiter.d.ts`
- Modify: `components/home/TokenCTA.tsx`
- Modify: `app/layout.tsx`

**Step 1: Create Jupiter type declarations**

Create `types/jupiter.d.ts`:

```typescript
interface JupiterTerminal {
  init: (config: {
    displayMode?: "integrated" | "modal" | "widget";
    integratedTargetId?: string;
    endpoint?: string;
    formProps?: {
      initialInputMint?: string;
      initialOutputMint?: string;
      fixedOutputMint?: boolean;
    };
    enableWalletPassthrough?: boolean;
    passthroughWalletContextState?: unknown;
    onSuccess?: (data: { txid: string }) => void;
    onSwapError?: (error: unknown) => void;
  }) => void;
  close: () => void;
  resume: () => void;
}

interface Window {
  Jupiter?: JupiterTerminal;
}
```

**Step 2: Create JupiterSwapButton component**

Create `components/swap/JupiterSwapButton.tsx`:

```tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

const BACKLOT_MINT = "DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump";
const SOL_MINT = "So11111111111111111111111111111111111111112";

export default function JupiterSwapButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [loaded, setLoaded] = useState(false);
  const wallet = useWallet();

  useEffect(() => {
    if (document.getElementById("jupiter-terminal-script")) {
      setLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "jupiter-terminal-script";
    script.src = "https://terminal.jup.ag/main-v3.js";
    script.async = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, []);

  const openSwap = useCallback(() => {
    if (!window.Jupiter || !loaded) return;
    window.Jupiter.init({
      displayMode: "modal",
      endpoint:
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
        "https://api.mainnet-beta.solana.com",
      formProps: {
        initialInputMint: SOL_MINT,
        initialOutputMint: BACKLOT_MINT,
        fixedOutputMint: true,
      },
      enableWalletPassthrough: true,
      passthroughWalletContextState: wallet,
    });
  }, [loaded, wallet]);

  return (
    <button onClick={openSwap} className={className} disabled={!loaded}>
      {children}
    </button>
  );
}
```

**Step 3: Update TokenCTA to use Jupiter swap**

In `components/home/TokenCTA.tsx`, replace the existing `<a href="https://pump.fun/...">Buy on Pump.fun</a>` link with:

```tsx
import JupiterSwapButton from "@/components/swap/JupiterSwapButton";

// Replace the existing anchor tag inside the flex-wrap div:
<JupiterSwapButton className="inline-flex items-center rounded-lg bg-backlot-gold px-8 py-3 font-medium text-backlot-bg transition hover:bg-backlot-gold/90">
  Swap for $BACKLOT
</JupiterSwapButton>
<a
  href="https://pump.fun/coin/DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump"
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center rounded-lg border border-backlot-gold/30 px-8 py-3 font-medium text-backlot-gold transition hover:bg-backlot-gold/10"
>
  View on Pump.fun
</a>
```

**Step 4: Build and verify**

Run: `npm run build`
Expected: Build succeeds with no errors.

**Step 5: Commit**

```bash
git add types/jupiter.d.ts components/swap/JupiterSwapButton.tsx components/home/TokenCTA.tsx
git commit -m "feat: add Jupiter Terminal swap widget for in-app $BACKLOT purchases"
```

---

## Task 2: Solana Blinks / Actions — Vote from Twitter

Create Solana Actions API routes so polls can be shared as Blinks on Twitter/X. Users can vote directly from their feed.

**Files:**
- Create: `public/actions.json`
- Create: `app/api/actions/vote/route.ts`
- Create: `lib/actions.ts`

**Step 1: Create actions.json for Blink discovery**

Create `public/actions.json`:

```json
{
  "rules": [
    { "pathPattern": "/api/actions/**", "apiPath": "/api/actions/**" }
  ]
}
```

**Step 2: Create action helpers**

Create `lib/actions.ts`:

```typescript
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export const ACTIONS_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, Content-Encoding, Accept-Encoding, X-Accept-Action-Version, X-Accept-Blockchain",
  "Content-Type": "application/json",
};

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://backlot.vercel.app";
```

**Step 3: Create the vote Blink API route**

Create `app/api/actions/vote/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { ACTIONS_CORS_HEADERS, SITE_URL } from "@/lib/actions";
import { supabase } from "@/lib/supabase";

// GET — return action metadata + poll options as linked actions
export async function GET(req: NextRequest) {
  const pollId = req.nextUrl.searchParams.get("pollId");

  if (!pollId) {
    return NextResponse.json(
      { error: "pollId required" },
      { status: 400, headers: ACTIONS_CORS_HEADERS }
    );
  }

  const { data: poll } = await supabase
    .from("polls")
    .select("*, options:poll_options(*)")
    .eq("id", pollId)
    .single();

  if (!poll) {
    return NextResponse.json(
      { error: "Poll not found" },
      { status: 404, headers: ACTIONS_CORS_HEADERS }
    );
  }

  const actions = (poll.options || []).map(
    (opt: { id: string; label: string }) => ({
      label: opt.label,
      href: `${SITE_URL}/api/actions/vote?pollId=${pollId}&optionId=${opt.id}`,
    })
  );

  return NextResponse.json(
    {
      icon: `${SITE_URL}/brand/banner.jpeg`,
      title: `BACKLOT Vote: ${poll.title}`,
      description:
        poll.description || "Vote on what happens next in the Backlot experiment.",
      label: "Vote",
      links: { actions },
    },
    { headers: ACTIONS_CORS_HEADERS }
  );
}

// POST — build and return the vote transaction (Memo program)
export async function POST(req: NextRequest) {
  const pollId = req.nextUrl.searchParams.get("pollId");
  const optionId = req.nextUrl.searchParams.get("optionId");

  if (!pollId || !optionId) {
    return NextResponse.json(
      { error: "pollId and optionId required" },
      { status: 400, headers: ACTIONS_CORS_HEADERS }
    );
  }

  const body = await req.json();
  const account = new PublicKey(body.account);

  // Fetch poll & option for memo text
  const { data: option } = await supabase
    .from("poll_options")
    .select("label, poll_id")
    .eq("id", optionId)
    .single();

  const { data: poll } = await supabase
    .from("polls")
    .select("title")
    .eq("id", pollId)
    .single();

  const memoText = JSON.stringify({
    type: "backlot_vote",
    poll: pollId,
    option: optionId,
    label: option?.label || "",
  });

  const MEMO_PROGRAM_ID = new PublicKey(
    "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
  );

  const connection = new Connection(
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
      "https://api.mainnet-beta.solana.com"
  );
  const { blockhash } = await connection.getLatestBlockhash();

  const tx = new Transaction();
  tx.recentBlockhash = blockhash;
  tx.feePayer = account;
  tx.add(
    new TransactionInstruction({
      programId: MEMO_PROGRAM_ID,
      keys: [{ pubkey: account, isSigner: true, isWritable: false }],
      data: Buffer.from(memoText),
    })
  );

  const serialized = tx
    .serialize({ requireAllSignatures: false })
    .toString("base64");

  // Record the vote in Supabase
  const walletAddr = account.toBase58();
  const { data: vote } = await supabase
    .from("votes")
    .insert({
      poll_id: pollId,
      option_id: optionId,
      wallet_address: walletAddr,
      tier_at_vote: "supporter",
    })
    .select()
    .single();

  if (vote) {
    await supabase
      .from("poll_options")
      .update({
        vote_count:
          ((
            await supabase
              .from("poll_options")
              .select("vote_count")
              .eq("id", optionId)
              .single()
          ).data?.vote_count || 0) + 1,
      })
      .eq("id", optionId);

    await supabase.from("vote_receipts").insert({
      vote_id: vote.id,
      wallet_address: walletAddr,
      poll_title: poll?.title || "",
      option_label: option?.label || "",
    });
  }

  return NextResponse.json(
    {
      transaction: serialized,
      message: `Voted: ${option?.label || "recorded"} on "${poll?.title || "poll"}"`,
    },
    { headers: ACTIONS_CORS_HEADERS }
  );
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: ACTIONS_CORS_HEADERS });
}
```

**Step 4: Build and verify**

Run: `npm run build`
Expected: Build succeeds.

**Step 5: Commit**

```bash
git add public/actions.json lib/actions.ts app/api/actions/vote/route.ts
git commit -m "feat: add Solana Actions/Blinks API for voting from Twitter"
```

---

## Task 3: cNFT Vote Receipts with Metaplex Bubblegum

Mint compressed NFTs as on-chain vote receipts after each vote. Uses Metaplex Bubblegum + Umi framework.

**Files:**
- Create: `app/api/mint-vote-receipt/route.ts`
- Create: `lib/umi.ts`
- Modify: `components/vote/PollCard.tsx` (add mint trigger after vote)
- Modify: `components/vote/VoteReceiptBanner.tsx` (show mint status)

**Step 1: Install Metaplex packages**

```bash
npm install @metaplex-foundation/umi @metaplex-foundation/umi-bundle-defaults @metaplex-foundation/mpl-bubblegum @metaplex-foundation/mpl-token-metadata @metaplex-foundation/umi-web3js-adapters
```

**Step 2: Create Umi setup helper**

Create `lib/umi.ts`:

```typescript
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplBubblegum } from "@metaplex-foundation/mpl-bubblegum";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

export function createServerUmi() {
  const endpoint =
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
    "https://api.mainnet-beta.solana.com";

  return createUmi(endpoint)
    .use(mplBubblegum())
    .use(mplTokenMetadata());
}
```

**Step 3: Create the mint API route**

Create `app/api/mint-vote-receipt/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createServerUmi } from "@/lib/umi";
import { mintV1 } from "@metaplex-foundation/mpl-bubblegum";
import {
  createSignerFromKeypair,
  publicKey,
  generateSigner,
} from "@metaplex-foundation/umi";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { voteId, walletAddress, pollTitle, optionLabel } = await req.json();

    if (!voteId || !walletAddress || !pollTitle) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const treeAddress = process.env.BUBBLEGUM_TREE_ADDRESS;
    const treeAuthorityKey = process.env.BUBBLEGUM_TREE_AUTHORITY_SECRET;

    // If no tree is configured, record as pending and return
    if (!treeAddress || !treeAuthorityKey) {
      await supabase
        .from("vote_receipts")
        .update({ mint_address: "pending_tree_setup" })
        .eq("vote_id", voteId);

      return NextResponse.json({
        success: true,
        status: "pending",
        message: "cNFT minting pending — Merkle tree not configured yet",
      });
    }

    const umi = createServerUmi();

    // Import tree authority keypair
    const secretKey = Uint8Array.from(JSON.parse(treeAuthorityKey));
    const treeAuthorityKeypair = umi.eddsa.createKeypairFromSecretKey(secretKey);
    const treeAuthority = createSignerFromKeypair(umi, treeAuthorityKeypair);
    umi.use({ install(umi) { umi.identity = treeAuthority; umi.payer = treeAuthority; } });

    const metadata = {
      name: `BACKLOT Vote: ${pollTitle.slice(0, 20)}`,
      symbol: "BVOTE",
      uri: "",
      sellerFeeBasisPoints: 0,
      collection: null,
      creators: [
        {
          address: treeAuthority.publicKey,
          verified: true,
          share: 100,
        },
      ],
    };

    const { signature } = await mintV1(umi, {
      leafOwner: publicKey(walletAddress),
      merkleTree: publicKey(treeAddress),
      metadata,
    }).sendAndConfirm(umi);

    const mintSig = Buffer.from(signature).toString("base64");

    // Update the vote receipt with mint info
    await supabase
      .from("vote_receipts")
      .update({ mint_address: mintSig })
      .eq("vote_id", voteId);

    return NextResponse.json({
      success: true,
      status: "minted",
      signature: mintSig,
    });
  } catch (error) {
    console.error("cNFT mint error:", error);
    return NextResponse.json(
      { error: "Minting failed", details: String(error) },
      { status: 500 }
    );
  }
}
```

**Step 4: Update PollCard to trigger mint after vote**

In `components/vote/PollCard.tsx`, add a mint call after the vote is recorded. After the `setVotedOptionId(optionId)` line inside `handleVote`, add:

```typescript
// Trigger cNFT mint in background
fetch("/api/mint-vote-receipt", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    voteId: vote.id,
    walletAddress: walletAddr,
    pollTitle: poll.title,
    optionLabel: option?.label || "",
  }),
}).catch(console.error);
```

**Step 5: Update VoteReceiptBanner to show mint status**

In `components/vote/VoteReceiptBanner.tsx`, update the receipt display to show whether the cNFT has been minted. Change the receipt chip to include mint status:

```tsx
{receipts.map((r) => (
  <div key={r.id} className="rounded-lg border border-white/5 bg-backlot-surface px-3 py-1.5 text-xs">
    <span className="text-backlot-text">{r.poll_title}</span>
    <span className="mx-1 text-backlot-muted">&middot;</span>
    <span className="text-backlot-lavender">{r.option_label}</span>
    {r.mint_address && r.mint_address !== "pending_tree_setup" && (
      <span className="ml-1 text-backlot-tropical" title={r.mint_address}>✓ minted</span>
    )}
  </div>
))}
```

**Step 6: Build and verify**

Run: `npm run build`
Expected: Build succeeds.

**Step 7: Commit**

```bash
git add lib/umi.ts app/api/mint-vote-receipt/route.ts components/vote/PollCard.tsx components/vote/VoteReceiptBanner.tsx types/jupiter.d.ts
git commit -m "feat: add cNFT vote receipt minting via Metaplex Bubblegum"
```

---

## Task 4: Live Token Dashboard

Show real-time $BACKLOT token stats — price, market cap, 24h volume, holders count.

**Files:**
- Create: `app/api/token-stats/route.ts`
- Create: `components/dashboard/TokenDashboard.tsx`
- Modify: `app/page.tsx` (add dashboard section)

**Step 1: Create token stats API route**

Create `app/api/token-stats/route.ts`:

```typescript
import { NextResponse } from "next/server";

const BACKLOT_MINT = "DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump";

export const revalidate = 30; // Cache for 30 seconds

export async function GET() {
  try {
    // Fetch price data from Jupiter price API
    const priceRes = await fetch(
      `https://api.jup.ag/price/v2?ids=${BACKLOT_MINT}`,
      { next: { revalidate: 30 } }
    );
    const priceData = await priceRes.json();
    const tokenPrice = priceData?.data?.[BACKLOT_MINT]?.price || 0;

    // Fetch token info from Helius DAS (or fallback)
    let holders = 0;
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
      // Helius unavailable, continue with defaults
    }

    const marketCap = tokenPrice * (supply / 1e6); // Adjust decimals

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
```

**Step 2: Create TokenDashboard component**

Create `components/dashboard/TokenDashboard.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, Coins, BarChart3 } from "lucide-react";

interface TokenStats {
  price: number;
  marketCap: number;
  holders: number;
  supply: number;
  lastUpdated: string | null;
}

function StatCard({
  label,
  value,
  icon: Icon,
  delay,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="rounded-xl border border-white/5 bg-backlot-surface p-4"
    >
      <div className="flex items-center gap-2 text-backlot-muted">
        <Icon size={14} />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-2 font-serif text-2xl text-backlot-text">{value}</p>
    </motion.div>
  );
}

export default function TokenDashboard() {
  const [stats, setStats] = useState<TokenStats | null>(null);

  useEffect(() => {
    const fetchStats = () =>
      fetch("/api/token-stats")
        .then((r) => r.json())
        .then(setStats)
        .catch(console.error);

    fetchStats();
    const interval = setInterval(fetchStats, 30_000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (p: number) =>
    p < 0.01
      ? `$${p.toFixed(6)}`
      : p < 1
        ? `$${p.toFixed(4)}`
        : `$${p.toFixed(2)}`;

  const formatMcap = (m: number) =>
    m >= 1_000_000
      ? `$${(m / 1_000_000).toFixed(1)}M`
      : m >= 1_000
        ? `$${(m / 1_000).toFixed(1)}K`
        : `$${m.toFixed(0)}`;

  if (!stats) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-backlot-surface"
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-xl text-backlot-text">
          $BACKLOT Dashboard
        </h2>
        {stats.lastUpdated && (
          <span className="text-xs text-backlot-muted">
            Updated {new Date(stats.lastUpdated).toLocaleTimeString()}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Price"
          value={formatPrice(stats.price)}
          icon={TrendingUp}
          delay={0}
        />
        <StatCard
          label="Market Cap"
          value={formatMcap(stats.marketCap)}
          icon={BarChart3}
          delay={0.1}
        />
        <StatCard
          label="Holders"
          value={stats.holders > 0 ? stats.holders.toLocaleString() : "—"}
          icon={Users}
          delay={0.2}
        />
        <StatCard
          label="Supply"
          value={
            stats.supply > 0
              ? `${(stats.supply / 1e6).toFixed(0)}M`
              : "—"
          }
          icon={Coins}
          delay={0.3}
        />
      </div>
    </section>
  );
}
```

**Step 3: Add TokenDashboard to home page**

In `app/page.tsx`, add `TokenDashboard` between `Hero` and `FeaturedEpisode`:

```tsx
import Hero from "@/components/home/Hero";
import TokenDashboard from "@/components/dashboard/TokenDashboard";
import FeaturedEpisode from "@/components/home/FeaturedEpisode";
import MilestonePreview from "@/components/home/MilestonePreview";
import SpotlightWall from "@/components/community/SpotlightWall";
import TokenCTA from "@/components/home/TokenCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TokenDashboard />
      <FeaturedEpisode />
      <MilestonePreview />
      <SpotlightWall />
      <TokenCTA />
    </>
  );
}
```

**Step 4: Build and verify**

Run: `npm run build`
Expected: Build succeeds.

**Step 5: Commit**

```bash
git add app/api/token-stats/route.ts components/dashboard/TokenDashboard.tsx app/page.tsx
git commit -m "feat: add live token dashboard with price, market cap, and supply"
```

---

## Task 5: Token-Weighted Voting

Upgrade the voting system so each holder's vote is weighted by their $BACKLOT balance. Show weighted totals in poll results.

**Files:**
- Modify: `supabase/schema.sql` (add `weight` column to votes, `weighted_count` to poll_options)
- Modify: `components/vote/PollCard.tsx` (send balance, display weighted results)
- Modify: `hooks/useBacklotTier.ts` (export balance)

**Step 1: Update schema**

Add to `supabase/schema.sql`:

```sql
-- Add weight tracking
ALTER TABLE votes ADD COLUMN weight numeric DEFAULT 1;
ALTER TABLE poll_options ADD COLUMN weighted_count numeric DEFAULT 0;
```

**Step 2: Update PollCard to send balance and use weighted counts**

In `components/vote/PollCard.tsx`, make these changes:

1. Import and use balance from `useBacklotTier`:
```typescript
const { tier, balance } = useBacklotTier();
```

2. Add `weighted_count` to the PollOption display. Update the type at the top (or extend it inline) and the percentage calculation:
```typescript
// Compute total from weighted_count if available, else vote_count
const totalWeighted = options.reduce((sum, o) => sum + ((o as any).weighted_count || o.vote_count), 0);
```

3. In `handleVote`, include the weight in the vote insert:
```typescript
const { data: vote, error } = await supabase
  .from("votes")
  .insert({
    poll_id: poll.id,
    option_id: optionId,
    wallet_address: walletAddr,
    tier_at_vote: tier,
    weight: Math.max(balance, 1),
  })
  .select()
  .single();
```

4. After incrementing `vote_count`, also update `weighted_count`:
```typescript
if (!error && vote) {
  const currentOption = options.find((o) => o.id === optionId);
  await supabase
    .from("poll_options")
    .update({
      vote_count: (currentOption?.vote_count || 0) + 1,
      weighted_count: ((currentOption as any)?.weighted_count || 0) + Math.max(balance, 1),
    })
    .eq("id", optionId);
  // ... rest of receipt creation
}
```

5. Update the percentage display to show weighted:
```typescript
const pct = totalWeighted > 0 ? (((option as any).weighted_count || option.vote_count) / totalWeighted) * 100 : 0;
```

6. Update the total votes display at the bottom:
```tsx
<span>{totalVotes} votes ({totalWeighted.toLocaleString()} weighted)</span>
```

**Step 3: Update the Supabase realtime subscription to also track weighted_count**

In the `useEffect` for realtime in `PollCard.tsx`, update the payload handler:
```typescript
(payload) => {
  setOptions((prev) =>
    prev.map((o) =>
      o.id === payload.new.id
        ? { ...o, vote_count: payload.new.vote_count, weighted_count: payload.new.weighted_count }
        : o
    )
  );
}
```

**Step 4: Build and verify**

Run: `npm run build`
Expected: Build succeeds.

**Step 5: Commit**

```bash
git add supabase/schema.sql components/vote/PollCard.tsx
git commit -m "feat: add token-weighted voting — votes scale with $BACKLOT holdings"
```

---

## Task 6: Pump.fun Stream Embed

Replace the placeholder stream component with a real pump.fun native stream embed.

**Files:**
- Modify: `components/live/StreamEmbed.tsx`

**Step 1: Update StreamEmbed with pump.fun iframe**

Replace the entire content of `components/live/StreamEmbed.tsx`:

```tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const PUMP_STREAM_URL =
  "https://pump.fun/coin/DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump";

export default function StreamEmbed() {
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-xl border border-white/5"
    >
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-red-600/90 px-3 py-1 text-xs font-bold text-white">
        <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
        LIVE
      </div>

      <div className="aspect-video w-full bg-backlot-surface">
        <iframe
          src={PUMP_STREAM_URL}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setLoaded(true)}
          title="BACKLOT Live Stream"
        />

        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-backlot-surface">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-backlot-lavender border-t-transparent" />
            <p className="text-sm text-backlot-muted">Loading stream...</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-white/5 bg-backlot-surface/50 px-4 py-2">
        <span className="text-xs text-backlot-muted">
          Streaming from Portland, Jamaica
        </span>
        <a
          href={PUMP_STREAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-backlot-lavender hover:underline"
        >
          Open on pump.fun ↗
        </a>
      </div>
    </motion.div>
  );
}
```

**Step 2: Build and verify**

Run: `npm run build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add components/live/StreamEmbed.tsx
git commit -m "feat: replace stream placeholder with pump.fun native embed"
```

---

## Task 7: Holder Leaderboard + Participation Score

Gamification system that scores holders by participation (voting, chat, attendance) WITHOUT revealing token balances. Incentivizes positive interactions.

**Files:**
- Create: `app/api/leaderboard/route.ts`
- Create: `components/leaderboard/Leaderboard.tsx`
- Create: `app/leaderboard/page.tsx`
- Modify: `supabase/schema.sql` (add participation_scores table)
- Modify: `components/Navbar.tsx` (add leaderboard link)

**Step 1: Add participation_scores table to schema**

Add to `supabase/schema.sql`:

```sql
-- Participation scoring
CREATE TABLE participation_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL UNIQUE,
  display_name text,
  votes_cast integer DEFAULT 0,
  polls_participated integer DEFAULT 0,
  chat_messages_sent integer DEFAULT 0,
  days_holding integer DEFAULT 0,
  cnft_receipts integer DEFAULT 0,
  total_score integer DEFAULT 0,
  tier text DEFAULT 'viewer',
  updated_at timestamptz DEFAULT now()
);

-- Score weights:
-- Each vote cast: +10 points
-- Each unique poll participated: +25 points
-- Each chat message: +2 points
-- Each day holding: +5 points
-- Each cNFT receipt: +15 points

ALTER PUBLICATION supabase_realtime ADD TABLE participation_scores;
```

**Step 2: Create leaderboard API route**

Create `app/api/leaderboard/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");

  // Recalculate scores from source tables
  // In production this would be a Supabase function/trigger,
  // but for the hackathon we compute on-the-fly

  // Get all unique wallets that have participated
  const { data: voters } = await supabase
    .from("votes")
    .select("wallet_address");

  const { data: chatters } = await supabase
    .from("chat_messages")
    .select("wallet_address");

  const wallets = new Set<string>();
  (voters || []).forEach((v) => wallets.add(v.wallet_address));
  (chatters || []).forEach((c) => wallets.add(c.wallet_address));

  const scores: Record<string, {
    wallet_address: string;
    votes_cast: number;
    polls_participated: number;
    chat_messages_sent: number;
    cnft_receipts: number;
    total_score: number;
    tier: string;
  }> = {};

  // Count votes per wallet
  for (const w of wallets) {
    const { count: voteCount } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("wallet_address", w);

    const { data: uniquePolls } = await supabase
      .from("votes")
      .select("poll_id")
      .eq("wallet_address", w);

    const pollsParticipated = new Set(
      (uniquePolls || []).map((p) => p.poll_id)
    ).size;

    const { count: chatCount } = await supabase
      .from("chat_messages")
      .select("*", { count: "exact", head: true })
      .eq("wallet_address", w);

    const { count: receiptCount } = await supabase
      .from("vote_receipts")
      .select("*", { count: "exact", head: true })
      .eq("wallet_address", w);

    const totalScore =
      (voteCount || 0) * 10 +
      pollsParticipated * 25 +
      (chatCount || 0) * 2 +
      (receiptCount || 0) * 15;

    scores[w] = {
      wallet_address: w,
      votes_cast: voteCount || 0,
      polls_participated: pollsParticipated,
      chat_messages_sent: chatCount || 0,
      cnft_receipts: receiptCount || 0,
      total_score: totalScore,
      tier: "supporter",
    };
  }

  const leaderboard = Object.values(scores)
    .sort((a, b) => b.total_score - a.total_score)
    .slice(0, 50);

  // If wallet specified, find their rank
  let myRank = null;
  if (wallet) {
    const allSorted = Object.values(scores).sort(
      (a, b) => b.total_score - a.total_score
    );
    const idx = allSorted.findIndex((s) => s.wallet_address === wallet);
    if (idx >= 0) {
      myRank = { rank: idx + 1, ...allSorted[idx] };
    }
  }

  return NextResponse.json({ leaderboard, myRank });
}
```

**Step 3: Create Leaderboard component**

Create `components/leaderboard/Leaderboard.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { Trophy, Vote, MessageSquare, Award, Flame } from "lucide-react";

interface LeaderboardEntry {
  wallet_address: string;
  votes_cast: number;
  polls_participated: number;
  chat_messages_sent: number;
  cnft_receipts: number;
  total_score: number;
}

interface MyRank extends LeaderboardEntry {
  rank: number;
}

function truncateWallet(addr: string) {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

function ScoreBadge({ score }: { score: number }) {
  if (score >= 500) return <span className="text-backlot-gold">🏆 Legend</span>;
  if (score >= 200) return <span className="text-backlot-tropical">⚡ Power Player</span>;
  if (score >= 50) return <span className="text-backlot-lavender">✨ Active</span>;
  return <span className="text-backlot-muted">🌱 Newcomer</span>;
}

export default function Leaderboard() {
  const { publicKey } = useWallet();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<MyRank | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const wallet = publicKey?.toBase58() || "";
    fetch(`/api/leaderboard${wallet ? `?wallet=${wallet}` : ""}`)
      .then((r) => r.json())
      .then((data) => {
        setEntries(data.leaderboard || []);
        setMyRank(data.myRank || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [publicKey]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-backlot-surface" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* My rank card */}
      {myRank && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl border border-backlot-gold/20 bg-gradient-to-r from-backlot-gold/5 to-transparent p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-backlot-muted">Your Rank</p>
              <p className="font-serif text-2xl text-backlot-gold">
                #{myRank.rank}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-backlot-muted">Participation Score</p>
              <p className="font-serif text-2xl text-backlot-text">
                {myRank.total_score}
              </p>
            </div>
          </div>
          <div className="mt-3 flex gap-4 text-xs text-backlot-muted">
            <span className="flex items-center gap-1">
              <Vote size={12} /> {myRank.votes_cast} votes
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare size={12} /> {myRank.chat_messages_sent} chats
            </span>
            <span className="flex items-center gap-1">
              <Award size={12} /> {myRank.cnft_receipts} receipts
            </span>
          </div>
        </motion.div>
      )}

      {/* How scoring works */}
      <div className="mb-6 rounded-xl border border-white/5 bg-backlot-surface/50 p-4">
        <h3 className="flex items-center gap-2 text-sm font-medium text-backlot-text">
          <Flame size={14} className="text-backlot-gold" /> How Scoring Works
        </h3>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-backlot-muted">
          <span>Vote on a poll: +10</span>
          <span>New poll participated: +25</span>
          <span>Chat message: +2</span>
          <span>cNFT receipt earned: +15</span>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-2">
        {entries.map((entry, i) => (
          <motion.div
            key={entry.wallet_address}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`flex items-center justify-between rounded-xl border p-4 ${
              publicKey?.toBase58() === entry.wallet_address
                ? "border-backlot-gold/30 bg-backlot-gold/5"
                : "border-white/5 bg-backlot-surface"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  i === 0
                    ? "bg-backlot-gold/20 text-backlot-gold"
                    : i === 1
                      ? "bg-gray-400/20 text-gray-300"
                      : i === 2
                        ? "bg-amber-700/20 text-amber-600"
                        : "bg-white/5 text-backlot-muted"
                }`}
              >
                {i + 1}
              </span>
              <div>
                <p className="text-sm text-backlot-text">
                  {truncateWallet(entry.wallet_address)}
                </p>
                <p className="text-xs">
                  <ScoreBadge score={entry.total_score} />
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-serif text-lg text-backlot-text">
                {entry.total_score}
              </p>
              <p className="text-xs text-backlot-muted">points</p>
            </div>
          </motion.div>
        ))}
        {entries.length === 0 && (
          <p className="text-center text-backlot-muted py-8">
            No participation yet. Be the first to vote, chat, or engage!
          </p>
        )}
      </div>
    </div>
  );
}
```

**Step 4: Create leaderboard page**

Create `app/leaderboard/page.tsx`:

```tsx
import Leaderboard from "@/components/leaderboard/Leaderboard";
import { Trophy } from "lucide-react";

export default function LeaderboardPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 font-serif text-3xl text-backlot-text md:text-4xl">
          <Trophy className="text-backlot-gold" /> Leaderboard
        </h1>
        <p className="mt-2 text-backlot-muted">
          The most active participants in the Backlot experiment. Score is based
          on engagement — voting, chatting, and showing up. No token counts.
          Just action.
        </p>
      </div>
      <Leaderboard />
    </div>
  );
}
```

**Step 5: Add leaderboard to Navbar**

In `components/Navbar.tsx`, add to the `links` array:

```typescript
const links = [
  { href: "/", label: "Home" },
  { href: "/live", label: "Live", badge: true },
  { href: "/episodes", label: "Episodes" },
  { href: "/vote", label: "Vote" },
  { href: "/leaderboard", label: "Board" },
  { href: "/backstage", label: "Backstage" },
  { href: "/about", label: "About" },
];
```

**Step 6: Build and verify**

Run: `npm run build`
Expected: Build succeeds.

**Step 7: Commit**

```bash
git add supabase/schema.sql app/api/leaderboard/route.ts components/leaderboard/Leaderboard.tsx app/leaderboard/page.tsx components/Navbar.tsx
git commit -m "feat: add holder leaderboard with gamified participation scoring"
```

---

## Task 8: Milestone Funding with Solana Pay

Add QR codes and direct SOL contributions to milestones using Solana Pay.

**Files:**
- Create: `components/milestones/FundMilestone.tsx`
- Create: `app/api/fund-milestone/route.ts`
- Modify: `components/milestones/MilestoneTracker.tsx` (add fund button)
- Modify: `supabase/schema.sql` (add contributions table)

**Step 1: Install Solana Pay**

```bash
npm install @solana/pay @solana/spl-token bignumber.js
```

**Step 2: Add contributions table to schema**

Add to `supabase/schema.sql`:

```sql
-- Milestone contributions
CREATE TABLE milestone_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid REFERENCES milestones(id) ON DELETE CASCADE,
  wallet_address text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'SOL',
  tx_signature text,
  created_at timestamptz DEFAULT now()
);
```

**Step 3: Create the fund milestone API route**

Create `app/api/fund-milestone/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { supabase } from "@/lib/supabase";

const TREASURY_WALLET = new PublicKey(
  process.env.NEXT_PUBLIC_TREASURY_WALLET || "11111111111111111111111111111112"
);

export async function POST(req: NextRequest) {
  try {
    const { milestoneId, amount, walletAddress } = await req.json();

    if (!milestoneId || !amount || !walletAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
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
```

**Step 4: Create FundMilestone component**

Create `components/milestones/FundMilestone.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const AMOUNTS = [0.01, 0.05, 0.1, 0.5];

export default function FundMilestone({
  milestoneId,
  milestoneTitle,
}: {
  milestoneId: string;
  milestoneTitle: string;
}) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [open, setOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(AMOUNTS[0]);
  const [status, setStatus] = useState<
    "idle" | "signing" | "confirming" | "done" | "error"
  >("idle");

  const handleFund = async () => {
    if (!publicKey) return;

    setStatus("signing");
    try {
      const res = await fetch("/api/fund-milestone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestoneId,
          amount: selectedAmount,
          walletAddress: publicKey.toBase58(),
        }),
      });

      const { transaction: txBase64 } = await res.json();
      const tx = Transaction.from(Buffer.from(txBase64, "base64"));

      setStatus("confirming");
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, "confirmed");

      // Record contribution
      await supabase.from("milestone_contributions").insert({
        milestone_id: milestoneId,
        wallet_address: publicKey.toBase58(),
        amount: selectedAmount,
        currency: "SOL",
        tx_signature: signature,
      });

      // Update milestone amount
      const { data: milestone } = await supabase
        .from("milestones")
        .select("current_amount")
        .eq("id", milestoneId)
        .single();

      if (milestone) {
        await supabase
          .from("milestones")
          .update({
            current_amount: (milestone.current_amount || 0) + selectedAmount,
          })
          .eq("id", milestoneId);
      }

      setStatus("done");
      setTimeout(() => {
        setStatus("idle");
        setOpen(false);
      }, 2000);
    } catch (error) {
      console.error("Fund error:", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-lg bg-backlot-tropical/10 px-3 py-1.5 text-xs text-backlot-tropical transition hover:bg-backlot-tropical/20"
      >
        <Heart size={12} /> Fund
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <div className="rounded-lg border border-white/5 bg-backlot-bg p-4">
              <p className="text-xs text-backlot-muted mb-3">
                Contribute SOL to &quot;{milestoneTitle}&quot;
              </p>

              <div className="flex gap-2 mb-4">
                {AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setSelectedAmount(amt)}
                    className={`rounded-lg px-3 py-1.5 text-xs transition ${
                      selectedAmount === amt
                        ? "bg-backlot-tropical text-backlot-bg"
                        : "bg-white/5 text-backlot-muted hover:bg-white/10"
                    }`}
                  >
                    {amt} SOL
                  </button>
                ))}
              </div>

              <button
                onClick={handleFund}
                disabled={!publicKey || status !== "idle"}
                className="w-full rounded-lg bg-backlot-tropical px-4 py-2 text-sm font-medium text-backlot-bg transition hover:bg-backlot-tropical/90 disabled:opacity-50"
              >
                {status === "idle" && `Send ${selectedAmount} SOL`}
                {status === "signing" && (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Sign in
                    wallet...
                  </span>
                )}
                {status === "confirming" && (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Confirming...
                  </span>
                )}
                {status === "done" && (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle size={14} /> Funded!
                  </span>
                )}
                {status === "error" && "Failed — try again"}
              </button>

              {!publicKey && (
                <p className="mt-2 text-center text-xs text-backlot-muted">
                  Connect wallet to contribute
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

**Step 5: Add FundMilestone to MilestoneTracker**

In `components/milestones/MilestoneTracker.tsx`, import and add the FundMilestone button next to each active milestone. Find where the milestone status/title is rendered and add:

```tsx
import FundMilestone from "./FundMilestone";

// Inside the milestone map, next to the title or progress bar for active milestones:
{milestone.status === "active" && (
  <FundMilestone
    milestoneId={milestone.id}
    milestoneTitle={milestone.title}
  />
)}
```

**Step 6: Build and verify**

Run: `npm run build`
Expected: Build succeeds.

**Step 7: Commit**

```bash
git add supabase/schema.sql app/api/fund-milestone/route.ts components/milestones/FundMilestone.tsx components/milestones/MilestoneTracker.tsx
git commit -m "feat: add milestone funding with Solana Pay — direct SOL contributions"
```

---

## Post-Implementation

After all 8 tasks are complete:

1. Run `npm run build` to verify everything compiles
2. Push to GitHub: `git push origin main`
3. Deploy to Vercel if configured

**New env vars needed for full functionality:**
```
HELIUS_API_KEY=             # Token dashboard holders count
BUBBLEGUM_TREE_ADDRESS=     # cNFT Merkle tree address
BUBBLEGUM_TREE_AUTHORITY_SECRET=  # Tree authority keypair JSON
NEXT_PUBLIC_SITE_URL=       # For Blinks metadata
NEXT_PUBLIC_TREASURY_WALLET=# SOL contribution destination
```

All features work in demo mode without these env vars — they gracefully degrade with placeholder data or pending states.
