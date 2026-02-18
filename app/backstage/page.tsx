"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { BackstagePost, Tier } from "@/lib/types";
import GatedContent from "@/components/GatedContent";
import TierBadge from "@/components/TierBadge";

export default function BackstagePage() {
  const [posts, setPosts] = useState<BackstagePost[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { supabase.from("backstage_posts").select("*").order("created_at", { ascending: false }).then(({ data }) => { setPosts(data || []); setLoading(false); }); }, []);
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-serif text-3xl text-backlot-text md:text-4xl">Backstage</h1>
      <p className="mt-2 text-backlot-muted">Behind-the-scenes content. Raw footage, dev updates, and the chaos that doesn&apos;t make the final cut.</p>
      <GatedContent requiredTier="supporter">
        <div className="mt-12 space-y-6">
          {loading ? [...Array(3)].map((_, i) => <div key={i} className="h-40 animate-pulse rounded-xl bg-backlot-surface" />) : posts.length > 0 ? posts.map((post, i) => (
            <motion.article key={post.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rounded-xl border border-white/5 bg-backlot-surface p-6">
              <div className="flex items-center justify-between"><h2 className="font-serif text-lg text-backlot-text">{post.title}</h2><TierBadge tier={post.tier_required as Tier} /></div>
              {post.content && <p className="mt-3 text-sm text-backlot-muted whitespace-pre-wrap">{post.content}</p>}
              {post.media_url && <div className="mt-4 overflow-hidden rounded-lg"><img src={post.media_url} alt={post.title} className="w-full" /></div>}
              <p className="mt-4 text-xs text-backlot-muted/60">{new Date(post.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
            </motion.article>
          )) : (
            <div className="rounded-xl border border-white/5 bg-backlot-surface p-12 text-center"><p className="font-serif text-xl text-backlot-muted/40">Coming soon</p><p className="mt-2 text-sm text-backlot-muted">Backstage content drops as the experiment unfolds.</p></div>
          )}
        </div>
      </GatedContent>
    </div>
  );
}
