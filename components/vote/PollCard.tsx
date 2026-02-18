"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/lib/supabase";
import { useBacklotTier } from "@/hooks/useBacklotTier";
import type { Poll, PollOption, Tier } from "@/lib/types";
import TierBadge from "@/components/TierBadge";
import { Check } from "lucide-react";

const tierRank: Record<Tier, number> = { viewer: 0, supporter: 1, producer: 2, executive_producer: 3 };

export default function PollCard({ poll }: { poll: Poll & { options: PollOption[] } }) {
  const { publicKey, connected } = useWallet();
  const { tier, balance } = useBacklotTier();
  const [options, setOptions] = useState(poll.options || []);
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const totalVotes = options.reduce((sum, o) => sum + o.vote_count, 0);
  const totalWeighted = options.reduce((sum, o) => sum + ((o as PollOption & { weighted_count?: number }).weighted_count || o.vote_count), 0);
  const canVote = connected && tierRank[tier] >= tierRank[poll.tier_required as Tier];

  useEffect(() => {
    if (!publicKey) return;
    supabase.from("votes").select("option_id").eq("poll_id", poll.id).eq("wallet_address", publicKey.toBase58()).maybeSingle().then(({ data }) => { if (data) setVotedOptionId(data.option_id); });
  }, [publicKey, poll.id]);

  useEffect(() => {
    const channel = supabase.channel(`poll-${poll.id}`).on("postgres_changes", { event: "UPDATE", schema: "public", table: "poll_options", filter: `poll_id=eq.${poll.id}` }, (payload) => { setOptions((prev) => prev.map((o) => (o.id === payload.new.id ? { ...o, vote_count: payload.new.vote_count, weighted_count: payload.new.weighted_count } : o))); }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [poll.id]);

  const handleVote = async (optionId: string) => {
    if (!canVote || votedOptionId || voting || !publicKey) return;
    setVoting(true);
    const walletAddr = publicKey.toBase58();
    const option = options.find((o) => o.id === optionId);
    const { data: vote, error } = await supabase.from("votes").insert({ poll_id: poll.id, option_id: optionId, wallet_address: walletAddr, tier_at_vote: tier, weight: Math.max(balance, 1) }).select().single();
    if (!error && vote) {
      const currentOption = options.find((o) => o.id === optionId);
      await supabase.from("poll_options").update({ vote_count: (currentOption?.vote_count || 0) + 1, weighted_count: ((currentOption as PollOption & { weighted_count?: number })?.weighted_count || 0) + Math.max(balance, 1) }).eq("id", optionId);
      await supabase.from("vote_receipts").insert({ vote_id: vote.id, wallet_address: walletAddr, poll_title: poll.title, option_label: option?.label || "" });
      setVotedOptionId(optionId);

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
    }
    setVoting(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-xl border border-white/5 bg-backlot-surface p-6">
      <div className="flex items-start justify-between">
        <div><span className="text-xs uppercase tracking-wider text-backlot-lavender">{poll.type}</span><h3 className="mt-1 font-serif text-xl text-backlot-text">{poll.title}</h3>{poll.description && <p className="mt-1 text-sm text-backlot-muted">{poll.description}</p>}</div>
        <TierBadge tier={poll.tier_required as Tier} />
      </div>
      <div className="mt-6 space-y-3">
        {options.map((option) => {
          const pct = totalWeighted > 0 ? (((option as PollOption & { weighted_count?: number }).weighted_count || option.vote_count) / totalWeighted) * 100 : 0;
          const isVoted = votedOptionId === option.id;
          return (
            <button key={option.id} onClick={() => handleVote(option.id)} disabled={!canVote || !!votedOptionId || voting} className={`relative w-full overflow-hidden rounded-lg border p-3 text-left transition ${isVoted ? "border-backlot-gold/40 bg-backlot-gold/5" : votedOptionId ? "border-white/5 bg-white/5" : "border-white/10 bg-white/5 hover:border-backlot-lavender/30"}`}>
              {votedOptionId && <motion.div className="absolute inset-y-0 left-0 bg-backlot-lavender/10" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: "easeOut" }} />}
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2">{isVoted && <Check size={14} className="text-backlot-gold" />}<span className="text-sm text-backlot-text">{option.label}</span></div>
                {votedOptionId && <span className="text-xs text-backlot-muted">{option.vote_count} ({pct.toFixed(0)}%)</span>}
              </div>
              {option.description && <p className="relative mt-1 text-xs text-backlot-muted">{option.description}</p>}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-backlot-muted"><span>{totalVotes} votes ({totalWeighted.toLocaleString()} weighted)</span>{votedOptionId && <span className="text-backlot-tropical">Vote recorded — cNFT receipt pending</span>}</div>
    </motion.div>
  );
}
