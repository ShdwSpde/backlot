"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Episode } from "@/lib/types";
import EpisodeCard from "@/components/episodes/EpisodeCard";
import GatedContent from "@/components/GatedContent";

export default function EpisodesPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { supabase.from("episodes").select("*").order("created_at", { ascending: false }).then(({ data }) => { setEpisodes(data || []); setLoading(false); }); }, []);
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="font-serif text-3xl text-backlot-text md:text-4xl">Episodes</h1>
      <p className="mt-2 text-backlot-muted">The Backlot docu-series. New episodes as the experiment unfolds.</p>
      {loading ? (
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{[...Array(3)].map((_, i) => <div key={i} className="aspect-video animate-pulse rounded-xl bg-backlot-surface" />)}</div>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {episodes.map((episode, i) => (
            <div key={episode.id}>
              {episode.tier_required === "viewer" ? <EpisodeCard episode={episode} index={i} /> : <GatedContent requiredTier={episode.tier_required}><EpisodeCard episode={episode} index={i} /></GatedContent>}
            </div>
          ))}
        </div>
      )}
      {!loading && episodes.length === 0 && <div className="mt-12 text-center text-backlot-muted"><p>No episodes yet. The experiment is just beginning.</p></div>}
    </div>
  );
}
