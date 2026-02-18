# Backlot App Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the Backlot onchain reality docu-series platform — a token-gated media hub with livestream, episodes, voting, milestone tracking, and community features.

**Architecture:** Monolithic Next.js 14 App Router app with Supabase (Postgres + Realtime) for persistence, Solana Wallet Adapter for wallet auth, and Metaplex Bubblegum for cNFT vote receipts. Single deploy to Vercel.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Supabase, @solana/wallet-adapter, @solana/web3.js, @metaplex-foundation/mpl-bubblegum

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `next.config.js`
- Create: `app/layout.tsx`, `app/globals.css`, `app/page.tsx`
- Create: `.env.local.example`

**Step 1: Create Next.js project with Tailwind**

```bash
cd /Users/spade/Desktop/backlot
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm
```

Note: Since the directory already exists with files, say "yes" to proceed. This creates the App Router structure.

**Step 2: Install all dependencies**

```bash
npm install @supabase/supabase-js @solana/wallet-adapter-base @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/web3.js framer-motion lucide-react
```

**Step 3: Create `.env.local.example`**

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_BACKLOT_TOKEN_MINT=DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump
NEXT_PUBLIC_SUPPORTER_THRESHOLD=1
NEXT_PUBLIC_PRODUCER_THRESHOLD=10000
NEXT_PUBLIC_EXEC_PRODUCER_THRESHOLD=100000
```

**Step 4: Set up Tailwind config with Backlot theme**

Update `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        backlot: {
          bg: "#0A0A0F",
          surface: "#1A1525",
          lavender: "#B8A9D4",
          gold: "#C5A644",
          tropical: "#2DD4BF",
          text: "#F5F5F5",
          muted: "#8B8B9E",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
```

**Step 5: Set up globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --bg: #0A0A0F;
  --surface: #1A1525;
  --lavender: #B8A9D4;
  --gold: #C5A644;
  --tropical: #2DD4BF;
}

body {
  background-color: var(--bg);
  color: #F5F5F5;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: var(--bg);
}
::-webkit-scrollbar-thumb {
  background: var(--lavender);
  border-radius: 3px;
}
```

**Step 6: Move brand assets**

```bash
mkdir -p public/brand
cp 1500x500.jpeg public/brand/banner.jpeg
cp 9Q5UjV_w_400x400.jpg public/brand/logo.jpg
```

**Step 7: Verify dev server runs**

```bash
npm run dev
```

Expected: Server starts on localhost:3000 with no errors.

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 14 project with Tailwind and dependencies"
```

---

## Task 2: CRT TV Power-On Animation

**Files:**
- Create: `components/CRTIntro.tsx`
- Create: `components/CRTOverlay.tsx`
- Modify: `app/layout.tsx`

**Step 1: Create CRT scanline overlay component**

Create `components/CRTOverlay.tsx`:

```tsx
"use client";

export default function CRTOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden opacity-[0.03]">
      <div
        className="h-full w-full"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
        }}
      />
    </div>
  );
}
```

**Step 2: Create CRT power-on intro component**

Create `components/CRTIntro.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function CRTIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"black" | "line" | "glow" | "logo" | "done">("black");

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("line"), 300),
      setTimeout(() => setPhase("glow"), 800),
      setTimeout(() => setPhase("logo"), 1400),
      setTimeout(() => {
        setPhase("done");
        onComplete();
      }, 2800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* TV static noise */}
          {phase === "black" && (
            <div className="absolute inset-0 opacity-20">
              <div className="h-full w-full animate-pulse bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900" />
            </div>
          )}

          {/* Horizontal line expand */}
          {phase === "line" && (
            <motion.div
              className="absolute bg-white"
              initial={{ width: 0, height: "2px" }}
              animate={{ width: "100%", height: "2px" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          )}

          {/* Phosphor glow expand */}
          {phase === "glow" && (
            <motion.div
              className="absolute bg-backlot-bg"
              initial={{ width: "100%", height: "2px" }}
              animate={{ width: "100%", height: "100%" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{
                boxShadow: "0 0 100px 50px rgba(184, 169, 212, 0.15)",
              }}
            />
          )}

          {/* Logo reveal */}
          {(phase === "logo") && (
            <motion.div
              className="relative z-10 flex flex-col items-center gap-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <Image
                src="/brand/logo.jpg"
                alt="BACKLOT"
                width={120}
                height={120}
                className="rounded-full"
              />
              <motion.p
                className="font-serif text-2xl tracking-widest text-backlot-gold"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                BACKLOT
              </motion.p>
              <motion.p
                className="text-sm text-backlot-muted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                tuning in...
              </motion.p>
            </motion.div>
          )}

          {/* Scanline effect during intro */}
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)",
            }}
          />

          {/* Screen edge vignette */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              boxShadow: "inset 0 0 150px 60px rgba(0,0,0,0.7)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

**Step 3: Create app wrapper that manages intro state**

Create `components/AppShell.tsx`:

```tsx
"use client";

import { useState, useCallback } from "react";
import CRTIntro from "./CRTIntro";
import CRTOverlay from "./CRTOverlay";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [introComplete, setIntroComplete] = useState(false);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
  }, []);

  return (
    <>
      {!introComplete && <CRTIntro onComplete={handleIntroComplete} />}
      <CRTOverlay />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: introComplete ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </>
  );
}
```

Note: Add `import { motion } from "framer-motion";` at top.

**Step 4: Verify the animation works**

Run: `npm run dev`
Expected: Page loads with black screen → horizontal line → expand → logo → content reveals.

**Step 5: Commit**

```bash
git add components/CRTIntro.tsx components/CRTOverlay.tsx components/AppShell.tsx
git commit -m "feat: add CRT TV power-on intro animation"
```

---

## Task 3: Supabase Setup & Database Schema

**Files:**
- Create: `lib/supabase.ts`
- Create: `lib/types.ts`
- Create: `supabase/schema.sql`

**Step 1: Create Supabase project**

Go to https://supabase.com/dashboard and create a new project called "backlot". Copy the URL and anon key into `.env.local`.

**Step 2: Create the Supabase client helper**

Create `lib/supabase.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Step 3: Create TypeScript types**

Create `lib/types.ts`:

```typescript
export type Tier = "viewer" | "supporter" | "producer" | "executive_producer";

export interface Episode {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  tier_required: Tier;
  is_featured: boolean;
  created_at: string;
}

export interface Poll {
  id: string;
  title: string;
  description: string | null;
  type: "agenda" | "project" | "milestone";
  tier_required: Tier;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
  options?: PollOption[];
}

export interface PollOption {
  id: string;
  poll_id: string;
  label: string;
  description: string | null;
  vote_count: number;
}

export interface Vote {
  id: string;
  poll_id: string;
  option_id: string;
  wallet_address: string;
  tier_at_vote: Tier;
  created_at: string;
}

export interface VoteReceipt {
  id: string;
  vote_id: string;
  wallet_address: string;
  mint_address: string | null;
  poll_title: string;
  option_label: string;
  minted_at: string;
}

export interface Milestone {
  id: string;
  project_name: string;
  title: string;
  description: string | null;
  target_amount: number | null;
  current_amount: number;
  status: "upcoming" | "active" | "completed";
  sort_order: number;
  created_at: string;
}

export interface BackstagePost {
  id: string;
  title: string;
  content: string | null;
  media_url: string | null;
  tier_required: Tier;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  wallet_address: string;
  display_name: string | null;
  message: string;
  tier: Tier;
  is_highlighted: boolean;
  created_at: string;
}
```

**Step 4: Create SQL schema file**

Create `supabase/schema.sql`:

```sql
-- Episodes
CREATE TABLE episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  thumbnail_url text,
  tier_required text NOT NULL DEFAULT 'viewer',
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Polls
CREATE TABLE polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('agenda', 'project', 'milestone')),
  tier_required text NOT NULL DEFAULT 'supporter',
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE poll_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES polls(id) ON DELETE CASCADE,
  label text NOT NULL,
  description text,
  vote_count integer DEFAULT 0
);

CREATE TABLE votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES polls(id) ON DELETE CASCADE,
  option_id uuid REFERENCES poll_options(id) ON DELETE CASCADE,
  wallet_address text NOT NULL,
  tier_at_vote text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(poll_id, wallet_address)
);

CREATE TABLE vote_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id uuid REFERENCES votes(id) ON DELETE CASCADE,
  wallet_address text NOT NULL,
  mint_address text,
  poll_title text,
  option_label text,
  minted_at timestamptz DEFAULT now()
);

-- Milestones
CREATE TABLE milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name text NOT NULL,
  title text NOT NULL,
  description text,
  target_amount numeric,
  current_amount numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Backstage posts
CREATE TABLE backstage_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  media_url text,
  tier_required text NOT NULL DEFAULT 'supporter',
  created_at timestamptz DEFAULT now()
);

-- Chat messages
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  display_name text,
  message text NOT NULL,
  tier text NOT NULL DEFAULT 'viewer',
  is_highlighted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable realtime on tables that need it
ALTER PUBLICATION supabase_realtime ADD TABLE poll_options;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE milestones;

-- Seed data: Episode 0
INSERT INTO episodes (title, description, video_url, tier_required, is_featured)
VALUES (
  'Episode 0: Introducing BACKLOT',
  'A social experiment testing how far community can take creative ideas IRL. Meet the project, the token, and the madwoman dev behind it all.',
  'https://x.com/Backlot876/status/2022745002401521683',
  'viewer',
  true
);

-- Seed data: Sample milestones for The Complex
INSERT INTO milestones (project_name, title, description, target_amount, current_amount, status, sort_order)
VALUES
  ('The Complex', 'Community Launch', 'Build the community, launch the token, start documenting', 100, 100, 'completed', 1),
  ('The Complex', '24/7 Dev Stream', 'Launch the living art experiment — livestreaming from Jamaica', 200, 150, 'active', 2),
  ('The Complex', 'Platform MVP', 'Ship the Backlot token-gated media platform', 500, 0, 'upcoming', 3),
  ('The Complex', 'First Full Episode', 'Film, edit, and release the first full documentary episode', 1000, 0, 'upcoming', 4),
  ('The Complex', 'Community Project Vote', 'Open voting for the second project to document', 2000, 0, 'upcoming', 5);

-- Seed data: Sample polls
INSERT INTO polls (title, description, type, tier_required, is_active)
VALUES
  ('What should the dev do today?', 'Vote on today''s livestream agenda. Top choice gets priority.', 'agenda', 'supporter', true),
  ('Next project to document?', 'Which ambitious idea should Backlot follow after The Complex?', 'project', 'producer', true);

INSERT INTO poll_options (poll_id, label, description, vote_count)
SELECT p.id, opt.label, opt.description, opt.vote_count
FROM polls p
CROSS JOIN (VALUES
  ('Beach walkthrough + market visit', 'Explore Portland and show the local scene', 12),
  ('Dev session: build the voting page', 'Watch the platform come together live', 8),
  ('Community AMA on Spaces', 'Answer questions and talk roadmap', 5)
) AS opt(label, description, vote_count)
WHERE p.title = 'What should the dev do today?';

INSERT INTO poll_options (poll_id, label, description, vote_count)
SELECT p.id, opt.label, opt.description, opt.vote_count
FROM polls p
CROSS JOIN (VALUES
  ('Music studio in Kingston', 'Follow a producer building a world-class studio in JA', 15),
  ('Eco-resort in Portland', 'Document a sustainable tourism project from scratch', 9),
  ('Tech hub in Montego Bay', 'A coworking space for Caribbean developers', 7),
  ('Nominate your own idea', 'Submit your own ambitious project for consideration', 3)
) AS opt(label, description, vote_count)
WHERE p.title = 'Next project to document?';
```

**Step 5: Run schema in Supabase SQL editor**

Go to Supabase Dashboard → SQL Editor → paste and run `supabase/schema.sql`.

**Step 6: Commit**

```bash
git add lib/supabase.ts lib/types.ts supabase/schema.sql
git commit -m "feat: add Supabase client, types, and database schema with seed data"
```

---

## Task 4: Wallet Integration & Tier System

**Files:**
- Create: `components/providers/WalletProvider.tsx`
- Create: `lib/wallet.ts`
- Create: `hooks/useBacklotTier.ts`
- Create: `components/TierBadge.tsx`

**Step 1: Create wallet context provider**

Create `components/providers/WalletProvider.tsx`:

```tsx
"use client";

import { useMemo, useCallback, ReactNode } from "react";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import type { WalletError, Adapter } from "@solana/wallet-adapter-base";

import "@solana/wallet-adapter-react-ui/styles.css";

export default function WalletProvider({ children }: { children: ReactNode }) {
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  const onError = useCallback((error: WalletError, adapter?: Adapter) => {
    console.error("Wallet error:", error, adapter);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} onError={onError} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}
```

**Step 2: Create token balance helper**

Create `lib/wallet.ts`:

```typescript
import { Connection, PublicKey } from "@solana/web3.js";

const BACKLOT_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_BACKLOT_TOKEN_MINT || "DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump"
);

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

export async function getBacklotBalance(
  connection: Connection,
  walletAddress: PublicKey
): Promise<number> {
  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletAddress,
      { mint: BACKLOT_MINT, programId: TOKEN_PROGRAM_ID }
    );

    if (tokenAccounts.value.length === 0) return 0;

    const balance =
      tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
    return balance ?? 0;
  } catch (error) {
    console.error("Error fetching BACKLOT balance:", error);
    return 0;
  }
}
```

**Step 3: Create tier hook**

Create `hooks/useBacklotTier.ts`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getBacklotBalance } from "@/lib/wallet";
import type { Tier } from "@/lib/types";

const SUPPORTER_THRESHOLD = Number(process.env.NEXT_PUBLIC_SUPPORTER_THRESHOLD || 1);
const PRODUCER_THRESHOLD = Number(process.env.NEXT_PUBLIC_PRODUCER_THRESHOLD || 10000);
const EXEC_PRODUCER_THRESHOLD = Number(process.env.NEXT_PUBLIC_EXEC_PRODUCER_THRESHOLD || 100000);

function balanceToTier(balance: number): Tier {
  if (balance >= EXEC_PRODUCER_THRESHOLD) return "executive_producer";
  if (balance >= PRODUCER_THRESHOLD) return "producer";
  if (balance >= SUPPORTER_THRESHOLD) return "supporter";
  return "viewer";
}

export function useBacklotTier() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [tier, setTier] = useState<Tier>("viewer");
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!connected || !publicKey) {
      setTier("viewer");
      setBalance(0);
      return;
    }

    setLoading(true);
    getBacklotBalance(connection, publicKey)
      .then((bal) => {
        setBalance(bal);
        setTier(balanceToTier(bal));
      })
      .finally(() => setLoading(false));
  }, [connection, publicKey, connected]);

  return { tier, balance, loading, connected };
}
```

**Step 4: Create tier badge component**

Create `components/TierBadge.tsx`:

```tsx
import type { Tier } from "@/lib/types";

const tierConfig: Record<Tier, { label: string; color: string }> = {
  viewer: { label: "Viewer", color: "bg-gray-600 text-gray-300" },
  supporter: { label: "Supporter", color: "bg-backlot-lavender/20 text-backlot-lavender" },
  producer: { label: "Producer", color: "bg-backlot-gold/20 text-backlot-gold" },
  executive_producer: { label: "Exec Producer", color: "bg-backlot-tropical/20 text-backlot-tropical" },
};

export default function TierBadge({ tier }: { tier: Tier }) {
  const config = tierConfig[tier];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
```

**Step 5: Commit**

```bash
git add components/providers/WalletProvider.tsx lib/wallet.ts hooks/useBacklotTier.ts components/TierBadge.tsx
git commit -m "feat: add Solana wallet integration with tiered $BACKLOT token gating"
```

---

## Task 5: Root Layout, Navigation & Footer

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/Navbar.tsx`
- Create: `components/Footer.tsx`
- Modify: `components/AppShell.tsx`

**Step 1: Create Navbar**

Create `components/Navbar.tsx`:

```tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useBacklotTier } from "@/hooks/useBacklotTier";
import TierBadge from "./TierBadge";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/live", label: "Live", badge: true },
  { href: "/episodes", label: "Episodes" },
  { href: "/vote", label: "Vote" },
  { href: "/backstage", label: "Backstage" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { tier, connected } = useBacklotTier();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 border-b border-white/5 bg-backlot-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/brand/logo.jpg" alt="BACKLOT" width={36} height={36} className="rounded-full" />
          <span className="font-serif text-lg tracking-wider text-backlot-gold">BACKLOT</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative rounded-lg px-3 py-2 text-sm transition-colors ${
                pathname === link.href
                  ? "text-backlot-gold"
                  : "text-backlot-muted hover:text-backlot-text"
              }`}
            >
              {link.label}
              {link.badge && (
                <span className="ml-1 inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
              )}
            </Link>
          ))}
        </div>

        {/* Wallet + tier */}
        <div className="hidden items-center gap-3 md:flex">
          {connected && <TierBadge tier={tier} />}
          <WalletMultiButton className="!bg-backlot-lavender/20 !text-backlot-lavender hover:!bg-backlot-lavender/30 !rounded-lg !h-9 !text-sm" />
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden text-backlot-muted" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/5 bg-backlot-bg px-4 pb-4 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block py-2 text-sm ${
                pathname === link.href ? "text-backlot-gold" : "text-backlot-muted"
              }`}
            >
              {link.label}
              {link.badge && (
                <span className="ml-1 inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
              )}
            </Link>
          ))}
          <div className="mt-3 flex items-center gap-2">
            {connected && <TierBadge tier={tier} />}
            <WalletMultiButton className="!bg-backlot-lavender/20 !text-backlot-lavender !rounded-lg !h-9 !text-sm" />
          </div>
        </div>
      )}
    </nav>
  );
}
```

**Step 2: Create Footer**

Create `components/Footer.tsx`:

```tsx
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-backlot-bg">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <Image src="/brand/logo.jpg" alt="BACKLOT" width={32} height={32} className="rounded-full" />
              <span className="font-serif text-lg tracking-wider text-backlot-gold">BACKLOT</span>
            </div>
            <p className="mt-3 text-sm text-backlot-muted">
              An onchain reality docu-series using a meme token + community to fund and document ambitious creative projects in public.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-backlot-text">Platform</h4>
              <div className="mt-2 flex flex-col gap-1.5">
                <Link href="/episodes" className="text-sm text-backlot-muted hover:text-backlot-lavender">Episodes</Link>
                <Link href="/live" className="text-sm text-backlot-muted hover:text-backlot-lavender">Livestream</Link>
                <Link href="/vote" className="text-sm text-backlot-muted hover:text-backlot-lavender">Vote</Link>
                <Link href="/backstage" className="text-sm text-backlot-muted hover:text-backlot-lavender">Backstage</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-backlot-text">Community</h4>
              <div className="mt-2 flex flex-col gap-1.5">
                <a href="https://x.com/backlot876" target="_blank" rel="noopener noreferrer" className="text-sm text-backlot-muted hover:text-backlot-lavender">Twitter/X</a>
                <a href="https://t.me/+Kxu0L6zKjY5kZjcx" target="_blank" rel="noopener noreferrer" className="text-sm text-backlot-muted hover:text-backlot-lavender">Telegram</a>
                <a href="https://pump.fun/coin/DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump" target="_blank" rel="noopener noreferrer" className="text-sm text-backlot-muted hover:text-backlot-lavender">Buy $BACKLOT</a>
                <a href="https://linktr.ee/Backlot876" target="_blank" rel="noopener noreferrer" className="text-sm text-backlot-muted hover:text-backlot-lavender">Linktree</a>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div>
            <h4 className="text-sm font-medium text-backlot-text">Disclaimer</h4>
            <p className="mt-2 text-xs text-backlot-muted">
              $BACKLOT is not equity, doesn&apos;t promise returns, and doesn&apos;t give ownership of The Complex or any project we document. It&apos;s a way to participate in and be recognized inside the social experiment and docu-series.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-white/5 pt-6 text-center text-xs text-backlot-muted">
          &copy; {new Date().getFullYear()} Backlot. The Social Experiment.
        </div>
      </div>
    </footer>
  );
}
```

**Step 3: Update root layout**

Update `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";
import WalletProvider from "@/components/providers/WalletProvider";
import AppShell from "@/components/AppShell";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "BACKLOT — Onchain Reality Docu-Series",
  description:
    "An onchain reality docu-series using a meme token + community to fund and document ambitious creative projects in public. Starting with The Complex in Jamaica.",
  openGraph: {
    title: "BACKLOT — Onchain Reality Docu-Series",
    description: "A social experiment testing how far community can take creative ideas IRL.",
    images: ["/brand/banner.jpeg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-backlot-bg font-sans text-backlot-text antialiased">
        <WalletProvider>
          <AppShell>
            <Navbar />
            <main className="min-h-[calc(100vh-4rem)]">{children}</main>
            <Footer />
          </AppShell>
        </WalletProvider>
      </body>
    </html>
  );
}
```

**Step 4: Verify navigation renders and wallet button appears**

Run: `npm run dev`
Expected: Navbar with logo, links, wallet button. Footer with links and disclaimer. CRT intro plays on first load.

**Step 5: Commit**

```bash
git add app/layout.tsx components/Navbar.tsx components/Footer.tsx components/AppShell.tsx
git commit -m "feat: add root layout with navbar, footer, and wallet provider"
```

---

## Task 6: Landing Page (Home)

**Files:**
- Modify: `app/page.tsx`
- Create: `components/home/Hero.tsx`
- Create: `components/home/FeaturedEpisode.tsx`
- Create: `components/home/MilestonePreview.tsx`
- Create: `components/home/TokenCTA.tsx`

**Step 1: Create Hero section**

Create `components/home/Hero.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Banner background */}
      <div className="absolute inset-0">
        <Image
          src="/brand/banner.jpeg"
          alt="Backlot"
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-backlot-bg/60 via-backlot-bg/80 to-backlot-bg" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-24 md:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-backlot-lavender">
            The Social Experiment
          </p>
          <h1 className="font-serif text-4xl leading-tight text-backlot-text md:text-6xl">
            Reality TV.{" "}
            <span className="text-backlot-gold">On Chain.</span>{" "}
            For Good.
          </h1>
          <p className="mt-6 text-lg text-backlot-muted md:text-xl">
            An onchain reality docu-series using a meme token + community to fund and document ambitious creative projects from the Caribbean and beyond — in public.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="https://pump.fun/coin/DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg bg-backlot-gold px-6 py-3 font-medium text-backlot-bg transition hover:bg-backlot-gold/90"
            >
              Get $BACKLOT
            </a>
            <a
              href="/live"
              className="inline-flex items-center rounded-lg border border-backlot-lavender/30 px-6 py-3 font-medium text-backlot-lavender transition hover:bg-backlot-lavender/10"
            >
              <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-red-500" />
              Watch Live
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

**Step 2: Create Featured Episode component**

Create `components/home/FeaturedEpisode.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";

export default function FeaturedEpisode() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="font-serif text-2xl text-backlot-text md:text-3xl">
          Now Showing
        </h2>
        <p className="mt-2 text-backlot-muted">Episode 0: Introducing BACKLOT</p>

        <div className="mt-6 overflow-hidden rounded-xl border border-white/5 bg-backlot-surface">
          <div className="aspect-video w-full">
            {/* Placeholder for embedded video — replace with actual embed */}
            <div className="flex h-full items-center justify-center bg-backlot-surface">
              <div className="text-center">
                <p className="text-backlot-muted">Video embed</p>
                <p className="mt-1 text-xs text-backlot-muted/60">
                  Episode 0: 2m 51s intro video from @Backlot876
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <p className="text-sm text-backlot-muted">
              A social experiment testing how far community can take creative ideas IRL. Meet the project, the token, and the madwoman dev behind it all.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
```

**Step 3: Create Milestone Preview component**

Create `components/home/MilestonePreview.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { Milestone } from "@/lib/types";

const sampleMilestones: Milestone[] = [
  { id: "1", project_name: "The Complex", title: "Community Launch", description: null, target_amount: 100, current_amount: 100, status: "completed", sort_order: 1, created_at: "" },
  { id: "2", project_name: "The Complex", title: "24/7 Dev Stream", description: null, target_amount: 200, current_amount: 150, status: "active", sort_order: 2, created_at: "" },
  { id: "3", project_name: "The Complex", title: "Platform MVP", description: null, target_amount: 500, current_amount: 0, status: "upcoming", sort_order: 3, created_at: "" },
];

export default function MilestonePreview() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl text-backlot-text md:text-3xl">The Complex</h2>
            <p className="mt-1 text-backlot-muted">Portland, Jamaica — Milestone Tracker</p>
          </div>
          <Link href="/vote" className="text-sm text-backlot-lavender hover:text-backlot-lavender/80">
            View all &rarr;
          </Link>
        </div>

        <div className="mt-8 space-y-4">
          {sampleMilestones.map((milestone, i) => {
            const progress = milestone.target_amount
              ? (milestone.current_amount / milestone.target_amount) * 100
              : 0;

            return (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="rounded-xl border border-white/5 bg-backlot-surface p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-3 w-3 rounded-full ${
                        milestone.status === "completed"
                          ? "bg-backlot-tropical"
                          : milestone.status === "active"
                          ? "bg-backlot-gold animate-pulse"
                          : "bg-backlot-muted/30"
                      }`}
                    />
                    <span className="font-medium text-backlot-text">{milestone.title}</span>
                  </div>
                  <span className="text-xs text-backlot-muted capitalize">{milestone.status}</span>
                </div>

                {milestone.status !== "upcoming" && (
                  <div className="mt-3">
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        className={`h-full rounded-full ${
                          milestone.status === "completed" ? "bg-backlot-tropical" : "bg-backlot-gold"
                        }`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${Math.min(progress, 100)}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 + i * 0.1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
```

**Step 4: Create Token CTA section**

Create `components/home/TokenCTA.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";

export default function TokenCTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="overflow-hidden rounded-2xl border border-backlot-gold/20 bg-gradient-to-br from-backlot-surface to-backlot-bg p-8 text-center md:p-12"
      >
        <h2 className="font-serif text-3xl text-backlot-text md:text-4xl">
          Join the <span className="text-backlot-gold">Experiment</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-backlot-muted">
          Hold $BACKLOT to unlock episodes, vote on what happens next, access behind-the-scenes content, and be part of the community shaping which ambitious ideas get documented.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href="https://pump.fun/coin/DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg bg-backlot-gold px-8 py-3 font-medium text-backlot-bg transition hover:bg-backlot-gold/90"
          >
            Buy on Pump.fun
          </a>
        </div>
        <p className="mt-6 text-xs text-backlot-muted/60">
          $BACKLOT is not equity and doesn&apos;t promise returns. It&apos;s your onchain receipt for showing up early.
        </p>
      </motion.div>
    </section>
  );
}
```

**Step 5: Assemble landing page**

Update `app/page.tsx`:

```tsx
import Hero from "@/components/home/Hero";
import FeaturedEpisode from "@/components/home/FeaturedEpisode";
import MilestonePreview from "@/components/home/MilestonePreview";
import TokenCTA from "@/components/home/TokenCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedEpisode />
      <MilestonePreview />
      <TokenCTA />
    </>
  );
}
```

**Step 6: Verify landing page renders**

Run: `npm run dev`
Expected: Full landing page with hero, video section, milestones, and CTA.

**Step 7: Commit**

```bash
git add app/page.tsx components/home/
git commit -m "feat: build landing page with hero, featured episode, milestones, and token CTA"
```

---

## Task 7: Episodes Page

**Files:**
- Create: `app/episodes/page.tsx`
- Create: `components/episodes/EpisodeCard.tsx`
- Create: `components/GatedContent.tsx`

**Step 1: Create gated content wrapper**

Create `components/GatedContent.tsx`:

```tsx
"use client";

import { useBacklotTier } from "@/hooks/useBacklotTier";
import type { Tier } from "@/lib/types";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const tierRank: Record<Tier, number> = {
  viewer: 0,
  supporter: 1,
  producer: 2,
  executive_producer: 3,
};

export default function GatedContent({
  requiredTier,
  children,
}: {
  requiredTier: Tier;
  children: React.ReactNode;
}) {
  const { tier, connected } = useBacklotTier();

  if (tierRank[tier] >= tierRank[requiredTier]) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-backlot-surface/50 p-12 text-center">
      <div className="mb-4 text-4xl">🔒</div>
      <h3 className="font-serif text-xl text-backlot-text">
        {connected ? `${requiredTier.replace("_", " ")} access required` : "Connect your wallet"}
      </h3>
      <p className="mt-2 text-sm text-backlot-muted">
        {connected
          ? `Hold more $BACKLOT to unlock this content.`
          : "Connect your wallet to check your $BACKLOT tier."}
      </p>
      {!connected && (
        <div className="mt-4">
          <WalletMultiButton className="!bg-backlot-lavender/20 !text-backlot-lavender !rounded-lg" />
        </div>
      )}
    </div>
  );
}
```

**Step 2: Create episode card**

Create `components/episodes/EpisodeCard.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import type { Episode } from "@/lib/types";
import TierBadge from "@/components/TierBadge";

export default function EpisodeCard({ episode, index }: { episode: Episode; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="group overflow-hidden rounded-xl border border-white/5 bg-backlot-surface transition hover:border-backlot-lavender/20"
    >
      <div className="aspect-video bg-backlot-bg/50">
        {episode.thumbnail_url ? (
          <img src={episode.thumbnail_url} alt={episode.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-serif text-2xl text-backlot-muted/30">BACKLOT</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-backlot-text group-hover:text-backlot-gold transition">
            {episode.title}
          </h3>
          <TierBadge tier={episode.tier_required} />
        </div>
        {episode.description && (
          <p className="mt-2 text-sm text-backlot-muted line-clamp-2">{episode.description}</p>
        )}
      </div>
    </motion.div>
  );
}
```

**Step 3: Create episodes page**

Create `app/episodes/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Episode } from "@/lib/types";
import EpisodeCard from "@/components/episodes/EpisodeCard";
import GatedContent from "@/components/GatedContent";

export default function EpisodesPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("episodes")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setEpisodes(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="font-serif text-3xl text-backlot-text md:text-4xl">Episodes</h1>
      <p className="mt-2 text-backlot-muted">
        The Backlot docu-series. New episodes as the experiment unfolds.
      </p>

      {loading ? (
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="aspect-video animate-pulse rounded-xl bg-backlot-surface" />
          ))}
        </div>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {episodes.map((episode, i) => (
            <div key={episode.id}>
              {episode.tier_required === "viewer" ? (
                <EpisodeCard episode={episode} index={i} />
              ) : (
                <GatedContent requiredTier={episode.tier_required}>
                  <EpisodeCard episode={episode} index={i} />
                </GatedContent>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && episodes.length === 0 && (
        <div className="mt-12 text-center text-backlot-muted">
          <p>No episodes yet. The experiment is just beginning.</p>
        </div>
      )}
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add app/episodes/ components/episodes/ components/GatedContent.tsx
git commit -m "feat: add episodes page with tier-gated content"
```

---

## Task 8: Live Streaming Page with Token-Gated Chat

**Files:**
- Create: `app/live/page.tsx`
- Create: `components/live/StreamEmbed.tsx`
- Create: `components/live/LiveChat.tsx`

**Step 1: Create stream embed**

Create `components/live/StreamEmbed.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";

export default function StreamEmbed() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-xl border border-white/5"
    >
      {/* LIVE indicator */}
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-red-600/90 px-3 py-1 text-xs font-bold text-white">
        <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
        LIVE
      </div>

      <div className="aspect-video w-full bg-backlot-surface">
        {/* Replace with actual stream embed URL */}
        <div className="flex h-full flex-col items-center justify-center gap-2">
          <p className="font-serif text-xl text-backlot-muted/40">24/7 Dev Stream</p>
          <p className="text-sm text-backlot-muted/30">Portland, Jamaica</p>
          <p className="mt-4 text-xs text-backlot-muted/20">
            Replace this div with your stream embed (YouTube/Twitch/Kick iframe)
          </p>
        </div>
      </div>
    </motion.div>
  );
}
```

**Step 2: Create token-gated live chat**

Create `components/live/LiveChat.tsx`:

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/lib/supabase";
import { useBacklotTier } from "@/hooks/useBacklotTier";
import TierBadge from "@/components/TierBadge";
import type { ChatMessage, Tier } from "@/lib/types";
import { Send } from "lucide-react";

export default function LiveChat() {
  const { publicKey, connected } = useWallet();
  const { tier } = useBacklotTier();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch recent messages
  useEffect(() => {
    supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(50)
      .then(({ data }) => setMessages(data || []));
  }, []);

  // Subscribe to new messages
  useEffect(() => {
    const channel = supabase
      .channel("live-chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          setMessages((prev) => [...prev.slice(-99), payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !connected || !publicKey || tier === "viewer") return;
    setSending(true);

    const walletAddr = publicKey.toBase58();
    const shortAddr = `${walletAddr.slice(0, 4)}...${walletAddr.slice(-4)}`;

    await supabase.from("chat_messages").insert({
      wallet_address: walletAddr,
      display_name: shortAddr,
      message: input.trim(),
      tier,
      is_highlighted: tier === "producer" || tier === "executive_producer",
    });

    setInput("");
    setSending(false);
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-white/5 bg-backlot-surface">
      {/* Chat header */}
      <div className="border-b border-white/5 p-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-backlot-text">Live Chat</h3>
          <span className="text-xs text-backlot-muted">{messages.length} messages</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ maxHeight: "400px" }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-lg p-2 text-sm ${
              msg.is_highlighted
                ? "border border-backlot-gold/20 bg-backlot-gold/5"
                : "bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-backlot-text text-xs">
                {msg.display_name || msg.wallet_address.slice(0, 8)}
              </span>
              <TierBadge tier={msg.tier as Tier} />
            </div>
            <p className="mt-1 text-backlot-muted">{msg.message}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/5 p-3">
        {connected && tier !== "viewer" ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Say something..."
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-backlot-text placeholder:text-backlot-muted/40 focus:border-backlot-lavender/30 focus:outline-none"
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              disabled={sending || !input.trim()}
              className="rounded-lg bg-backlot-lavender/20 p-2 text-backlot-lavender transition hover:bg-backlot-lavender/30 disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        ) : (
          <p className="text-center text-xs text-backlot-muted">
            {connected ? "Hold $BACKLOT to chat" : "Connect wallet to chat"}
          </p>
        )}
      </div>
    </div>
  );
}
```

**Step 3: Create live page**

Create `app/live/page.tsx`:

```tsx
import StreamEmbed from "@/components/live/StreamEmbed";
import LiveChat from "@/components/live/LiveChat";

export default function LivePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-backlot-text md:text-4xl">
          Live from Portland, Jamaica
        </h1>
        <p className="mt-2 text-backlot-muted">
          24/7 dev cam. Token holders in chat steer the show.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <StreamEmbed />
        <LiveChat />
      </div>
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add app/live/ components/live/
git commit -m "feat: add live streaming page with token-gated chat and tier badges"
```

---

## Task 9: Vote Page with Polls

**Files:**
- Create: `app/vote/page.tsx`
- Create: `components/vote/PollCard.tsx`
- Create: `components/vote/VoteReceiptBanner.tsx`

**Step 1: Create poll card with voting**

Create `components/vote/PollCard.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/lib/supabase";
import { useBacklotTier } from "@/hooks/useBacklotTier";
import type { Poll, PollOption, Tier } from "@/lib/types";
import TierBadge from "@/components/TierBadge";
import { Check } from "lucide-react";

const tierRank: Record<Tier, number> = {
  viewer: 0, supporter: 1, producer: 2, executive_producer: 3,
};

export default function PollCard({ poll }: { poll: Poll & { options: PollOption[] } }) {
  const { publicKey, connected } = useWallet();
  const { tier } = useBacklotTier();
  const [options, setOptions] = useState(poll.options || []);
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);

  const totalVotes = options.reduce((sum, o) => sum + o.vote_count, 0);
  const canVote = connected && tierRank[tier] >= tierRank[poll.tier_required as Tier];

  // Check if user already voted
  useEffect(() => {
    if (!publicKey) return;
    supabase
      .from("votes")
      .select("option_id")
      .eq("poll_id", poll.id)
      .eq("wallet_address", publicKey.toBase58())
      .maybeSingle()
      .then(({ data }) => {
        if (data) setVotedOptionId(data.option_id);
      });
  }, [publicKey, poll.id]);

  // Subscribe to live vote count updates
  useEffect(() => {
    const channel = supabase
      .channel(`poll-${poll.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "poll_options", filter: `poll_id=eq.${poll.id}` },
        (payload) => {
          setOptions((prev) =>
            prev.map((o) => (o.id === payload.new.id ? { ...o, vote_count: payload.new.vote_count } : o))
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [poll.id]);

  const handleVote = async (optionId: string) => {
    if (!canVote || votedOptionId || voting || !publicKey) return;
    setVoting(true);

    const walletAddr = publicKey.toBase58();
    const option = options.find((o) => o.id === optionId);

    // Insert vote
    const { data: vote, error } = await supabase
      .from("votes")
      .insert({ poll_id: poll.id, option_id: optionId, wallet_address: walletAddr, tier_at_vote: tier })
      .select()
      .single();

    if (!error && vote) {
      // Increment vote count
      await supabase
        .from("poll_options")
        .update({ vote_count: (options.find((o) => o.id === optionId)?.vote_count || 0) + 1 })
        .eq("id", optionId);

      // Create vote receipt record
      await supabase.from("vote_receipts").insert({
        vote_id: vote.id,
        wallet_address: walletAddr,
        poll_title: poll.title,
        option_label: option?.label || "",
      });

      setVotedOptionId(optionId);
    }

    setVoting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-xl border border-white/5 bg-backlot-surface p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider text-backlot-lavender">{poll.type}</span>
          <h3 className="mt-1 font-serif text-xl text-backlot-text">{poll.title}</h3>
          {poll.description && <p className="mt-1 text-sm text-backlot-muted">{poll.description}</p>}
        </div>
        <TierBadge tier={poll.tier_required as Tier} />
      </div>

      <div className="mt-6 space-y-3">
        {options.map((option) => {
          const pct = totalVotes > 0 ? (option.vote_count / totalVotes) * 100 : 0;
          const isVoted = votedOptionId === option.id;

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={!canVote || !!votedOptionId || voting}
              className={`relative w-full overflow-hidden rounded-lg border p-3 text-left transition ${
                isVoted
                  ? "border-backlot-gold/40 bg-backlot-gold/5"
                  : votedOptionId
                  ? "border-white/5 bg-white/5"
                  : "border-white/10 bg-white/5 hover:border-backlot-lavender/30"
              }`}
            >
              {/* Progress bar background */}
              {votedOptionId && (
                <motion.div
                  className="absolute inset-y-0 left-0 bg-backlot-lavender/10"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              )}

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isVoted && <Check size={14} className="text-backlot-gold" />}
                  <span className="text-sm text-backlot-text">{option.label}</span>
                </div>
                {votedOptionId && (
                  <span className="text-xs text-backlot-muted">
                    {option.vote_count} ({pct.toFixed(0)}%)
                  </span>
                )}
              </div>

              {option.description && (
                <p className="relative mt-1 text-xs text-backlot-muted">{option.description}</p>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-backlot-muted">
        <span>{totalVotes} total votes</span>
        {votedOptionId && (
          <span className="text-backlot-tropical">
            Vote recorded — cNFT receipt pending
          </span>
        )}
      </div>
    </motion.div>
  );
}
```

**Step 2: Create vote receipt banner**

Create `components/vote/VoteReceiptBanner.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/lib/supabase";
import type { VoteReceipt } from "@/lib/types";

export default function VoteReceiptBanner() {
  const { publicKey, connected } = useWallet();
  const [receipts, setReceipts] = useState<VoteReceipt[]>([]);

  useEffect(() => {
    if (!publicKey) return;
    supabase
      .from("vote_receipts")
      .select("*")
      .eq("wallet_address", publicKey.toBase58())
      .order("minted_at", { ascending: false })
      .then(({ data }) => setReceipts(data || []));
  }, [publicKey]);

  if (!connected || receipts.length === 0) return null;

  return (
    <div className="rounded-xl border border-backlot-tropical/20 bg-backlot-tropical/5 p-4">
      <h3 className="text-sm font-medium text-backlot-tropical">
        Your Vote Receipts ({receipts.length})
      </h3>
      <p className="mt-1 text-xs text-backlot-muted">
        Each vote is recorded on-chain as a compressed NFT — your proof of participation.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {receipts.map((r) => (
          <div
            key={r.id}
            className="rounded-lg border border-white/5 bg-backlot-surface px-3 py-1.5 text-xs"
          >
            <span className="text-backlot-text">{r.poll_title}</span>
            <span className="mx-1 text-backlot-muted">&middot;</span>
            <span className="text-backlot-lavender">{r.option_label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 3: Create vote page**

Create `app/vote/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Poll, PollOption } from "@/lib/types";
import PollCard from "@/components/vote/PollCard";
import VoteReceiptBanner from "@/components/vote/VoteReceiptBanner";
import GatedContent from "@/components/GatedContent";

type PollWithOptions = Poll & { options: PollOption[] };

export default function VotePage() {
  const [polls, setPolls] = useState<PollWithOptions[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("polls")
      .select("*, options:poll_options(*)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setPolls((data as PollWithOptions[]) || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-3xl text-backlot-text md:text-4xl">Vote</h1>
      <p className="mt-2 text-backlot-muted">
        Shape the experiment. Your votes decide what happens next.
      </p>

      <div className="mt-8">
        <VoteReceiptBanner />
      </div>

      <GatedContent requiredTier="supporter">
        <div className="mt-8 space-y-6">
          {loading ? (
            <>
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-xl bg-backlot-surface" />
              ))}
            </>
          ) : (
            polls.map((poll) => <PollCard key={poll.id} poll={poll} />)
          )}
          {!loading && polls.length === 0 && (
            <p className="text-center text-backlot-muted">No active polls right now.</p>
          )}
        </div>
      </GatedContent>
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add app/vote/ components/vote/
git commit -m "feat: add vote page with live polls, vote receipts, and tier gating"
```

---

## Task 10: Backstage Page

**Files:**
- Create: `app/backstage/page.tsx`

**Step 1: Create backstage page**

Create `app/backstage/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { BackstagePost } from "@/lib/types";
import GatedContent from "@/components/GatedContent";
import TierBadge from "@/components/TierBadge";
import type { Tier } from "@/lib/types";

export default function BackstagePage() {
  const [posts, setPosts] = useState<BackstagePost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("backstage_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setPosts(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-serif text-3xl text-backlot-text md:text-4xl">Backstage</h1>
      <p className="mt-2 text-backlot-muted">
        Behind-the-scenes content. Raw footage, dev updates, and the chaos that doesn&apos;t make the final cut.
      </p>

      <GatedContent requiredTier="supporter">
        <div className="mt-12 space-y-6">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-backlot-surface" />
            ))
          ) : posts.length > 0 ? (
            posts.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-white/5 bg-backlot-surface p-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-lg text-backlot-text">{post.title}</h2>
                  <TierBadge tier={post.tier_required as Tier} />
                </div>
                {post.content && (
                  <p className="mt-3 text-sm text-backlot-muted whitespace-pre-wrap">{post.content}</p>
                )}
                {post.media_url && (
                  <div className="mt-4 overflow-hidden rounded-lg">
                    <img src={post.media_url} alt={post.title} className="w-full" />
                  </div>
                )}
                <p className="mt-4 text-xs text-backlot-muted/60">
                  {new Date(post.created_at).toLocaleDateString("en-US", {
                    month: "long", day: "numeric", year: "numeric",
                  })}
                </p>
              </motion.article>
            ))
          ) : (
            <div className="rounded-xl border border-white/5 bg-backlot-surface p-12 text-center">
              <p className="font-serif text-xl text-backlot-muted/40">Coming soon</p>
              <p className="mt-2 text-sm text-backlot-muted">
                Backstage content drops as the experiment unfolds.
              </p>
            </div>
          )}
        </div>
      </GatedContent>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add app/backstage/
git commit -m "feat: add backstage page with tier-gated behind-the-scenes content"
```

---

## Task 11: About Page

**Files:**
- Create: `app/about/page.tsx`

**Step 1: Create about page**

Create `app/about/page.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const tiers = [
  { name: "Viewer", requirement: "No tokens needed", access: "Landing page, about, episode previews, watch livestream", color: "bg-gray-600" },
  { name: "Supporter", requirement: "Hold any $BACKLOT", access: "Full episodes, backstage content, basic polls, live chat", color: "bg-backlot-lavender" },
  { name: "Producer", requirement: "Hold 10,000+ $BACKLOT", access: "All polls, project nomination, highlighted in chat", color: "bg-backlot-gold" },
  { name: "Executive Producer", requirement: "Hold 100,000+ $BACKLOT", access: "Inner circle updates, direct feedback, episode credits", color: "bg-backlot-tropical" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif text-3xl text-backlot-text md:text-5xl">
          The <span className="text-backlot-gold">Experiment</span>
        </h1>
        <p className="mt-4 text-lg text-backlot-muted">
          Backlot is an onchain reality docu-series for social good — using a meme token + community support to help &ldquo;too big&rdquo; ideas hit real milestones in public.
        </p>
      </motion.div>

      {/* How it works */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16"
      >
        <h2 className="font-serif text-2xl text-backlot-text">How It Works</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { step: "1", title: "Get $BACKLOT", desc: "Buy the token on Pump.fun. This is your ticket into the experiment." },
            { step: "2", title: "Watch & Participate", desc: "Stream the 24/7 dev cam, vote on what happens next, access behind-the-scenes content." },
            { step: "3", title: "Shape the Story", desc: "Vote on which ambitious projects to follow next. Your voice decides what gets documented." },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-white/5 bg-backlot-surface p-6"
            >
              <span className="font-serif text-3xl text-backlot-gold">{item.step}</span>
              <h3 className="mt-3 font-medium text-backlot-text">{item.title}</h3>
              <p className="mt-2 text-sm text-backlot-muted">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Tiers */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16"
      >
        <h2 className="font-serif text-2xl text-backlot-text">Holder Tiers</h2>
        <p className="mt-2 text-backlot-muted">What you unlock depends on how much $BACKLOT you hold.</p>
        <div className="mt-6 space-y-3">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-4 rounded-xl border border-white/5 bg-backlot-surface p-4"
            >
              <span className={`mt-1 h-3 w-3 rounded-full ${tier.color}`} />
              <div>
                <h3 className="font-medium text-backlot-text">{tier.name}</h3>
                <p className="text-sm text-backlot-gold">{tier.requirement}</p>
                <p className="mt-1 text-sm text-backlot-muted">{tier.access}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* First project */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16"
      >
        <h2 className="font-serif text-2xl text-backlot-text">First Project: The Complex</h2>
        <p className="mt-2 text-backlot-muted">Portland, Jamaica</p>
        <div className="mt-6 overflow-hidden rounded-xl border border-white/5">
          <Image
            src="/brand/banner.jpeg"
            alt="The Complex - Jamaica"
            width={1500}
            height={500}
            className="w-full"
          />
        </div>
        <p className="mt-4 text-backlot-muted">
          The Complex is where it all starts. An ambitious creative project in Portland, Jamaica — documented from the ground up as the Backlot community watches, votes, and participates in real time.
        </p>
      </motion.section>

      {/* Disclaimer */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 rounded-xl border border-white/5 bg-backlot-surface p-6"
      >
        <h2 className="font-serif text-lg text-backlot-text">Important Disclaimer</h2>
        <p className="mt-2 text-sm text-backlot-muted">
          $BACKLOT is not equity, doesn&apos;t promise returns, and doesn&apos;t give ownership of The Complex or any project we document. It&apos;s a way to participate in and be recognized inside the social experiment and the docu-series we&apos;re building around it.
        </p>
      </motion.section>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add app/about/
git commit -m "feat: add about page with experiment explainer, tiers, and disclaimer"
```

---

## Task 12: Milestone Tracker Component (Full)

**Files:**
- Create: `components/milestones/MilestoneTracker.tsx`
- Modify: `components/home/MilestonePreview.tsx` (replace static data with Supabase)

**Step 1: Create full milestone tracker with realtime**

Create `components/milestones/MilestoneTracker.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { Milestone } from "@/lib/types";
import { Check, Zap, Clock } from "lucide-react";

const statusIcon = {
  completed: <Check size={16} className="text-backlot-tropical" />,
  active: <Zap size={16} className="text-backlot-gold" />,
  upcoming: <Clock size={16} className="text-backlot-muted/40" />,
};

export default function MilestoneTracker({ projectName }: { projectName?: string }) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let query = supabase.from("milestones").select("*").order("sort_order", { ascending: true });
    if (projectName) query = query.eq("project_name", projectName);

    query.then(({ data }) => {
      setMilestones(data || []);
      setLoading(false);
    });
  }, [projectName]);

  // Realtime milestone updates
  useEffect(() => {
    const channel = supabase
      .channel("milestones")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "milestones" },
        (payload) => {
          setMilestones((prev) =>
            prev.map((m) => (m.id === payload.new.id ? (payload.new as Milestone) : m))
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading) {
    return <div className="space-y-4">{[...Array(3)].map((_, i) => (
      <div key={i} className="h-20 animate-pulse rounded-xl bg-backlot-surface" />
    ))}</div>;
  }

  return (
    <div className="space-y-1">
      {milestones.map((milestone, i) => {
        const progress = milestone.target_amount
          ? Math.min((milestone.current_amount / milestone.target_amount) * 100, 100)
          : 0;

        return (
          <motion.div
            key={milestone.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="relative"
          >
            {/* Connector line */}
            {i < milestones.length - 1 && (
              <div className="absolute left-[19px] top-[40px] h-[calc(100%)] w-[2px] bg-white/5" />
            )}

            <div className="flex gap-4 rounded-xl border border-white/5 bg-backlot-surface p-4">
              {/* Status dot */}
              <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                milestone.status === "completed"
                  ? "border-backlot-tropical/30 bg-backlot-tropical/10"
                  : milestone.status === "active"
                  ? "border-backlot-gold/30 bg-backlot-gold/10"
                  : "border-white/10 bg-white/5"
              }`}>
                {statusIcon[milestone.status]}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className={`font-medium ${
                    milestone.status === "upcoming" ? "text-backlot-muted/60" : "text-backlot-text"
                  }`}>
                    {milestone.title}
                  </h3>
                  <span className={`text-xs capitalize ${
                    milestone.status === "completed" ? "text-backlot-tropical" :
                    milestone.status === "active" ? "text-backlot-gold" : "text-backlot-muted/40"
                  }`}>
                    {milestone.status}
                  </span>
                </div>

                {milestone.description && (
                  <p className="mt-1 text-sm text-backlot-muted">{milestone.description}</p>
                )}

                {/* Progress bar */}
                {milestone.status !== "upcoming" && milestone.target_amount && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-backlot-muted">
                      <span>{progress.toFixed(0)}%</span>
                      <span>{milestone.current_amount} / {milestone.target_amount}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        className={`h-full rounded-full ${
                          milestone.status === "completed" ? "bg-backlot-tropical" : "bg-backlot-gold"
                        }`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${progress}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.2 + i * 0.1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
```

**Step 2: Update home MilestonePreview to use real data**

Replace the static data in `components/home/MilestonePreview.tsx` with an import of `MilestoneTracker`:

```tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import MilestoneTracker from "@/components/milestones/MilestoneTracker";

export default function MilestonePreview() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl text-backlot-text md:text-3xl">The Complex</h2>
            <p className="mt-1 text-backlot-muted">Portland, Jamaica — Milestone Tracker</p>
          </div>
          <Link href="/vote" className="text-sm text-backlot-lavender hover:text-backlot-lavender/80">
            View all &rarr;
          </Link>
        </div>
        <div className="mt-8">
          <MilestoneTracker projectName="The Complex" />
        </div>
      </motion.div>
    </section>
  );
}
```

**Step 3: Commit**

```bash
git add components/milestones/ components/home/MilestonePreview.tsx
git commit -m "feat: add realtime milestone tracker with animated progress bars"
```

---

## Task 13: Community Spotlight Wall

**Files:**
- Create: `components/community/SpotlightWall.tsx`
- Modify: `app/page.tsx` (add spotlight to home page)

**Step 1: Create spotlight wall with X embeds**

Create `components/community/SpotlightWall.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

const TWEETS = [
  "2022745002401521683", // Pinned intro tweet
  // Add more tweet IDs as they come in
];

function TweetEmbed({ tweetId }: { tweetId: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Load Twitter widget script if not already loaded
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;

    const existingScript = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]');
    if (!existingScript) {
      document.head.appendChild(script);
    }

    // Render tweet once script is loaded
    const render = () => {
      if (window.twttr?.widgets) {
        ref.current!.innerHTML = "";
        window.twttr.widgets.createTweet(tweetId, ref.current!, {
          theme: "dark",
          align: "center",
          dnt: true,
        });
      }
    };

    if (window.twttr?.widgets) {
      render();
    } else {
      script.onload = render;
    }
  }, [tweetId]);

  return <div ref={ref} className="min-h-[200px]" />;
}

export default function SpotlightWall() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="font-serif text-2xl text-backlot-text md:text-3xl">Community Spotlight</h2>
        <p className="mt-2 text-backlot-muted">
          From the community. Follow along on{" "}
          <a href="https://x.com/backlot876" target="_blank" rel="noopener noreferrer" className="text-backlot-lavender hover:underline">
            @Backlot876
          </a>
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TWEETS.map((id, i) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="overflow-hidden rounded-xl border border-white/5 bg-backlot-surface"
            >
              <TweetEmbed tweetId={id} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
```

Add type declaration for Twitter widget. Create `types/twitter.d.ts`:

```typescript
interface Window {
  twttr?: {
    widgets: {
      createTweet: (
        tweetId: string,
        container: HTMLElement,
        options?: Record<string, unknown>
      ) => Promise<HTMLElement>;
    };
  };
}
```

**Step 2: Add spotlight to home page**

Update `app/page.tsx`:

```tsx
import Hero from "@/components/home/Hero";
import FeaturedEpisode from "@/components/home/FeaturedEpisode";
import MilestonePreview from "@/components/home/MilestonePreview";
import SpotlightWall from "@/components/community/SpotlightWall";
import TokenCTA from "@/components/home/TokenCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedEpisode />
      <MilestonePreview />
      <SpotlightWall />
      <TokenCTA />
    </>
  );
}
```

**Step 3: Commit**

```bash
git add components/community/ types/ app/page.tsx
git commit -m "feat: add community spotlight wall with embedded tweets"
```

---

## Task 14: Final Polish & Deploy

**Files:**
- Modify: `app/layout.tsx` (add favicon)
- Create: `public/favicon.ico` (use logo)
- Modify: `next.config.js` (add image domains)

**Step 1: Update next.config.js for external images**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "pbs.twimg.com" },
    ],
  },
};

module.exports = nextConfig;
```

**Step 2: Build and fix any TypeScript errors**

```bash
npm run build
```

Fix any errors that appear. Common issues: missing imports, type mismatches.

**Step 3: Commit all fixes**

```bash
git add -A
git commit -m "chore: fix build errors and polish for production"
```

**Step 4: Deploy to Vercel**

```bash
npx vercel --prod
```

Follow prompts to link to Vercel project. Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SOLANA_RPC_URL`
- `NEXT_PUBLIC_BACKLOT_TOKEN_MINT`
- `NEXT_PUBLIC_SUPPORTER_THRESHOLD`
- `NEXT_PUBLIC_PRODUCER_THRESHOLD`
- `NEXT_PUBLIC_EXEC_PRODUCER_THRESHOLD`

**Step 5: Final commit with deploy config**

```bash
git add -A
git commit -m "feat: production build and Vercel deployment config"
```

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Project scaffolding (Next.js 14 + Tailwind + deps) |
| 2 | CRT TV power-on intro animation |
| 3 | Supabase setup, schema, seed data |
| 4 | Solana wallet integration + tier system |
| 5 | Root layout, navbar, footer |
| 6 | Landing page (hero, featured episode, milestones, CTA) |
| 7 | Episodes page with tier gating |
| 8 | Live streaming page with token-gated chat |
| 9 | Vote page with polls and cNFT receipt tracking |
| 10 | Backstage page |
| 11 | About page |
| 12 | Full milestone tracker with realtime updates |
| 13 | Community spotlight wall |
| 14 | Polish, build, deploy to Vercel |
