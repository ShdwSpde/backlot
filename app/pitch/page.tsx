"use client";
import { motion } from "framer-motion";
import { Sparkles, Zap, Globe, Users, Vote, Coins, Trophy, Heart, Tv, Shield, Rocket, ChevronRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import ArchitectureDiagram from "@/components/pitch/ArchitectureDiagram";
import DataFlowDiagram from "@/components/pitch/DataFlowDiagram";

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

const features = [
  { icon: <Tv size={20} />, name: "24/7 Livestream", desc: "Pump.fun native embed — watch the journey from Jamaica in real time", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
  { icon: <Coins size={20} />, name: "Jupiter Swap Widget", desc: "Buy $BACKLOT directly in the app — no leaving the experience", color: "text-backlot-gold", bg: "bg-backlot-gold/10 border-backlot-gold/20" },
  { icon: <Globe size={20} />, name: "Solana Blinks", desc: "Vote on story decisions from Twitter — Solana Actions API makes any tweet interactive", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
  { icon: <Shield size={20} />, name: "cNFT Vote Receipts", desc: "Every vote minted as a compressed NFT via Metaplex Bubblegum — proof of participation forever", color: "text-backlot-tropical", bg: "bg-backlot-tropical/10 border-backlot-tropical/20" },
  { icon: <Vote size={20} />, name: "Token-Weighted Voting", desc: "Your $BACKLOT holdings amplify your voice — more skin in the game, more influence", color: "text-backlot-lavender", bg: "bg-backlot-lavender/10 border-backlot-lavender/20" },
  { icon: <Zap size={20} />, name: "Live Token Dashboard", desc: "Real-time price, market cap, and supply from Jupiter + Helius APIs", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
  { icon: <Trophy size={20} />, name: "Gamified Leaderboard", desc: "Participation scores reward action, not wealth — votes, chat, cNFTs all count", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20" },
  { icon: <Heart size={20} />, name: "Solana Pay Funding", desc: "Fund milestones directly with SOL — transparent, on-chain contributions to the project", color: "text-pink-400", bg: "bg-pink-400/10 border-pink-400/20" },
];

const techStack = [
  { layer: "Frontend", items: ["Next.js 14", "Framer Motion", "Tailwind CSS", "TypeScript"] },
  { layer: "Blockchain", items: ["Solana Web3.js", "Wallet Adapter", "Metaplex Bubblegum", "Jupiter Terminal"] },
  { layer: "Backend", items: ["Supabase (Postgres)", "Realtime Subscriptions", "Row Level Security", "Edge Functions"] },
  { layer: "APIs", items: ["Solana Actions/Blinks", "Solana Pay", "Jupiter Price API", "Helius DAS"] },
];

const scaleSteps = [
  { phase: "Now", title: "Hackathon MVP", items: ["Single project (The Complex, Jamaica)", "Pump.fun token launch", "Community voting + livestream", "8 Solana integrations live"], status: "active" },
  { phase: "Q2 2026", title: "Multi-Project Expansion", items: ["Onboard 3-5 new creative projects", "DAO governance for project selection", "Cross-project token utility", "Mobile-responsive PWA"], status: "upcoming" },
  { phase: "Q3 2026", title: "Creator Platform", items: ["Self-serve project onboarding", "Custom token-gating tiers per project", "NFT membership passes", "Revenue sharing via smart contracts"], status: "upcoming" },
  { phase: "Q4 2026", title: "Network Effects", items: ["50+ documented projects globally", "$BACKLOT as ecosystem currency", "SDK for third-party integrations", "Decentralized content hosting (Arweave/IPFS)"], status: "upcoming" },
];

export default function PitchPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-backlot-lavender/5 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 right-0 h-96 w-96 rounded-full bg-backlot-gold/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 left-0 h-96 w-96 rounded-full bg-backlot-tropical/5 blur-3xl" />

      {/* Hero */}
      <section className="relative mx-auto max-w-5xl px-4 pb-16 pt-20 text-center">
        <motion.div {...fadeUp}>
          <div className="mx-auto mb-6 flex items-center justify-center gap-2 rounded-full border border-backlot-gold/20 bg-backlot-gold/5 px-4 py-1.5 text-sm text-backlot-gold w-fit">
            <Sparkles size={14} />
            pump.fun Build In Public Hackathon
          </div>
          <h1 className="font-serif text-5xl leading-tight md:text-7xl">
            <span className="text-backlot-text">Reality TV.</span>{" "}
            <span className="bg-gradient-to-r from-backlot-gold via-backlot-lavender to-backlot-tropical bg-clip-text text-transparent">On Chain.</span>{" "}
            <span className="text-backlot-text">For Good.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-backlot-muted md:text-xl">
            Backlot turns ambitious creative projects into community-funded, community-directed docu-series.
            Here every vote is on-chain, every dollar is transparent and every viewer is a producer and a backer.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/" className="inline-flex items-center gap-2 rounded-lg bg-backlot-gold px-6 py-3 font-medium text-backlot-bg transition hover:bg-backlot-gold/90">
              Explore the Platform <ChevronRight size={16} />
            </Link>
            <a href="https://github.com/ShdwSpde/backlot" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-6 py-3 font-medium text-backlot-text transition hover:bg-white/5">
              View Source <ExternalLink size={14} />
            </a>
          </div>
        </motion.div>
      </section>

      {/* The Problem → Solution */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <motion.div {...fadeUp} className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-8">
            <h2 className="font-serif text-2xl text-backlot-text">The Problem</h2>
            <ul className="mt-4 space-y-3 text-backlot-muted">
              <li className="flex items-start gap-2"><span className="mt-1 text-red-400">&#x2717;</span> Founders, creatives and innovators with big ideas stall out without early backing</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-red-400">&#x2717;</span> Reality TV profits go to networks not the people living the story</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-red-400">&#x2717;</span> Token projects lack real-world utility, stakes and a followable narrative</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-red-400">&#x2717;</span> Web3 content platforms feel soulless and extractive</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-backlot-tropical/10 bg-backlot-tropical/5 p-8">
            <h2 className="font-serif text-2xl text-backlot-text">Our Answer</h2>
            <ul className="mt-4 space-y-3 text-backlot-muted">
              <li className="flex items-start gap-2"><span className="mt-1 text-backlot-tropical">&#x2713;</span> Community-backed experiments powered by the $BACKLOT token</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-backlot-tropical">&#x2713;</span> Viewers become producers and backers. With the power to vote, fund, and actively shape each subject&apos;s story arc.</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-backlot-tropical">&#x2713;</span> Every decision is on-chain: votes, funding, and participation</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-backlot-tropical">&#x2713;</span> Real people, real places, real impact. Starting in Jamaica and expanding outward</li>
            </ul>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <motion.div {...fadeUp} className="text-center">
          <h2 className="font-serif text-3xl text-backlot-text md:text-4xl">8 Solana Integrations. <span className="text-backlot-gold">One Weekend.</span></h2>
          <p className="mx-auto mt-3 max-w-xl text-backlot-muted">Every feature was built for this hackathon to showcase what&apos;s possible when you build in public on Solana.</p>
        </motion.div>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {features.map((f, i) => (
            <motion.div
              key={f.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className={`flex gap-4 rounded-xl border p-5 ${f.bg}`}
            >
              <div className={`mt-0.5 ${f.color}`}>{f.icon}</div>
              <div>
                <h3 className="font-medium text-backlot-text">{f.name}</h3>
                <p className="mt-1 text-sm text-backlot-muted">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Architecture Diagram — Interactive SVG */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <motion.div {...fadeUp} className="text-center">
          <h2 className="font-serif text-3xl text-backlot-text md:text-4xl">Architecture</h2>
          <p className="mx-auto mt-3 max-w-xl text-backlot-muted">Six layers working in harmony — from user to Solana programs.</p>
        </motion.div>

        {/* Full system architecture diagram */}
        <motion.div {...fadeUp} className="mt-12 rounded-2xl border border-white/5 bg-backlot-surface/50 p-4 md:p-8">
          <ArchitectureDiagram />
        </motion.div>

        {/* Tech stack cards */}
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {techStack.map((stack, i) => (
            <motion.div
              key={stack.layer}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-white/5 bg-backlot-surface p-5"
            >
              <h3 className="text-xs font-medium uppercase tracking-wider text-backlot-lavender">{stack.layer}</h3>
              <ul className="mt-3 space-y-2">
                {stack.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-backlot-text">
                    <span className="h-1 w-1 rounded-full bg-backlot-gold" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Data Flow Diagrams */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <motion.div {...fadeUp} className="text-center">
          <h2 className="font-serif text-3xl text-backlot-text md:text-4xl">Data Flows</h2>
          <p className="mx-auto mt-3 max-w-xl text-backlot-muted">How data moves through the system — three core flows that power the experience.</p>
        </motion.div>
        <div className="mt-12">
          <DataFlowDiagram />
        </div>
      </section>

      {/* Scaling Roadmap */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <motion.div {...fadeUp} className="text-center">
          <h2 className="font-serif text-3xl text-backlot-text md:text-4xl">The Road to <span className="text-backlot-tropical">Scale</span></h2>
          <p className="mx-auto mt-3 max-w-xl text-backlot-muted">From one project in Jamaica to a global creator platform.</p>
        </motion.div>
        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {scaleSteps.map((step, i) => (
            <motion.div
              key={step.phase}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-xl border p-5 ${
                step.status === "active"
                  ? "border-backlot-gold/30 bg-backlot-gold/5"
                  : "border-white/5 bg-backlot-surface"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium uppercase tracking-wider ${
                  step.status === "active" ? "text-backlot-gold" : "text-backlot-muted"
                }`}>{step.phase}</span>
                {step.status === "active" && (
                  <span className="flex items-center gap-1 rounded-full bg-backlot-gold/10 px-2 py-0.5 text-xs text-backlot-gold">
                    <Zap size={10} /> Now
                  </span>
                )}
              </div>
              <h3 className="mt-2 font-medium text-backlot-text">{step.title}</h3>
              <ul className="mt-3 space-y-1.5">
                {step.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-backlot-muted">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-backlot-lavender/50" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* The Hook — Why Backlot Wins */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <motion.div {...fadeUp} className="rounded-2xl border border-backlot-gold/20 bg-gradient-to-br from-backlot-gold/5 via-backlot-surface to-backlot-lavender/5 p-8 md:p-12">
          <h2 className="font-serif text-3xl text-backlot-text md:text-4xl">Why Backlot Wins</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-backlot-gold/10">
                <Rocket size={18} className="text-backlot-gold" />
              </div>
              <h3 className="mt-3 font-medium text-backlot-text">Built In Public</h3>
              <p className="mt-1 text-sm text-backlot-muted">This isn&apos;t a pitch deck, it&apos;s a live feed. The 24/7 stream is running, the token is live and the community is already voting on what happens next.</p>
            </div>
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-backlot-lavender/10">
                <Users size={18} className="text-backlot-lavender" />
              </div>
              <h3 className="mt-3 font-medium text-backlot-text">Real-World Impact</h3>
              <p className="mt-1 text-sm text-backlot-muted">We&apos;re starting in Jamaica IRL, not in another dashboard. We follow real people and ambitious projects on the ground and show how on-chain decisions change real places.</p>
            </div>
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-backlot-tropical/10">
                <Sparkles size={18} className="text-backlot-tropical" />
              </div>
              <h3 className="mt-3 font-medium text-backlot-text">Solana-Native</h3>
              <p className="mt-1 text-sm text-backlot-muted">Backlot is wired into Solana end to end with 8 deep integrations. Blinks, cNFTs, swaps and more. So every vote, reward and experiment feels fast, cheap. This is what building on Solana looks like.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-8">
        <motion.div {...fadeUp} className="text-center">
          <p className="text-sm uppercase tracking-widest text-backlot-lavender">The Social Experiment Starts Now</p>
          <h2 className="mt-4 font-serif text-4xl text-backlot-text md:text-5xl">
            Let&apos;s make <span className="text-backlot-gold">something real</span>.
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="https://pump.fun/coin/DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-backlot-gold px-8 py-3 font-medium text-backlot-bg transition hover:bg-backlot-gold/90">
              Get $BACKLOT <ExternalLink size={14} />
            </a>
            <Link href="/live" className="inline-flex items-center gap-2 rounded-lg border border-backlot-lavender/30 px-8 py-3 font-medium text-backlot-lavender transition hover:bg-backlot-lavender/10">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> Watch Live
            </Link>
          </div>
          <p className="mx-auto mt-12 max-w-lg text-sm text-backlot-muted">
            Built with love from Jamaica and the internet.<br />
            Token: <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-backlot-lavender">DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump</code>
          </p>
        </motion.div>
      </section>
    </div>
  );
}
