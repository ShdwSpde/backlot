"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Poll, PollOption } from "@/lib/types";
import PollCard from "@/components/vote/PollCard";
import VoteReceiptBanner from "@/components/vote/VoteReceiptBanner";
import GatedContent from "@/components/GatedContent";

type PollWithOptions = Poll & { options: PollOption[] };

export default function VotePage() {
  const [polls, setPolls] = useState<PollWithOptions[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { supabase.from("polls").select("*, options:poll_options(*)").eq("is_active", true).order("created_at", { ascending: false }).then(({ data }) => { setPolls((data as PollWithOptions[]) || []); setLoading(false); }); }, []);
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-3xl text-backlot-text md:text-4xl">Vote</h1>
      <p className="mt-2 text-backlot-muted">Shape the experiment. Your votes decide what happens next.</p>
      <p className="mt-1 text-xs text-backlot-muted/60">Each vote costs 10 $BACKLOT. Tokens are permanently burned (removed from total supply) — they are not sent to any wallet or treasury. Every vote makes the remaining supply scarcer.</p>
      <div className="mt-8"><VoteReceiptBanner /></div>
      <GatedContent requiredTier="supporter">
        <div className="mt-8 space-y-6">
          {loading ? [...Array(2)].map((_, i) => <div key={i} className="h-64 animate-pulse rounded-xl bg-backlot-surface" />) : polls.map((poll) => <PollCard key={poll.id} poll={poll} />)}
          {!loading && polls.length === 0 && <p className="text-center text-backlot-muted">No active polls right now.</p>}
        </div>
      </GatedContent>
    </div>
  );
}
