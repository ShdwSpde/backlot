"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type TechPerson = {
  id: string;
  name: string;
  avatar: string;
  color: string;
  role: string;
};

type ChatMessage = {
  from: string;
  text: string;
  reaction?: string;
  code?: string;
  isSystem?: boolean;
  replyTo?: string;
  delay: number;
};

const tech: Record<string, TechPerson> = {
  nextjs: { id: "nextjs", name: "Next.js", avatar: "N", color: "#F5F5F5", role: "The Router" },
  supabase: { id: "supabase", name: "Supabase", avatar: "S", color: "#2DD4BF", role: "The Database" },
  solana: { id: "solana", name: "Solana", avatar: "◎", color: "#B8A9D4", role: "The Chain" },
  wallet: { id: "wallet", name: "Phantom", avatar: "👻", color: "#AB9FF2", role: "The Wallet" },
  jupiter: { id: "jupiter", name: "Jupiter", avatar: "J", color: "#C5A644", role: "The DEX" },
  bubblegum: { id: "bubblegum", name: "Bubblegum", avatar: "🫧", color: "#2DD4BF", role: "cNFT Minter" },
  framer: { id: "framer", name: "Framer Motion", avatar: "~", color: "#FF4088", role: "The Animator" },
  tailwind: { id: "tailwind", name: "Tailwind", avatar: "T", color: "#38BDF8", role: "The Stylist" },
  memo: { id: "memo", name: "Memo Program", avatar: "📝", color: "#60A5FA", role: "On-chain Notes" },
  helius: { id: "helius", name: "Helius", avatar: "H", color: "#F97316", role: "The RPC" },
  realtime: { id: "realtime", name: "Realtime", avatar: "⚡", color: "#2DD4BF", role: "Supabase Sidekick" },
  system: { id: "system", name: "System Program", avatar: "Σ", color: "#F472B6", role: "SOL Mover" },
};

const chatScenes: { title: string; subtitle: string; messages: ChatMessage[] }[] = [
  {
    title: "🗳️ Someone Casts a Vote",
    subtitle: "What happens when a $BACKLOT holder votes on a poll",
    messages: [
      { from: "wallet", text: "yo i just connected. user wants to vote on \"Should we film the sunrise?\"", delay: 0 },
      { from: "nextjs", text: "cool cool, let me check their tier first", delay: 800 },
      { from: "nextjs", text: "hey @Supabase what tier is wallet 7xK3...m9Rp?", delay: 1500 },
      { from: "supabase", text: "checking votes table... they've voted 12 times before. OG supporter.", delay: 2300 },
      { from: "nextjs", text: "@Phantom what's their $BACKLOT balance?", delay: 3000 },
      { from: "wallet", text: "42,069 tokens 😎", delay: 3600 },
      { from: "nextjs", text: "Producer tier. vote weight = 42,069. writing to supabase now...", delay: 4200 },
      { from: "supabase", text: "INSERT INTO votes ✓ — weighted_count updated on poll_options", delay: 5000, code: "{ poll_id, option_id, wallet: '7xK3...', weight: 42069 }" },
      { from: "realtime", text: "BROADCASTING to all connected clients rn 📡", delay: 5800 },
      { from: "framer", text: "ooh new data! animating the vote bar from 34% → 67% with easeOut", delay: 6500 },
      { from: "nextjs", text: "also minting a receipt. @Bubblegum you up?", delay: 7200 },
      { from: "bubblegum", text: "always. gimme the merkle tree address and i'll compress this into a cNFT", delay: 7900 },
      { from: "bubblegum", text: "✅ minted! signature: 4xYz...mint. cost: mass amounts of nothing (compressed)", delay: 8800 },
      { from: "supabase", text: "updated vote_receipts with mint address. we're clean.", delay: 9500 },
      { from: "wallet", text: "user sees \"Vote recorded — cNFT receipt pending\" and feels powerful", delay: 10200, reaction: "🎉" },
    ],
  },
  {
    title: "🐦 A Blink Appears on Twitter",
    subtitle: "When someone shares a Backlot vote as a Solana Blink",
    messages: [
      { from: "nextjs", text: "someone just hit GET /api/actions/vote?pollId=abc123", delay: 0 },
      { from: "supabase", text: "poll \"What project should we document next?\" — 3 options loaded", delay: 700 },
      { from: "nextjs", text: "returning Actions metadata with CORS headers. Twitter should render this as a card.", delay: 1400, code: '{ title: "BACKLOT Vote", links: { actions: [...] } }' },
      { from: "memo", text: "wait is someone about to use me?? 👀", delay: 2100 },
      { from: "nextjs", text: "POST just came in. someone on Twitter clicked \"Portland, Jamaica\" 🇯🇲", delay: 2800 },
      { from: "solana", text: "getLatestBlockhash... here you go: block 284729164", delay: 3500 },
      { from: "memo", text: "LET'S GO. encoding vote data as a memo instruction:", delay: 4200, code: '{ type: "backlot_vote", poll: "abc123", option: "opt_2" }' },
      { from: "nextjs", text: "transaction serialized, sending back to the Blink renderer", delay: 4900 },
      { from: "wallet", text: "user signs in their wallet extension right from the tweet. no app switch needed.", delay: 5600 },
      { from: "solana", text: "confirmed. vote is literally on the blockchain now. forever.", delay: 6300, reaction: "🔗" },
      { from: "supabase", text: "vote + receipt recorded on my end too. both worlds in sync.", delay: 7000 },
      { from: "memo", text: "i love my job. i'm literally just a post-it note on the blockchain.", delay: 7700 },
    ],
  },
  {
    title: "💰 Funding a Milestone",
    subtitle: "When someone contributes SOL to The Complex build",
    messages: [
      { from: "wallet", text: "user selected 0.1 SOL for milestone \"Foundation Pour\"", delay: 0 },
      { from: "nextjs", text: "POST /api/fund-milestone — building a SystemProgram.transfer", delay: 700 },
      { from: "system", text: "oh hell yeah. lamports = 100,000,000. from user → treasury wallet.", delay: 1400 },
      { from: "solana", text: "fresh blockhash served. you've got ~60 seconds to get this signed.", delay: 2100 },
      { from: "nextjs", text: "tx serialized as base64, sending to client for signing", delay: 2800 },
      { from: "wallet", text: "\"Approve transaction — 0.1 SOL\" popup shown. user clicks approve.", delay: 3500 },
      { from: "wallet", text: "sendTransaction fired. fingers crossed... 🤞", delay: 4200 },
      { from: "solana", text: "CONFIRMED at slot 284729201. signature: 5mNx...txid", delay: 4900, reaction: "✅" },
      { from: "supabase", text: "INSERT milestone_contributions — 0.1 SOL from 7xK3...", delay: 5600, code: "{ milestone_id, wallet_address, amount: 0.1, tx_signature }" },
      { from: "supabase", text: "UPDATE milestones SET current_amount = current_amount + 0.1", delay: 6300 },
      { from: "realtime", text: "PUSHING update to all clients. progress bar is about to move 🎬", delay: 7000 },
      { from: "framer", text: "animating progress bar 67.4% → 68.2% with a satisfying spring. you're welcome.", delay: 7700 },
      { from: "system", text: "another day, another SOL moved for the culture 🇯🇲", delay: 8400, reaction: "🌴" },
    ],
  },
  {
    title: "📊 Token Dashboard Refreshes",
    subtitle: "Every 30 seconds, the dashboard gets fresh data",
    messages: [
      { from: "nextjs", text: "it's been 30 seconds. time to refresh /api/token-stats", delay: 0 },
      { from: "jupiter", text: "price check on $BACKLOT (DSL6Xbj...5pump)...", delay: 700 },
      { from: "jupiter", text: "$0.0000847 per token. up 12% from last check 📈", delay: 1400, code: "api.jup.ag/price/v2?ids=DSL6Xbj..." },
      { from: "helius", text: "getAsset via DAS API... supply is 999,847,203 tokens", delay: 2100 },
      { from: "nextjs", text: "crunching numbers... market cap = $84,720", delay: 2800 },
      { from: "nextjs", text: "returning stats with 30s revalidation. ISR doing its thing.", delay: 3500, code: "{ price: 0.0000847, marketCap: 84720, supply: 999847203 }" },
      { from: "framer", text: "new price! fading in the update with a smooth 0.3s transition", delay: 4200 },
      { from: "tailwind", text: "i styled those stat cards btw. backlot-surface bg, rounded-xl, the works. 💅", delay: 4900 },
      { from: "jupiter", text: "see you in 30 seconds lol", delay: 5600 },
      { from: "helius", text: "same. this is my life now. and i love it.", delay: 6300, reaction: "♻️" },
    ],
  },
  {
    title: "🏆 Leaderboard Calculates Scores",
    subtitle: "When someone opens /leaderboard",
    messages: [
      { from: "nextjs", text: "GET /api/leaderboard?wallet=7xK3... — let's see who's winning", delay: 0 },
      { from: "supabase", text: "pulling all unique wallets from votes + chat_messages...", delay: 700 },
      { from: "supabase", text: "found 847 unique participants. calculating scores for each...", delay: 1400 },
      { from: "supabase", text: "formula: votes×10 + polls×25 + chats×2 + receipts×15", delay: 2100, code: "totalScore = (12 * 10) + (8 * 25) + (156 * 2) + (12 * 15) = 812" },
      { from: "supabase", text: "wallet 7xK3... is ranked #3 with 812 points. Legend status.", delay: 2800, reaction: "🏅" },
      { from: "nextjs", text: "returning top 50 + myRank. no token balances exposed.", delay: 3500 },
      { from: "framer", text: "staggering the entry animations. gold shimmer on #1, silver on #2, bronze on #3.", delay: 4200 },
      { from: "tailwind", text: "the ScoreBadge component was MY idea. \"Legend\" in backlot-gold. *chef's kiss*", delay: 4900 },
      { from: "wallet", text: "user sees their rank and feels seen. engagement+1.", delay: 5600 },
    ],
  },
];

function Avatar({ person }: { person: TechPerson }) {
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
      style={{ backgroundColor: person.color + "20", color: person.color, border: `1px solid ${person.color}40` }}
    >
      {person.avatar}
    </div>
  );
}

function ChatBubble({ msg }: { msg: ChatMessage & { person: TechPerson }; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="flex gap-2.5 px-4 py-1"
    >
      <Avatar person={msg.person} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium" style={{ color: msg.person.color }}>{msg.person.name}</span>
          <span className="text-[10px] text-backlot-muted">{msg.person.role}</span>
        </div>
        <p className="mt-0.5 text-sm text-backlot-text/90">{msg.text}</p>
        {msg.code && (
          <pre className="mt-1.5 overflow-x-auto rounded-lg bg-white/5 px-3 py-2 text-[11px] text-backlot-lavender/80">
            <code>{msg.code}</code>
          </pre>
        )}
        {msg.reaction && (
          <div className="mt-1 inline-flex rounded-full bg-white/5 px-2 py-0.5 text-xs">
            {msg.reaction}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function TypingIndicator({ person }: { person: TechPerson }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-2.5 px-4 py-1"
    >
      <Avatar person={person} />
      <div className="flex gap-1 rounded-xl bg-white/5 px-3 py-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: person.color }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function ChatScene({ scene, isActive }: { scene: typeof chatScenes[0]; isActive: boolean }) {
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [typing, setTyping] = useState<TechPerson | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) {
      setVisibleMessages(0);
      setTyping(null);
      return;
    }

    let cancelled = false;
    const showMessages = async () => {
      for (let i = 0; i < scene.messages.length; i++) {
        if (cancelled) return;
        const msg = scene.messages[i];
        const person = tech[msg.from];

        // Show typing indicator
        setTyping(person);
        await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
        if (cancelled) return;

        // Show message
        setTyping(null);
        setVisibleMessages(i + 1);
        await new Promise((r) => setTimeout(r, 300 + msg.text.length * 8));
        if (cancelled) return;
      }
    };

    const timeout = setTimeout(showMessages, 400);
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [isActive, scene.messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleMessages, typing]);

  const enrichedMessages = scene.messages
    .slice(0, visibleMessages)
    .map((m) => ({ ...m, person: tech[m.from] }));

  return (
    <div className="flex h-[520px] flex-col rounded-2xl border border-white/5 bg-backlot-surface overflow-hidden">
      {/* Chat header */}
      <div className="border-b border-white/5 px-4 py-3">
        <h3 className="text-sm font-medium text-backlot-text">{scene.title}</h3>
        <p className="text-xs text-backlot-muted">{scene.subtitle}</p>
        <div className="mt-2 flex -space-x-1.5">
          {Array.from(new Set(scene.messages.map((m) => m.from))).map((id) => (
            <div
              key={id}
              className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold ring-2 ring-backlot-surface"
              style={{ backgroundColor: tech[id].color + "30", color: tech[id].color }}
            >
              {tech[id].avatar}
            </div>
          ))}
          <span className="ml-2 self-center text-[10px] text-backlot-muted">
            {Array.from(new Set(scene.messages.map((m) => m.from))).length} in chat
          </span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-3 space-y-1">
        <AnimatePresence mode="popLayout">
          {enrichedMessages.map((msg, i) => (
            <ChatBubble key={i} msg={msg} index={i} />
          ))}
        </AnimatePresence>
        <AnimatePresence>
          {typing && <TypingIndicator person={typing} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function TechChatPage() {
  const [activeScene, setActiveScene] = useState(0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm uppercase tracking-widest text-backlot-lavender">Architecture, but make it social</p>
        <h1 className="mt-2 font-serif text-3xl text-backlot-text md:text-5xl">
          The <span className="text-backlot-gold">Group Chat</span>
        </h1>
        <p className="mt-3 text-backlot-muted">
          What if the technologies in Backlot had a group chat? Here&apos;s what they&apos;d say to each other
          every time something happens on the platform. Each message represents real data flow in the codebase.
        </p>
      </motion.div>

      {/* Scene Selector */}
      <div className="mt-8 flex flex-wrap gap-2">
        {chatScenes.map((scene, i) => (
          <button
            key={i}
            onClick={() => setActiveScene(i)}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${
              activeScene === i
                ? "bg-backlot-gold/10 text-backlot-gold border border-backlot-gold/20"
                : "bg-white/5 text-backlot-muted hover:text-backlot-text border border-transparent"
            }`}
          >
            {scene.title}
          </button>
        ))}
      </div>

      {/* Active Chat */}
      <div className="mt-6">
        <ChatScene
          key={activeScene}
          scene={chatScenes[activeScene]}
          isActive={true}
        />
      </div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 rounded-xl border border-white/5 bg-backlot-surface p-5"
      >
        <h3 className="text-xs font-medium uppercase tracking-wider text-backlot-muted">The Cast</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {Object.values(tech).map((t) => (
            <div key={t.id} className="flex items-center gap-2">
              <Avatar person={t} />
              <div>
                <p className="text-xs font-medium" style={{ color: t.color }}>{t.name}</p>
                <p className="text-[10px] text-backlot-muted">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
