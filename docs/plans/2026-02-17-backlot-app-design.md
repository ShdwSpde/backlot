# Backlot App — Design Document

**Date**: 2026-02-17
**Status**: Approved
**Context**: MVP for pump.fun Build In Public Hackathon + long-term platform foundation

---

## Overview

Backlot is an onchain reality docu-series platform for social good. The app is the home for episodes, behind-the-scenes content, token-holder polls, community voting on future projects, and a 24/7 livestream experience — all gated by $BACKLOT token holdings on Solana.

**Token**: $BACKLOT
**Contract**: DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump
**First project**: The Complex in Jamaica

---

## Approach

Monolithic Next.js 14 App Router + Supabase + Solana Wallet Adapter, deployed to Vercel. Single codebase, single deploy. Supabase provides database, realtime subscriptions, and row-level security.

---

## Pages & Routes

| Route | Purpose | Access |
|---|---|---|
| `/` | Landing — CRT TV power-on intro, hero with livestream embed, mission statement, token CTA, latest episode teaser | Public |
| `/episodes` | Episode grid — Episode 0 (intro video), future episodes as cards | Public (previews), holders (full) |
| `/live` | 24/7 livestream with token-gated chat overlay, tier badges, holder-controlled agenda | Public (watch), holders (chat/vote) |
| `/vote` | Active polls — vote on projects, agenda items, milestone priorities. Votes mint cNFT receipts | Holders only, tiered |
| `/backstage` | Behind-the-scenes content, dev updates, raw footage | Holders only |
| `/about` | The experiment explained, disclaimers, how to participate | Public |

---

## Tier System

| Tier | Requirement | Access |
|---|---|---|
| **Viewer** | No tokens | Landing, about, episode previews, watch livestream |
| **Supporter** | Hold any $BACKLOT | Full episodes, backstage content, basic polls |
| **Producer** | Hold X+ $BACKLOT | All polls, project nomination, priority in stream chat |
| **Executive Producer** | Hold XX+ $BACKLOT | Inner circle updates, direct feedback channel, episode credits |

Thresholds TBD based on token supply/distribution analysis.

---

## Visual Design

**Color Palette:**

| Role | Color | Source |
|---|---|---|
| Primary | Lavender `#B8A9D4` | Logo bubble |
| Accent | Gold `#C5A644` | Banner text |
| Background | Near-black `#0A0A0F` | Dark cinema feel |
| Surface | Dark purple `#1A1525` | Cards, panels |
| Text | White `#F5F5F5` | Primary text |
| Tropical | Turquoise `#2DD4BF` | Ocean from banner |

**Design Language:**
- Dark, cinematic — docu-series platform, not a DeFi dashboard
- Purple bubble logo as brand mark, gold for CTAs
- Glass-morphism cards (nod to bubble logo)
- Bold serif headings (editorial/documentary feel), clean sans-serif body
- Mobile-first — most pump.fun users on phones
- HBO Max meets pump.fun aesthetic

---

## Bells & Whistles (Hackathon Cred)

### 1. CRT TV Power-On Animation
Old-school television turn-on effect as the site intro. Scanlines, phosphor warm-up glow, horizontal line expand, screen flicker, then content reveals. Pure CSS + Framer Motion. Sets the tone: "you're tuning into something."

### 2. On-chain Vote Receipts (cNFTs)
Every poll vote mints a compressed NFT on Solana via Metaplex Bubblegum. ~$0.00005 per mint. Each receipt records: poll title, option chosen, timestamp. Holders accumulate a visible on-chain history of participation. The "onchain receipt" narrative made literal.

### 3. Milestone Tracker with Progress Animation
Visual roadmap for The Complex (and future projects). Animated progress bars fill as milestones are hit. Community-funded goals show contribution amounts in real-time via Supabase Realtime. Kickstarter meets on-chain transparency.

### 4. 24/7 Stream Integration with Token-Gated Chat Overlay
Embedded livestream with custom chat. Tier badges next to usernames. Producer-tier holders get highlighted messages. Realtime via Supabase. The stream page is the centerpiece — a live, interactive, token-powered Truman Show.

### 5. Community Spotlight Wall
Auto-pulls latest posts from @backlot876 and community members tagging $BACKLOT. Living social wall on the site. Shows organic community activity without manual curation. Twitter/X embed widgets.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (Postgres + Realtime + RLS) |
| Wallet | Solana Wallet Adapter |
| Token checks | @solana/web3.js (RPC balance reads) |
| cNFTs | Metaplex Bubblegum SDK |
| Styling | Tailwind CSS + Framer Motion |
| Deploy | Vercel |
| Livestream | Embedded player (YouTube/Twitch/Kick/pump.fun stream) |
| Price feed | Jupiter API or Birdeye API |
| Social feed | Twitter/X embed widgets |

---

## Data Model (Supabase)

```sql
-- Episodes and content
episodes (
  id uuid PRIMARY KEY,
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  thumbnail_url text,
  tier_required text DEFAULT 'viewer',
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
)

-- Polls and voting
polls (
  id uuid PRIMARY KEY,
  title text NOT NULL,
  description text,
  type text NOT NULL, -- 'agenda' | 'project' | 'milestone'
  tier_required text DEFAULT 'supporter',
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
)

poll_options (
  id uuid PRIMARY KEY,
  poll_id uuid REFERENCES polls(id),
  label text NOT NULL,
  description text,
  vote_count integer DEFAULT 0
)

votes (
  id uuid PRIMARY KEY,
  poll_id uuid REFERENCES polls(id),
  option_id uuid REFERENCES poll_options(id),
  wallet_address text NOT NULL,
  tier_at_vote text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(poll_id, wallet_address)
)

vote_receipts (
  id uuid PRIMARY KEY,
  vote_id uuid REFERENCES votes(id),
  wallet_address text NOT NULL,
  mint_address text,
  poll_title text,
  option_label text,
  minted_at timestamptz DEFAULT now()
)

-- Milestones
milestones (
  id uuid PRIMARY KEY,
  project_name text NOT NULL,
  title text NOT NULL,
  description text,
  target_amount numeric,
  current_amount numeric DEFAULT 0,
  status text DEFAULT 'upcoming', -- 'upcoming' | 'active' | 'completed'
  sort_order integer,
  created_at timestamptz DEFAULT now()
)

-- Behind-the-scenes content
backstage_posts (
  id uuid PRIMARY KEY,
  title text NOT NULL,
  content text,
  media_url text,
  tier_required text DEFAULT 'supporter',
  created_at timestamptz DEFAULT now()
)

-- Stream chat messages
chat_messages (
  id uuid PRIMARY KEY,
  wallet_address text NOT NULL,
  display_name text,
  message text NOT NULL,
  tier text,
  is_highlighted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
)
```

---

## Auth Flow

1. User clicks "Connect Wallet" -> Phantom/Solflare popup
2. App reads wallet's $BACKLOT token account via Solana RPC
3. Balance determines tier -> stored in client state, re-checked on each page load
4. Supabase RLS uses wallet address for vote deduplication
5. No traditional login — wallet IS the identity

---

## Disclaimer (displayed in app)

$BACKLOT is not equity, doesn't promise returns, and doesn't give ownership of The Complex or any project documented. It's a way to participate in and be recognized inside the social experiment and docu-series.
