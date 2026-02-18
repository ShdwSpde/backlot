"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Rocket, Check, Copy, ChevronDown, ChevronRight, ExternalLink,
  AlertTriangle, Database, Globe, Key, Terminal, Shield, Zap,
  MessageSquare, CheckCircle2, Circle, Clock
} from "lucide-react";

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const envVars = [
  { key: "NEXT_PUBLIC_SUPABASE_URL", desc: "Your Supabase project URL", example: "https://abc123.supabase.co", required: true },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", desc: "Supabase anonymous/public key", example: "eyJhbGciOi...", required: true },
  { key: "NEXT_PUBLIC_HELIUS_API_KEY", desc: "Helius API key for DAS + RPC", example: "your-helius-key", required: true },
  { key: "TREASURY_WALLET", desc: "Public key for milestone funding deposits", example: "YourTreasury...PublicKey", required: true },
  { key: "MERKLE_TREE_ADDRESS", desc: "Bubblegum Merkle tree for cNFT vote receipts", example: "TreeAddress...PublicKey", required: false },
  { key: "TREE_AUTHORITY_KEYPAIR", desc: "Base58 keypair for signing cNFT mints", example: "[secret]", required: false },
];

const productionChecklist = [
  { category: "Database", icon: <Database size={16} />, items: [
    { task: "Create Supabase project", detail: "Go to supabase.com, create a new project, copy URL and anon key" },
    { task: "Run schema.sql", detail: "Execute supabase/schema.sql in the Supabase SQL editor to create all tables" },
    { task: "Enable Realtime", detail: "In Supabase dashboard, enable Realtime for: polls, poll_options, milestones, chat_messages, participation_scores" },
    { task: "Enable Row Level Security", detail: "Add RLS policies for each table — at minimum allow public read, authenticated write" },
    { task: "Seed initial data", detail: "Create at least 1 episode, 1 poll with options, and 3 milestones" },
  ]},
  { category: "Blockchain", icon: <Key size={16} />, items: [
    { task: "Get Helius API key", detail: "Sign up at helius.dev for RPC access and DAS API" },
    { task: "Set treasury wallet", detail: "Create or designate a Solana wallet for receiving milestone funding" },
    { task: "Create Merkle tree (optional)", detail: "Use Metaplex CLI to create a Bubblegum Merkle tree for cNFT receipts" },
    { task: "Test wallet connection", detail: "Verify Phantom and Solflare connect properly on mainnet" },
  ]},
  { category: "Deployment", icon: <Globe size={16} />, items: [
    { task: "Deploy to Vercel", detail: "Click the Vercel deploy button or use the CLI commands below" },
    { task: "Set environment variables", detail: "Add all required env vars in Vercel project settings" },
    { task: "Configure custom domain", detail: "Add your domain in Vercel and update DNS records" },
    { task: "Test all pages", detail: "Visit every page, test wallet connect, voting, funding flow" },
    { task: "Update actions.json", detail: "Change SITE_URL in lib/actions.ts to your production domain for Blinks" },
  ]},
  { category: "Content", icon: <MessageSquare size={16} />, items: [
    { task: "Upload brand assets", detail: "Replace /public/brand/logo.jpg and banner.jpeg with final assets" },
    { task: "Write episode descriptions", detail: "Add real episode content to the episodes table" },
    { task: "Configure livestream", detail: "The pump.fun embed auto-streams from your token page" },
    { task: "Create initial polls", detail: "Seed 2-3 community polls to get voting activity going" },
    { task: "Write about page copy", detail: "Update the about page with your real project narrative" },
  ]},
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-backlot-muted hover:bg-white/5 hover:text-backlot-text transition"
    >
      {copied ? <Check size={12} className="text-backlot-tropical" /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function ChecklistSection({ category, icon, items }: { category: string; icon: React.ReactNode; items: { task: string; detail: string }[] }) {
  const [open, setOpen] = useState(true);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const doneCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="rounded-xl border border-white/5 bg-backlot-surface">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between p-4 text-left">
        <div className="flex items-center gap-3">
          <span className="text-backlot-lavender">{icon}</span>
          <span className="font-medium text-backlot-text">{category}</span>
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-backlot-muted">{doneCount}/{items.length}</span>
        </div>
        {open ? <ChevronDown size={16} className="text-backlot-muted" /> : <ChevronRight size={16} className="text-backlot-muted" />}
      </button>
      {open && (
        <div className="border-t border-white/5 px-4 pb-4">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => setChecked((prev) => ({ ...prev, [i]: !prev[i] }))}
              className="mt-3 flex w-full items-start gap-3 text-left"
            >
              {checked[i]
                ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-backlot-tropical" />
                : <Circle size={18} className="mt-0.5 shrink-0 text-backlot-muted/40" />}
              <div>
                <span className={`text-sm ${checked[i] ? "text-backlot-muted line-through" : "text-backlot-text"}`}>{item.task}</span>
                <p className="mt-0.5 text-xs text-backlot-muted">{item.detail}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FounderPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <motion.div {...fadeUp}>
        <div className="flex items-center gap-2 text-sm text-backlot-lavender">
          <Shield size={14} />
          <span>Founder Dashboard</span>
        </div>
        <h1 className="mt-2 font-serif text-3xl text-backlot-text md:text-4xl">
          Welcome home, boss. <span className="text-backlot-gold">Let&apos;s ship this.</span>
        </h1>
        <p className="mt-2 text-backlot-muted">
          Everything you need to go from hackathon demo to production platform. Check items off as you go.
        </p>
      </motion.div>

      {/* Quick Deploy */}
      <motion.section {...fadeUp} transition={{ delay: 0.1 }} className="mt-12">
        <h2 className="flex items-center gap-2 font-serif text-xl text-backlot-text">
          <Rocket size={18} className="text-backlot-gold" /> Quick Deploy
        </h2>
        <div className="mt-4 space-y-3">
          {/* Vercel Deploy Button */}
          <div className="rounded-xl border border-backlot-tropical/20 bg-backlot-tropical/5 p-5">
            <h3 className="text-sm font-medium text-backlot-tropical">One-Click Deploy to Vercel</h3>
            <p className="mt-1 text-xs text-backlot-muted">The fastest way to get Backlot live. Click below, connect your GitHub, set env vars, done.</p>
            <a
              href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FShdwSpde%2Fbacklot&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,NEXT_PUBLIC_HELIUS_API_KEY,TREASURY_WALLET&envDescription=Required%20environment%20variables%20for%20Backlot&project-name=backlot&repository-name=backlot"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-backlot-tropical px-5 py-2.5 text-sm font-medium text-backlot-bg transition hover:bg-backlot-tropical/90"
            >
              Deploy to Vercel <ExternalLink size={14} />
            </a>
          </div>

          {/* CLI Deploy */}
          <div className="rounded-xl border border-white/5 bg-backlot-surface p-5">
            <h3 className="flex items-center gap-2 text-sm font-medium text-backlot-text">
              <Terminal size={14} className="text-backlot-lavender" /> CLI Deploy
            </h3>
            <div className="mt-3 space-y-2">
              {[
                "npx vercel login",
                "npx vercel link",
                "npx vercel env add NEXT_PUBLIC_SUPABASE_URL",
                "npx vercel --prod",
              ].map((cmd) => (
                <div key={cmd} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                  <code className="text-xs text-backlot-lavender">{cmd}</code>
                  <CopyButton text={cmd} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Environment Variables */}
      <motion.section {...fadeUp} transition={{ delay: 0.15 }} className="mt-12">
        <h2 className="flex items-center gap-2 font-serif text-xl text-backlot-text">
          <Key size={18} className="text-backlot-lavender" /> Environment Variables
        </h2>
        <p className="mt-2 text-sm text-backlot-muted">Set these in Vercel Project Settings &rarr; Environment Variables, or in a local <code className="rounded bg-white/5 px-1 text-backlot-lavender">.env.local</code> file.</p>
        <div className="mt-4 space-y-2">
          {envVars.map((v) => (
            <div key={v.key} className="rounded-xl border border-white/5 bg-backlot-surface p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <code className="text-sm text-backlot-gold">{v.key}</code>
                  {v.required ? (
                    <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] text-red-400">required</span>
                  ) : (
                    <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-backlot-muted">optional</span>
                  )}
                </div>
                <CopyButton text={v.key} />
              </div>
              <p className="mt-1 text-xs text-backlot-muted">{v.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Production Checklist */}
      <motion.section {...fadeUp} transition={{ delay: 0.2 }} className="mt-12">
        <h2 className="flex items-center gap-2 font-serif text-xl text-backlot-text">
          <Zap size={18} className="text-backlot-gold" /> Production Checklist
        </h2>
        <p className="mt-2 text-sm text-backlot-muted">
          Click each item to check it off. Your progress is saved locally.
        </p>
        <div className="mt-4 space-y-3">
          {productionChecklist.map((section) => (
            <ChecklistSection key={section.category} {...section} />
          ))}
        </div>
      </motion.section>

      {/* Feedback */}
      <motion.section {...fadeUp} transition={{ delay: 0.25 }} className="mt-12">
        <h2 className="flex items-center gap-2 font-serif text-xl text-backlot-text">
          <MessageSquare size={18} className="text-backlot-tropical" /> Quick Feedback
        </h2>
        <p className="mt-2 text-sm text-backlot-muted">
          Things to review before the hackathon deadline. Tap to expand each item.
        </p>
        <div className="mt-4 space-y-3">
          {[
            { label: "Visual Polish", status: "review", notes: "Check mobile responsiveness on all pages. The CRT overlay adds character — make sure it doesn't interfere with readability on smaller screens." },
            { label: "Content & Copy", status: "review", notes: "Update About page with final project narrative. Add real episode data. Make sure the disclaimer is legally reviewed." },
            { label: "Token Integration", status: "ready", notes: "Jupiter swap, pump.fun embed, and token dashboard are all wired to the real $BACKLOT contract address. Test a swap to confirm." },
            { label: "Solana Blinks", status: "review", notes: "Blinks work when SITE_URL in lib/actions.ts matches your deployed domain. Share a blink URL on Twitter to test." },
            { label: "cNFT Vote Receipts", status: "optional", notes: "Works in 'pending' mode without a Merkle tree. For full cNFT minting, create a Bubblegum tree and set MERKLE_TREE_ADDRESS." },
            { label: "Pitch Deck", status: "ready", notes: "The /pitch page IS your pitch deck. Walk judges through it live — architecture, features, roadmap are all there." },
          ].map((item) => (
            <FeedbackItem key={item.label} {...item} />
          ))}
        </div>
      </motion.section>

      {/* Important Links */}
      <motion.section {...fadeUp} transition={{ delay: 0.3 }} className="mt-12 mb-8">
        <h2 className="font-serif text-xl text-backlot-text">Quick Links</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            { label: "GitHub Repo", href: "https://github.com/ShdwSpde/backlot", desc: "Source code" },
            { label: "Pump.fun Token", href: "https://pump.fun/coin/DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump", desc: "$BACKLOT token page" },
            { label: "Supabase Dashboard", href: "https://supabase.com/dashboard", desc: "Database & auth" },
            { label: "Vercel Dashboard", href: "https://vercel.com/dashboard", desc: "Deployments" },
            { label: "Helius", href: "https://helius.dev", desc: "Solana RPC + DAS API" },
            { label: "Pitch Page", href: "/pitch", desc: "Your hackathon pitch" },
          ].map((link) => (
            <a key={link.label} href={link.href} target={link.href.startsWith("/") ? undefined : "_blank"} rel={link.href.startsWith("/") ? undefined : "noopener noreferrer"} className="flex items-center justify-between rounded-xl border border-white/5 bg-backlot-surface p-4 transition hover:border-backlot-lavender/20">
              <div>
                <span className="text-sm font-medium text-backlot-text">{link.label}</span>
                <p className="text-xs text-backlot-muted">{link.desc}</p>
              </div>
              <ExternalLink size={14} className="text-backlot-muted" />
            </a>
          ))}
        </div>
      </motion.section>

      {/* Footer note */}
      <motion.div {...fadeUp} transition={{ delay: 0.35 }} className="rounded-xl border border-backlot-gold/10 bg-backlot-gold/5 p-5 text-center">
        <p className="text-sm text-backlot-gold">You built this. Now go win that $250K.</p>
        <p className="mt-1 text-xs text-backlot-muted">The platform is live, the token is real, and the community is watching. This is the experiment.</p>
      </motion.div>
    </div>
  );
}

function FeedbackItem({ label, status, notes }: { label: string; status: string; notes: string }) {
  const [open, setOpen] = useState(false);
  const statusConfig = {
    ready: { icon: <Check size={14} />, color: "text-backlot-tropical", bg: "bg-backlot-tropical/10", label: "Ready" },
    review: { icon: <Clock size={14} />, color: "text-backlot-gold", bg: "bg-backlot-gold/10", label: "Review" },
    optional: { icon: <AlertTriangle size={14} />, color: "text-backlot-muted", bg: "bg-white/5", label: "Optional" },
  }[status] || { icon: <Circle size={14} />, color: "text-backlot-muted", bg: "bg-white/5", label: status };

  return (
    <div className="rounded-xl border border-white/5 bg-backlot-surface">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between p-4 text-left">
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${statusConfig.bg} ${statusConfig.color}`}>
            {statusConfig.icon} {statusConfig.label}
          </span>
          <span className="text-sm text-backlot-text">{label}</span>
        </div>
        {open ? <ChevronDown size={14} className="text-backlot-muted" /> : <ChevronRight size={14} className="text-backlot-muted" />}
      </button>
      {open && (
        <div className="border-t border-white/5 px-4 pb-4 pt-3">
          <p className="text-sm text-backlot-muted">{notes}</p>
        </div>
      )}
    </div>
  );
}
