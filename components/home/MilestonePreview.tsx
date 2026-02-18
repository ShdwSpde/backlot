"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import MilestoneTracker from "@/components/milestones/MilestoneTracker";

export default function MilestonePreview() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl text-backlot-text md:text-3xl">The Complex</h2>
            <p className="mt-1 text-backlot-muted">Portland, Jamaica — Milestone Tracker</p>
          </div>
          <Link href="/vote" className="text-sm text-backlot-lavender hover:text-backlot-lavender/80">
            View all &rarr;
          </Link>
        </div>
        <div className="mt-8">
          <MilestoneTracker projectName="The Complex" />
        </div>
      </motion.div>
    </section>
  );
}
