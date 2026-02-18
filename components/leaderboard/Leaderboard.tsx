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
  if (score >= 500) return <span className="text-backlot-gold">Legend</span>;
  if (score >= 200) return <span className="text-backlot-tropical">Power Player</span>;
  if (score >= 50) return <span className="text-backlot-lavender">Active</span>;
  return <span className="text-backlot-muted">Newcomer</span>;
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
      {myRank && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl border border-backlot-gold/20 bg-gradient-to-r from-backlot-gold/5 to-transparent p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-backlot-muted">Your Rank</p>
              <p className="font-serif text-2xl text-backlot-gold">#{myRank.rank}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-backlot-muted">Participation Score</p>
              <p className="font-serif text-2xl text-backlot-text">{myRank.total_score}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-4 text-xs text-backlot-muted">
            <span className="flex items-center gap-1"><Vote size={12} /> {myRank.votes_cast} votes</span>
            <span className="flex items-center gap-1"><MessageSquare size={12} /> {myRank.chat_messages_sent} chats</span>
            <span className="flex items-center gap-1"><Award size={12} /> {myRank.cnft_receipts} receipts</span>
          </div>
        </motion.div>
      )}

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
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                i === 0 ? "bg-backlot-gold/20 text-backlot-gold"
                  : i === 1 ? "bg-gray-400/20 text-gray-300"
                    : i === 2 ? "bg-amber-700/20 text-amber-600"
                      : "bg-white/5 text-backlot-muted"
              }`}>
                {i + 1}
              </span>
              <div>
                <p className="text-sm text-backlot-text">{truncateWallet(entry.wallet_address)}</p>
                <p className="text-xs"><ScoreBadge score={entry.total_score} /></p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-serif text-lg text-backlot-text">{entry.total_score}</p>
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
