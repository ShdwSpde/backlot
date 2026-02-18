"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, Volume2 } from "lucide-react";

type TimelineEvent = {
  time: string;
  title: string;
  narration: string;
  codePath: string;
  actors: string[];
  mood: "calm" | "action" | "dramatic" | "celebration" | "night";
  detail?: string;
};

const moodColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  calm: { bg: "bg-blue-500/5", border: "border-blue-500/10", text: "text-blue-300", glow: "bg-blue-500/10" },
  action: { bg: "bg-backlot-gold/5", border: "border-backlot-gold/10", text: "text-backlot-gold", glow: "bg-backlot-gold/10" },
  dramatic: { bg: "bg-red-500/5", border: "border-red-500/10", text: "text-red-300", glow: "bg-red-500/10" },
  celebration: { bg: "bg-backlot-tropical/5", border: "border-backlot-tropical/10", text: "text-backlot-tropical", glow: "bg-backlot-tropical/10" },
  night: { bg: "bg-backlot-lavender/5", border: "border-backlot-lavender/10", text: "text-backlot-lavender", glow: "bg-backlot-lavender/10" },
};

const timeline: TimelineEvent[] = [
  {
    time: "5:47 AM",
    title: "The Sun Rises Over Portland",
    narration: "Dawn breaks over the Blue Mountains of Jamaica. The pump.fun livestream captures the first light hitting The Complex. Somewhere in Ohio, a holder named @cryptoSunrise42 notices. The stream embed loads — a single iframe, dignified and patient, waiting for the world to wake up.",
    codePath: "components/live/StreamEmbed.tsx → iframe src=\"pump.fun/coin/DSL6Xbj...\"",
    actors: ["Pump.fun Embed", "StreamEmbed.tsx"],
    mood: "calm",
  },
  {
    time: "7:02 AM",
    title: "First Wallet of the Day Connects",
    narration: "The early bird. A wallet tentatively reaches out to the Phantom adapter. \"Hello,\" it whispers. The WalletProvider wraps it in a warm embrace of context. useBacklotTier springs to life, checks the balance — 67,000 $BACKLOT. Producer tier. The gates swing open. Behind the scenes, a humble RPC call to Solana mainnet confirms: this wallet is worthy.",
    codePath: "WalletProvider.tsx → useBacklotTier.ts → getBacklotBalance() → getParsedTokenAccountsByOwner",
    actors: ["Phantom", "WalletProvider", "useBacklotTier", "Solana RPC"],
    mood: "calm",
  },
  {
    time: "8:15 AM",
    title: "The Token Dashboard Awakens",
    narration: "Every 30 seconds, a small miracle occurs. The token-stats API route stretches, yawns, and asks Jupiter for the current price. \"$0.0000847,\" Jupiter replies, matter-of-factly. Helius chimes in with the supply count. The dashboard renders four gleaming stat cards — price, market cap, holders, supply — each one a tiny window into the $BACKLOT economy. Framer Motion gives them a gentle fade-in. Tailwind makes sure they're rounded-xl.",
    codePath: "/api/token-stats → Jupiter Price API → Helius DAS → TokenDashboard.tsx",
    actors: ["Jupiter API", "Helius DAS", "TokenDashboard", "Framer Motion"],
    mood: "action",
  },
  {
    time: "10:30 AM",
    title: "A New Poll Emerges",
    narration: "The executive producer has spoken. A new poll materializes in the Supabase polls table: \"Should we paint the studio wall gold or tropical green?\" Two options. One destiny. PollCard.tsx receives the data through a Supabase Realtime subscription and renders it with the quiet confidence of a component that knows its purpose. The vote buttons glow, waiting.",
    codePath: "Supabase Realtime → supabase.channel('poll-${id}') → PollCard.tsx → motion.div whileInView",
    actors: ["Supabase", "Realtime", "PollCard", "Framer Motion"],
    mood: "action",
  },
  {
    time: "11:47 AM",
    title: "The Great Vote",
    narration: "It happens fast. A Producer-tier wallet clicks \"Tropical Green.\" The handleVote function fires. Weight: 67,000 — the token balance amplifies the voice. Supabase receives the INSERT and the weighted_count swells. But wait — there's more. In the background, a fetch call whispers to /api/mint-vote-receipt. Bubblegum receives the request. The Merkle tree rustles. A compressed NFT is born — proof that this wallet believed in tropical green. Cost of minting? Basically nothing. Value? Priceless.",
    codePath: "PollCard handleVote → votes INSERT (weight: 67000) → /api/mint-vote-receipt → Bubblegum mintV1 → cNFT minted",
    actors: ["PollCard", "Supabase", "Bubblegum", "Merkle Tree"],
    mood: "dramatic",
    detail: "The vote receipt appears in VoteReceiptBanner.tsx with a satisfying ✓ minted indicator.",
  },
  {
    time: "1:15 PM",
    title: "A Blink in the Wild",
    narration: "Someone tweets a Backlot poll link. Twitter sees the actions.json file and thinks: \"I can render this.\" The GET endpoint serves up Solana Actions metadata — icon, title, voting buttons. A viewer in Lagos sees the card, clicks \"Gold\" without ever leaving Twitter. The POST endpoint builds a Memo transaction, the wallet signs it, and the vote is recorded on-chain AND in Supabase. Two databases. One truth. The Memo Program, that humble post-it note of the Solana ecosystem, has done its job again.",
    codePath: "actions.json → GET /api/actions/vote → POST → Memo Program → Supabase INSERT",
    actors: ["Twitter/X", "Solana Actions", "Memo Program", "Supabase"],
    mood: "action",
  },
  {
    time: "3:30 PM",
    title: "Milestone Gets Funded",
    narration: "The FundMilestone component unfurls. Four preset amounts: 0.01, 0.05, 0.1, 0.5 SOL. Someone picks 0.1 — modest but meaningful. The API route builds a SystemProgram.transfer. Lamports are calculated (100,000,000 of them). The wallet signs. Solana confirms. The progress bar on MilestoneTracker inches forward — 67.4% to 68.2%. Framer Motion animates it with a spring curve that says \"every contribution matters.\" Because it does.",
    codePath: "FundMilestone.tsx → /api/fund-milestone → SystemProgram.transfer → confirmTransaction → Supabase UPDATE",
    actors: ["FundMilestone", "System Program", "Solana", "MilestoneTracker"],
    mood: "celebration",
  },
  {
    time: "5:00 PM",
    title: "The Jupiter Swap",
    narration: "A new visitor discovers Backlot. They don't have $BACKLOT yet. The TokenCTA section calls to them. They click \"Swap for $BACKLOT.\" Jupiter Terminal v3 loads — a script tag, elegant in its simplicity. The swap modal opens, pre-configured: SOL in, $BACKLOT out, output mint locked. The visitor becomes a holder. The holder becomes a Supporter. The Supporter becomes part of the story.",
    codePath: "TokenCTA.tsx → JupiterSwapButton → window.Jupiter.init({ outputMint: 'DSL6Xbj...' })",
    actors: ["Jupiter Terminal", "JupiterSwapButton", "TokenCTA"],
    mood: "celebration",
  },
  {
    time: "7:45 PM",
    title: "Leaderboard Reckoning",
    narration: "The leaderboard API runs its calculations with the cold precision of an accountant who loves community engagement. 847 wallets. For each: votes times 10, unique polls times 25, chat messages times 2, cNFT receipts times 15. No token balances. No whale advantages. Just pure participation. The top 50 emerge, sorted by total_score. Gold shimmer for #1. Silver for #2. Bronze for #3. The ScoreBadge component assigns titles — Legend, Power Player, Active, Newcomer — with the gravity of a medieval ceremony.",
    codePath: "/api/leaderboard → aggregate votes, chat_messages, vote_receipts → score formula → Leaderboard.tsx",
    actors: ["Leaderboard API", "Supabase", "Leaderboard.tsx", "ScoreBadge"],
    mood: "dramatic",
  },
  {
    time: "9:30 PM",
    title: "The Chat Comes Alive",
    narration: "Evening in Jamaica means evening everywhere that matters. The live chat fills with messages. Supabase Realtime channels hum with postgres_changes events. Each message is an INSERT, each INSERT is a broadcast, each broadcast is a re-render. The chat component scrolls. Framer Motion animates new messages sliding in from the bottom. GatedContent checks tiers — Supporters can chat, Viewers can watch. Everyone belongs somewhere.",
    codePath: "ChatRoom → supabase.channel('chat') → postgres_changes → AnimatePresence → GatedContent",
    actors: ["Supabase Realtime", "ChatRoom", "GatedContent", "Framer Motion"],
    mood: "night",
  },
  {
    time: "11:58 PM",
    title: "The CRT Overlay Never Sleeps",
    narration: "The day winds down, but the platform doesn't. The CRT overlay — that subtle, nostalgic scanline effect — continues its eternal animation. pointer-events-none, opacity 3%, a fixed div stretched across the entire viewport. It doesn't do anything functional. It doesn't need to. It whispers: \"this is not just a website. this is a broadcast.\" The AppShell wraps everything in its arms. Tomorrow, it all happens again.",
    codePath: "AppShell.tsx → CRTOverlay.tsx → CRTIntro.tsx → position: fixed, z-50, pointer-events-none",
    actors: ["CRTOverlay", "AppShell", "CRTIntro"],
    mood: "night",
    detail: "Somewhere, a token dashboard auto-refreshes one last time. $0.0000851. Up 0.5% from this morning. The experiment continues.",
  },
];

function TimelineDot({ mood, isActive, isPast }: { mood: string; isActive: boolean; isPast: boolean }) {
  const colors = moodColors[mood];
  return (
    <div className="relative flex items-center justify-center">
      <div className={`h-3 w-3 rounded-full transition-all duration-300 ${
        isActive ? `${colors.glow} ring-2` : isPast ? "bg-white/20" : "bg-white/5"
      }`} />
      {isActive && (
        <motion.div
          className={`absolute h-6 w-6 rounded-full ${colors.glow}`}
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </div>
  );
}

export default function DayInTheLifePage() {
  const [activeEvent, setActiveEvent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setActiveEvent((prev) => {
          if (prev >= timeline.length - 1) {
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 6000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing]);

  const skip = () => {
    setActiveEvent((prev) => Math.min(prev + 1, timeline.length - 1));
  };

  const current = timeline[activeEvent];
  const colors = moodColors[current.mood];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm uppercase tracking-widest text-backlot-lavender">Narrated by nobody in particular</p>
        <h1 className="mt-2 font-serif text-3xl text-backlot-text md:text-5xl">
          A Day in the Life of <span className="text-backlot-gold">Backlot</span>
        </h1>
        <p className="mt-3 max-w-2xl text-backlot-muted">
          24 hours of code paths, database writes, and blockchain transactions — narrated like a nature documentary.
          Every event described here is a real interaction in the codebase.
        </p>
      </motion.div>

      {/* Playback Controls */}
      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={() => setPlaying(!playing)}
          className="flex items-center gap-2 rounded-lg bg-backlot-gold/10 px-4 py-2 text-sm text-backlot-gold transition hover:bg-backlot-gold/20"
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
          {playing ? "Pause" : "Auto-play"}
        </button>
        <button
          onClick={skip}
          disabled={activeEvent >= timeline.length - 1}
          className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm text-backlot-muted transition hover:bg-white/10 disabled:opacity-30"
        >
          <SkipForward size={14} /> Skip
        </button>
        <div className="ml-auto flex items-center gap-2 text-xs text-backlot-muted">
          <Volume2 size={12} />
          <span>Read in David Attenborough&apos;s voice for best results</span>
        </div>
      </div>

      {/* Main Layout: Timeline + Detail */}
      <div className="mt-8 grid gap-8 md:grid-cols-[200px_1fr]">
        {/* Timeline Rail */}
        <div className="relative">
          <div className="absolute left-[5px] top-0 bottom-0 w-[2px] bg-white/5" />
          <div className="space-y-1">
            {timeline.map((event, i) => (
              <button
                key={i}
                onClick={() => { setActiveEvent(i); setPlaying(false); }}
                className={`relative flex items-center gap-3 rounded-lg px-2 py-2 text-left transition w-full ${
                  activeEvent === i ? "bg-white/5" : "hover:bg-white/5"
                }`}
              >
                <TimelineDot mood={event.mood} isActive={activeEvent === i} isPast={i < activeEvent} />
                <div>
                  <p className={`text-xs font-mono ${activeEvent === i ? colors.text : "text-backlot-muted"}`}>
                    {event.time}
                  </p>
                  <p className={`text-xs ${activeEvent === i ? "text-backlot-text" : "text-backlot-muted/60"}`}>
                    {event.title.length > 22 ? event.title.slice(0, 22) + "..." : event.title}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeEvent}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`rounded-2xl border ${colors.border} ${colors.bg} p-6 md:p-8`}
          >
            {/* Time + Title */}
            <div className="flex items-start justify-between">
              <div>
                <span className={`font-mono text-sm ${colors.text}`}>{current.time}</span>
                <h2 className="mt-1 font-serif text-2xl text-backlot-text">{current.title}</h2>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider ${colors.bg} ${colors.text} border ${colors.border}`}>
                {current.mood}
              </span>
            </div>

            {/* Narration */}
            <div className="mt-6 rounded-xl bg-black/20 p-5">
              <p className="text-sm italic leading-relaxed text-backlot-text/80">
                &ldquo;{current.narration}&rdquo;
              </p>
            </div>

            {current.detail && (
              <p className="mt-4 text-xs text-backlot-muted italic">{current.detail}</p>
            )}

            {/* Code Path */}
            <div className="mt-5">
              <p className="text-[10px] uppercase tracking-wider text-backlot-muted">Code Path</p>
              <pre className="mt-1.5 overflow-x-auto rounded-lg bg-black/30 px-4 py-3 text-xs text-backlot-lavender">
                <code>{current.codePath}</code>
              </pre>
            </div>

            {/* Actors */}
            <div className="mt-5">
              <p className="text-[10px] uppercase tracking-wider text-backlot-muted">Technologies Involved</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {current.actors.map((actor) => (
                  <span key={actor} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-backlot-text">
                    {actor}
                  </span>
                ))}
              </div>
            </div>

            {/* Progress */}
            <div className="mt-6 flex items-center gap-3">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className={`h-full rounded-full`}
                  style={{ backgroundColor: moodColors[current.mood].text.replace("text-", "") }}
                  initial={{ width: 0 }}
                  animate={{ width: `${((activeEvent + 1) / timeline.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-xs text-backlot-muted">
                {activeEvent + 1} / {timeline.length}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
