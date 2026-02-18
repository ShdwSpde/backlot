"use client";
import { motion } from "framer-motion";

export default function StreamEmbed() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="relative overflow-hidden rounded-xl border border-white/5">
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-red-600/90 px-3 py-1 text-xs font-bold text-white"><span className="h-2 w-2 animate-pulse rounded-full bg-white" />LIVE</div>
      <div className="aspect-video w-full bg-backlot-surface">
        <div className="flex h-full flex-col items-center justify-center gap-2">
          <p className="font-serif text-xl text-backlot-muted/40">24/7 Dev Stream</p>
          <p className="text-sm text-backlot-muted/30">Portland, Jamaica</p>
          <p className="mt-4 text-xs text-backlot-muted/20">Replace this div with your stream embed iframe</p>
        </div>
      </div>
    </motion.div>
  );
}
