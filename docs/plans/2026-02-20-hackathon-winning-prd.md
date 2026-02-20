# PRD: Winning the pump.fun Build In Public Hackathon

**Date:** 2026-02-20
**Token:** $BACKLOT — `DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump`
**Domain:** backlotsocial.xyz | backlot-six.vercel.app
**Team:** @thebougiebrat (founder), @ShdwSpde (dev)

---

## 1. The Hackathon

**pump.fun Build In Public Hackathon** — $3M fund, 12 winners, $250K each at $10M valuation.

- No judges. No preset theme. **Market is the evaluator.**
- First winner (zauth) announced Feb 18 — 11 spots remain
- Winners chosen on: long-term viability, transparency, founder behavior, organic traction
- Pump Fund makes final investment decisions based on observed signals

## 2. What Pump Fund Actually Evaluates

| Signal | Weight | What They Look For |
|--------|--------|--------------------|
| **Proof of Execution** | Critical | Weekly releases, visible changelogs, live demos, clear explanations |
| **Transparent Accountability** | Critical | Public roadmap, acknowledge mistakes, consistent team presence |
| **Healthy On-Chain Distribution** | High | No wallet concentration, no suspicious liquidity, genuine holders |
| **Community Quality** | High | Users asking product questions, tutorials, real engagement — not "when pump" |
| **Credible Token Narrative** | High | Token gates features, aligns incentives, enables distribution — not just speculation |
| **Founder Behavior** | Medium | Engineer-focused updates, metrics, demos, reproducible steps — not marketing fluff |

## 3. Where Backlot Stands Today

### What's Strong

- **Ship velocity is exceptional** — 25+ commits in 4 days, 14 features, 3 security fixes, live changelog
- **Token has real utility** — gates content, weights votes, unlocks tiers, funds milestones
- **On-chain integrations are deep** — wallet connect, token-weighted voting, Solana Actions/Blinks, cNFT receipts, Jupiter swap, milestone funding, holder leaderboard
- **Transparency infrastructure exists** — ship log, treasury page, holder distribution, open-source GitHub
- **Unique narrative** — not another DeFi tool or AI agent; a reality docu-series using crypto for social good in Jamaica. This is differentiated.
- **Live product** — deployed, functional, custom domain

### What's Weak

- **Community is small** — 8 holders, low social engagement
- **No live content yet** — episodes are pump.fun stream replays, not original docu-series footage
- **Key features degraded** — cNFT minting (no tree), backstage (no content), Supabase service role key missing
- **No public roadmap page** — roadmap exists on pitch page but isn't prominent or updateable
- **FeaturedEpisode is a placeholder** — the homepage "Now Showing" section shows static text
- **Blinks SITE_URL wrong** — still points to backlot.vercel.app, not backlotsocial.xyz
- **No social proof of building** — ship log is internal, no Twitter thread of daily updates

---

## 4. The Gap: What Winners Do That We Don't (Yet)

Looking at zauth (first winner): infrastructure solving real problems, existing integrations with other platforms, building in public transparently, early product-market fit.

**Backlot's equivalent signals need to be:**
1. Real docu-series content being produced (not just a platform)
2. Real community members engaging with the product (not just holding)
3. Public daily build updates that show the journey
4. Integration with the broader Solana/pump.fun ecosystem
5. Evidence that the model works — a project funded, milestones hit, documented

---

## 5. Priority Actions — Ranked by Impact on Winning

### P0: Do This Week (Critical Path)

#### 5.1 Fix Degraded Features
- [ ] **Add Supabase service role key** to Vercel — without this, voting via Blinks, cNFT receipt updates, and leaderboard all fail server-side
- [ ] **Update NEXT_PUBLIC_SITE_URL** to `https://backlotsocial.xyz` — Blinks won't work otherwise
- [ ] **Fix FeaturedEpisode** — embed the actual Episode 0 video from X, not placeholder text
- [ ] **Seed Supabase data** — ensure polls are active, milestones have real progress, backstage has at least 3 posts

#### 5.2 Ship Original Content
- [ ] **Record and publish Episode 1** — film something real at The Complex. Even 5 minutes of "here's the property, here's the plan, here's what $BACKLOT holders will decide" is enough
- [ ] **Stream building sessions on pump.fun** — they can see you're actively using their platform
- [ ] **Post daily build updates on @Backlot876** — screenshots, metrics, what shipped, what's next. Thread format. Tag @pumpdotfun

#### 5.3 Grow Real Holders
- [ ] **Target 50+ holders** — current 8 is too low. The distribution needs to show organic growth
- [ ] **Engage in pump.fun community** — comment on other hackathon projects, build relationships
- [ ] **Creator should hold 20-50% of supply** — this is explicitly what Pump Fund prefers (shows skin in the game)
- [ ] **Get 3-5 community members who are NOT the team** asking questions, giving feedback publicly

### P1: Do Next Week (Strong Differentiators)

#### 5.4 Public Roadmap & Milestone Tracking
- [ ] **Add a `/roadmap` page** — living document showing what's planned, what's in progress, what's shipped
- [ ] **Connect milestones to real The Complex progress** — photos, GPS coordinates, cost breakdowns
- [ ] **Make milestone funding actually flow** — even if it's small amounts, show SOL moving to the multisig for real purposes

#### 5.5 Prove the Model Works
- [ ] **Fund one real milestone** — even if it's $50 worth of SOL for "site clearing" or "materials survey"
- [ ] **Document it** — before/after photos, transaction hash, community vote that decided it
- [ ] **This is the killer differentiator** — no other hackathon project has "we used our token to fund a real-world project and here's the proof"

#### 5.6 Ecosystem Integration
- [ ] **Create a Blink that works on Twitter** — "Vote on what Backlot funds next" shareable action
- [ ] **Partner with 1-2 other pump.fun projects** — cross-promote, show ecosystem thinking
- [ ] **Get listed on pump.fun community pages** or directories

#### 5.7 Complete cNFT Infrastructure
- [ ] **Deploy a Bubblegum tree** on mainnet — vote receipt NFTs become real, verifiable proof of participation
- [ ] **Each vote mints a cNFT** — this is a tangible "I was here" artifact that other projects don't have

### P2: Polish (Nice to Have)

#### 5.8 Technical Polish
- [ ] Swap in-memory rate limiter for Redis/Upstash (survives deploys)
- [ ] Add OG image meta tags for social sharing (Twitter cards)
- [ ] Enable Supabase RLS on all tables
- [ ] Add error boundaries so individual component failures don't crash the page
- [ ] Progressive loading states instead of blank sections

#### 5.9 Content Depth
- [ ] Wiki page with full project documentation
- [ ] Behind-the-scenes content in backstage (gated to supporters+)
- [ ] Episode thumbnails that aren't pump.fun defaults
- [ ] Community-created content showcase

---

## 6. The Narrative That Wins

Pump Fund isn't looking for the most technically complex project. They're looking for:

> **"A credible team building something real, in public, with a token that has genuine utility, and a community that cares about the product — not just the price."**

Backlot's winning narrative:

**"We're using a meme token to fund and document real creative projects in Jamaica. Every holder votes on what happens next. Every dollar is tracked on-chain. Every episode shows the receipts. This isn't a whitepaper — it's happening live."**

### How to tell this story:

1. **Daily X updates** from @Backlot876 showing: what shipped, what was voted on, what got funded, what was filmed
2. **Weekly ship log updates** on the site with real commit hashes
3. **Monthly milestone reports** showing: SOL raised, milestones funded, community decisions made
4. **The Complex as the proof** — real property, real location, real progress photos, real community votes directing the work

---

## 7. Success Metrics (by end of February)

| Metric | Current | Target | How |
|--------|---------|--------|-----|
| Holders | 8 | 50+ | Community building, content, engagement |
| Daily active users | ~0 | 10+ | Real polls, backstage content, episodes |
| Episodes published | 0 original | 3+ | Film at The Complex, post build streams |
| Milestones funded | 0 | 1+ | Even $50 SOL flowing to multisig for real work |
| X followers (@Backlot876) | Low | 200+ | Daily build threads, engage pump.fun community |
| Ship log entries | 25 | 40+ | Keep shipping daily |
| Community questions/feedback | 0 | 10+ | Real product engagement, not price talk |
| Blinks shared on X | 0 | 5+ | Shareable voting actions |

---

## 8. What NOT to Do

- **Don't buy holders** — Pump Fund explicitly checks for suspicious distribution
- **Don't fake engagement** — they evaluate community quality, not size
- **Don't stop shipping** — velocity is the #1 proof of execution signal
- **Don't market before product** — engineer-focused updates > marketing fluff
- **Don't ignore pump.fun streams** — streaming on their platform shows ecosystem loyalty
- **Don't pivot the narrative** — the Jamaica docu-series angle is unique; doubling down beats pivoting

---

## 9. Timeline

| Day | Focus |
|-----|-------|
| Feb 20 (Today) | Fix all degraded features, seed Supabase, update SITE_URL |
| Feb 21-22 | Record Episode 1, start daily X threads, grow holders |
| Feb 23-25 | Deploy Bubblegum tree, launch working Blinks, fund first milestone |
| Feb 26-28 | Public roadmap page, ecosystem partnerships, milestone documentation |
| Mar 1+ | Weekly cadence: ship, film, fund, document, repeat |

---

## 10. One-Line Summary

**Backlot has the tech, the narrative, and the transparency infrastructure. What it needs now is content, community, and proof that the model works — one funded milestone with receipts on-chain is worth more than 100 features.**
