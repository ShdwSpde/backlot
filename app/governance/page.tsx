"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/lib/supabase";
import { useBacklotTier } from "@/hooks/useBacklotTier";
import AnimatedNumber from "@/components/AnimatedNumber";
import TierBadge from "@/components/TierBadge";
import DiamondHandsBadge from "@/components/DiamondHandsBadge";
import type { VoteReceipt } from "@/lib/types";

interface VoteHistoryRow {
  id: string;
  created_at: string;
  weight: number;
  holding_multiplier: number;
  poll: { title: string; type: string } | null;
  option: { label: string } | null;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export default function GovernancePage() {
  const { publicKey, connected } = useWallet();
  const { tier, balance, holdingMultiplier, loading } = useBacklotTier();
  const [votes, setVotes] = useState<VoteHistoryRow[]>([]);
  const [receipts, setReceipts] = useState<VoteReceipt[]>([]);
  const [activeCount, setActiveCount] = useState(0);

  const votingPower = Math.floor(balance * holdingMultiplier);

  useEffect(() => {
    if (!publicKey) return;
    const wallet = publicKey.toBase58();

    supabase
      .from("votes")
      .select("id, created_at, weight, holding_multiplier, poll:polls(title, type), option:poll_options(label)")
      .eq("wallet_address", wallet)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setVotes((data || []) as unknown as VoteHistoryRow[]);
      });

    supabase
      .from("vote_receipts")
      .select("*")
      .eq("wallet_address", wallet)
      .order("minted_at", { ascending: false })
      .then(({ data }) => setReceipts(data || []));

    supabase
      .from("polls")
      .select("id")
      .eq("is_active", true)
      .then(({ data }) => setActiveCount(data?.length || 0));
  }, [publicKey]);

  // Count unique polls voted on
  const uniquePollsVoted = new Set(
    votes.map((v) => (v.poll as { title: string } | null)?.title).filter(Boolean)
  ).size;
  const participationRate = activeCount > 0 ? Math.round((uniquePollsVoted / activeCount) * 100) : 0;

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <motion.div {...fadeUp}>
        <h1 className="font-serif text-3xl text-backlot-text md:text-4xl">Governance</h1>
        <p className="mt-2 text-backlot-muted">
          Your voting power, participation history, and on-chain receipts.
        </p>
      </motion.div>

      {!connected ? (
        <motion.div {...fadeUp} className="mt-12 rounded-xl border border-white/5 bg-backlot-surface p-8 text-center">
          <p className="text-backlot-muted">Connect your wallet to view your governance dashboard.</p>
        </motion.div>
      ) : (
        <div className="mt-8 space-y-6">
          {/* Voting Power Card */}
          <motion.div {...fadeUp} className="rounded-xl border border-white/5 bg-backlot-surface p-6">
            <h2 className="text-xs uppercase tracking-wider text-backlot-lavender">Voting Power</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p className="text-xs text-backlot-muted">Balance</p>
                <p className="mt-1 text-2xl font-medium text-backlot-text">
                  {loading ? "..." : <AnimatedNumber value={balance} decimals={0} />}
                </p>
              </div>
              <div>
                <p className="text-xs text-backlot-muted">Tier</p>
                <div className="mt-1">
                  <TierBadge tier={tier} />
                </div>
              </div>
              <div>
                <p className="text-xs text-backlot-muted">Holding Multiplier</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-2xl font-medium text-backlot-text">{holdingMultiplier.toFixed(1)}x</span>
                  <DiamondHandsBadge multiplier={holdingMultiplier} compact />
                </div>
              </div>
              <div>
                <p className="text-xs text-backlot-muted">Voting Power</p>
                <p className="mt-1 text-2xl font-medium text-backlot-gold">
                  {loading ? "..." : <AnimatedNumber value={votingPower} decimals={0} />}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Active Polls Summary */}
          <motion.div {...fadeUp} className="rounded-xl border border-white/5 bg-backlot-surface p-6">
            <h2 className="text-xs uppercase tracking-wider text-backlot-lavender">Participation</h2>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-backlot-muted">Active Polls</p>
                <p className="mt-1 text-2xl font-medium text-backlot-text">
                  <AnimatedNumber value={activeCount} />
                </p>
              </div>
              <div>
                <p className="text-xs text-backlot-muted">You Voted</p>
                <p className="mt-1 text-2xl font-medium text-backlot-tropical">
                  <AnimatedNumber value={uniquePollsVoted} />
                </p>
              </div>
              <div>
                <p className="text-xs text-backlot-muted">Rate</p>
                <p className="mt-1 text-2xl font-medium text-backlot-text">
                  <AnimatedNumber value={participationRate} suffix="%" />
                </p>
              </div>
            </div>
          </motion.div>

          {/* Vote History Table */}
          <motion.div {...fadeUp} className="rounded-xl border border-white/5 bg-backlot-surface p-6">
            <h2 className="text-xs uppercase tracking-wider text-backlot-lavender">Vote History</h2>
            {votes.length === 0 ? (
              <p className="mt-4 text-sm text-backlot-muted">No votes yet. Head to the Vote page to participate.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-left text-xs text-backlot-muted">
                      <th className="pb-2 pr-4">Poll</th>
                      <th className="pb-2 pr-4">Choice</th>
                      <th className="pb-2 pr-4">Weight</th>
                      <th className="pb-2 pr-4">Multiplier</th>
                      <th className="pb-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {votes.map((v) => (
                      <tr key={v.id} className="border-b border-white/5 last:border-0">
                        <td className="py-2 pr-4 text-backlot-text">{v.poll?.title || "—"}</td>
                        <td className="py-2 pr-4 text-backlot-lavender">{v.option?.label || "—"}</td>
                        <td className="py-2 pr-4 text-backlot-text">{v.weight || "—"}</td>
                        <td className="py-2 pr-4 text-backlot-muted">{v.holding_multiplier ? `${v.holding_multiplier}x` : "—"}</td>
                        <td className="py-2 text-backlot-muted">{new Date(v.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* cNFT Receipt Gallery */}
          {receipts.length > 0 && (
            <motion.div {...fadeUp} className="rounded-xl border border-backlot-tropical/20 bg-backlot-tropical/5 p-6">
              <h2 className="text-sm font-medium text-backlot-tropical">
                Vote Receipts ({receipts.length})
              </h2>
              <p className="mt-1 text-xs text-backlot-muted">
                Each vote is recorded on-chain as a compressed NFT.
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
                    {r.mint_address && r.mint_address !== "pending_tree_setup" && (
                      <span className="ml-1 text-backlot-tropical" title={r.mint_address}>
                        &#10003; minted
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </main>
  );
}
