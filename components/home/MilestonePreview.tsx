"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Milestone } from "@/lib/types";

export default function MilestonePreview() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  useEffect(() => {
    supabase.from("milestones").select("*").eq("project_name", "The Complex").order("sort_order", { ascending: true }).limit(5).then(({ data }) => setMilestones(data || []));
  }, []);
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl text-backlot-text md:text-3xl">The Complex</h2>
            <p className="mt-1 text-backlot-muted">Portland, Jamaica — Milestone Tracker</p>
          </div>
          <Link href="/vote" className="text-sm text-backlot-lavender hover:text-backlot-lavender/80">View all &rarr;</Link>
        </div>
        <div className="mt-8 space-y-4">
          {milestones.map((milestone, i) => {
            const progress = milestone.target_amount ? (milestone.current_amount / milestone.target_amount) * 100 : 0;
            return (
              <motion.div key={milestone.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }} className="rounded-xl border border-white/5 bg-backlot-surface p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`h-3 w-3 rounded-full ${milestone.status === "completed" ? "bg-backlot-tropical" : milestone.status === "active" ? "bg-backlot-gold animate-pulse" : "bg-backlot-muted/30"}`} />
                    <span className="font-medium text-backlot-text">{milestone.title}</span>
                  </div>
                  <span className="text-xs text-backlot-muted capitalize">{milestone.status}</span>
                </div>
                {milestone.status !== "upcoming" && (
                  <div className="mt-3">
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                      <motion.div className={`h-full rounded-full ${milestone.status === "completed" ? "bg-backlot-tropical" : "bg-backlot-gold"}`} initial={{ width: 0 }} whileInView={{ width: `${Math.min(progress, 100)}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2 + i * 0.1, ease: "easeOut" }} />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
