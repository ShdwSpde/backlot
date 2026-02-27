"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { Transaction, PublicKey } from "@solana/web3.js";
import { createBurnInstruction, getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { supabase } from "@/lib/supabase";
import { useBacklotTier } from "@/hooks/useBacklotTier";
import type { Poll, PollOption, Tier } from "@/lib/types";
import TierBadge from "@/components/TierBadge";
import DiamondHandsBadge from "@/components/DiamondHandsBadge";
import { Link2, Twitter } from "lucide-react";
import VoteChart from "@/components/vote/VoteChart";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.backlotsocial.xyz";

const BACKLOT_MINT = new PublicKey(
  (process.env.NEXT_PUBLIC_BACKLOT_TOKEN_MINT || "DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump").trim()
);
const VOTE_COST = 10;
const TOKEN_DECIMALS = 6;
const VOTE_COST_RAW = VOTE_COST * 10 ** TOKEN_DECIMALS;

const tierRank: Record<Tier, number> = { viewer: 0, supporter: 1, producer: 2, executive_producer: 3 };

export default function PollCard({ poll }: { poll: Poll & { options: PollOption[] } }) {
  const { publicKey, connected, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { tier, balance, holdingMultiplier } = useBacklotTier();
  const [options, setOptions] = useState(poll.options || []);
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);
  const blinkUrl = `${SITE_URL}/api/actions/vote?pollId=${poll.id}`;
  const totalVotes = options.reduce((sum, o) => sum + o.vote_count, 0);
  const totalWeighted = options.reduce((sum, o) => sum + (o.weighted_count || o.vote_count), 0);
  const hasSufficientBalance = balance >= VOTE_COST;
  const pollExpired = poll.ends_at ? new Date(poll.ends_at) < new Date() : false;
  const pollInactive = !poll.is_active || pollExpired;
  const canVote = connected && !pollInactive && tierRank[tier] >= tierRank[poll.tier_required as Tier] && hasSufficientBalance;

  useEffect(() => {
    if (!publicKey) return;
    supabase.from("votes").select("option_id").eq("poll_id", poll.id).eq("wallet_address", publicKey.toBase58()).maybeSingle().then(({ data }) => { if (data) setVotedOptionId(data.option_id); });
  }, [publicKey, poll.id]);

  useEffect(() => {
    const channel = supabase.channel(`poll-${poll.id}`).on("postgres_changes", { event: "UPDATE", schema: "public", table: "poll_options", filter: `poll_id=eq.${poll.id}` }, (payload) => { setOptions((prev) => prev.map((o) => (o.id === payload.new.id ? { ...o, vote_count: payload.new.vote_count, weighted_count: payload.new.weighted_count } : o))); }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [poll.id]);

  const handleVote = async (optionId: string) => {
    if (!canVote || votedOptionId || voting || !publicKey || !sendTransaction) return;
    setVoting(true);

    let signature: string;
    try {
      // Build burn TX: 10 $BACKLOT burned permanently
      const voterATA = getAssociatedTokenAddressSync(BACKLOT_MINT, publicKey, false, TOKEN_2022_PROGRAM_ID);

      const tx = new Transaction();
      tx.add(
        createBurnInstruction(voterATA, BACKLOT_MINT, publicKey, VOTE_COST_RAW, [], TOKEN_2022_PROGRAM_ID)
      );

      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      setConfirming(true);
      signature = await sendTransaction(tx, connection);

      // Poll for confirmation via HTTP (WebSocket not supported through RPC proxy)
      for (let i = 0; i < 30; i++) {
        const { value } = await connection.getSignatureStatuses([signature]);
        const status = value?.[0];
        if (status?.confirmationStatus === "confirmed" || status?.confirmationStatus === "finalized") break;
        if (status?.err) throw new Error(`Transaction failed: ${JSON.stringify(status.err)}`);
        await new Promise((r) => setTimeout(r, 1500));
      }
    } catch (err) {
      console.error("Vote TX failed:", err);
      setConfirming(false);
      setVoting(false);
      return;
    }

    // TX confirmed — verify and record vote server-side
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId: poll.id, optionId, txSignature: signature }),
      });
      if (res.ok) {
        setVotedOptionId(optionId);
      } else {
        const err = await res.json();
        console.error("Vote recording failed:", err.error);
      }
    } catch (err) {
      console.error("Vote recording error:", err);
    }
    setConfirming(false);
    setVoting(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-xl border border-white/5 bg-backlot-surface p-6">
      <div className="flex items-start justify-between">
        <div><span className="text-xs uppercase tracking-wider text-backlot-lavender">{poll.type}</span><h3 className="mt-1 font-serif text-xl text-backlot-text">{poll.title}</h3>{poll.description && <p className="mt-1 text-sm text-backlot-muted">{poll.description}</p>}</div>
        <TierBadge tier={poll.tier_required as Tier} />
      </div>
      <div className="mt-6 space-y-3">
        {votedOptionId ? (
          <VoteChart options={options} votedOptionId={votedOptionId} />
        ) : (
          options.map((option) => (
            <button key={option.id} onClick={() => handleVote(option.id)} disabled={!canVote || !!votedOptionId || voting || confirming} className="relative w-full overflow-hidden rounded-lg border border-white/10 bg-white/5 p-3 text-left transition hover:border-backlot-lavender/30">
              <div className="relative flex items-center justify-between">
                <span className="text-sm text-backlot-text">{option.label}</span>
              </div>
              {option.description && <p className="relative mt-1 text-xs text-backlot-muted">{option.description}</p>}
            </button>
          ))
        )}
      </div>
      {poll.is_blink && (
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => { navigator.clipboard.writeText(blinkUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-backlot-muted transition hover:border-backlot-lavender/30 hover:text-backlot-text"
          >
            <Link2 size={12} />
            {copied ? "Copied!" : "Copy Blink URL"}
          </button>
          <a
            href={`https://x.com/intent/tweet?text=${encodeURIComponent(`Vote on "${poll.title}" — powered by $BACKLOT\n\n${blinkUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-backlot-muted transition hover:border-backlot-lavender/30 hover:text-backlot-text"
          >
            <Twitter size={12} />
            Share on X
          </a>
        </div>
      )}
      <div className="mt-4 flex items-center justify-between text-xs text-backlot-muted">
        <span>{totalVotes} votes ({totalWeighted.toLocaleString()} weighted)</span>
        {pollInactive && <span className="text-red-400">{pollExpired ? "Poll ended" : "Poll closed"}</span>}
        {!pollInactive && confirming && <span className="text-backlot-lavender animate-pulse">Confirming TX...</span>}
        {!pollInactive && !confirming && votedOptionId && <span className="text-backlot-tropical">Vote recorded — cNFT receipt pending</span>}
        {!pollInactive && !confirming && !votedOptionId && connected && !hasSufficientBalance && <span className="text-red-400">Insufficient $BACKLOT (need {VOTE_COST})</span>}
        {!pollInactive && !confirming && !votedOptionId && connected && hasSufficientBalance && !voting && (
          <span className="flex items-center gap-2 text-backlot-muted" title="Tokens are permanently removed from supply — not sent to any wallet">
            <span>🔥 {VOTE_COST} $BACKLOT burned per vote</span>
            <DiamondHandsBadge multiplier={holdingMultiplier} />
          </span>
        )}
      </div>
    </motion.div>
  );
}
