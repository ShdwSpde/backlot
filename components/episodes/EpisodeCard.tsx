"use client";
import { motion } from "framer-motion";
import type { Episode } from "@/lib/types";
import TierBadge from "@/components/TierBadge";

export default function EpisodeCard({ episode, index }: { episode: Episode; index: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1, duration: 0.4 }} className="group overflow-hidden rounded-xl border border-white/5 bg-backlot-surface transition hover:border-backlot-lavender/20">
      <div className="aspect-video bg-backlot-bg/50">
        {episode.thumbnail_url ? (
          <img src={episode.thumbnail_url} alt={episode.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center"><span className="font-serif text-2xl text-backlot-muted/30">BACKLOT</span></div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-backlot-text group-hover:text-backlot-gold transition">{episode.title}</h3>
          <TierBadge tier={episode.tier_required} />
        </div>
        {episode.description && <p className="mt-2 text-sm text-backlot-muted line-clamp-2">{episode.description}</p>}
      </div>
    </motion.div>
  );
}
