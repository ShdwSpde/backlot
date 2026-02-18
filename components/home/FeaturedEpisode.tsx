"use client";
import { motion } from "framer-motion";

export default function FeaturedEpisode() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <h2 className="font-serif text-2xl text-backlot-text md:text-3xl">Now Showing</h2>
        <p className="mt-2 text-backlot-muted">Episode 0: Introducing BACKLOT</p>
        <div className="mt-6 overflow-hidden rounded-xl border border-white/5 bg-backlot-surface">
          <div className="aspect-video w-full">
            <div className="flex h-full items-center justify-center bg-backlot-surface">
              <div className="text-center">
                <p className="text-backlot-muted">Video embed</p>
                <p className="mt-1 text-xs text-backlot-muted/60">Episode 0: 2m 51s intro video from @Backlot876</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <p className="text-sm text-backlot-muted">A social experiment testing how far community can take creative ideas IRL. Meet the project, the token, and the madwoman dev behind it all.</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
