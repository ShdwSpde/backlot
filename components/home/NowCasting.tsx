"use client";

import { motion } from "framer-motion";
import { Megaphone, ArrowRight } from "lucide-react";

export default function NowCasting() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="overflow-hidden rounded-2xl border border-backlot-gold/20 bg-gradient-to-br from-backlot-gold/5 via-backlot-surface to-backlot-lavender/5"
      >
        <div className="p-8 md:p-12">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-backlot-gold/10">
              <Megaphone size={18} className="text-backlot-gold" />
            </div>
            <span className="text-xs font-medium uppercase tracking-widest text-backlot-gold">
              Open Call
            </span>
          </div>

          <h2 className="mt-6 font-serif text-2xl text-backlot-text md:text-3xl">
            Now casting: Subjects #2 and #3 for the Backlot pilot
          </h2>

          <p className="mt-4 max-w-2xl text-backlot-muted">
            We&apos;re looking for founders across the Caribbean with bold, unfunded ideas.
            People who have the vision and drive but not yet the backing. If you&apos;re
            building something powerful and just need a platform, mentorship, and a bit of
            chaos and cameras to get started, we want to hear from you.
          </p>

          <p className="mt-4 max-w-2xl text-sm text-backlot-muted">
            Selected founders will be featured as on-screen &ldquo;subjects&rdquo; in our
            reality-style pilot, receive hands-on support from The Backlot network and get
            a shot at unlocking real resources to push your idea forward from the Backlot
            community.
          </p>

          <a
            href="https://t.me/+Kxu0L6zKjY5kZjcx"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-backlot-gold px-6 py-3 font-medium text-backlot-bg transition hover:bg-backlot-gold/90"
          >
            Submit Your Idea <ArrowRight size={16} />
          </a>
        </div>
      </motion.div>
    </section>
  );
}
