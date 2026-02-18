"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { Milestone } from "@/lib/types";
import { Check, Zap, Clock } from "lucide-react";
import FundMilestone from "./FundMilestone";

const statusIcon = {
  completed: <Check size={16} className="text-backlot-tropical" />,
  active: <Zap size={16} className="text-backlot-gold" />,
  upcoming: <Clock size={16} className="text-backlot-muted/40" />,
};

export default function MilestoneTracker({ projectName }: { projectName?: string }) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let query = supabase.from("milestones").select("*").order("sort_order", { ascending: true });
    if (projectName) query = query.eq("project_name", projectName);

    query.then(({ data }) => {
      setMilestones(data || []);
      setLoading(false);
    });
  }, [projectName]);

  // Realtime milestone updates
  useEffect(() => {
    const channel = supabase
      .channel("milestones")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "milestones" },
        (payload) => {
          setMilestones((prev) =>
            prev.map((m) => (m.id === payload.new.id ? (payload.new as Milestone) : m))
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading) {
    return <div className="space-y-4">{[...Array(3)].map((_, i) => (
      <div key={i} className="h-20 animate-pulse rounded-xl bg-backlot-surface" />
    ))}</div>;
  }

  return (
    <div className="space-y-1">
      {milestones.map((milestone, i) => {
        const progress = milestone.target_amount
          ? Math.min((milestone.current_amount / milestone.target_amount) * 100, 100)
          : 0;

        return (
          <motion.div
            key={milestone.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="relative"
          >
            {/* Connector line */}
            {i < milestones.length - 1 && (
              <div className="absolute left-[19px] top-[40px] h-[calc(100%)] w-[2px] bg-white/5" />
            )}

            <div className="flex gap-4 rounded-xl border border-white/5 bg-backlot-surface p-4">
              {/* Status dot */}
              <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                milestone.status === "completed"
                  ? "border-backlot-tropical/30 bg-backlot-tropical/10"
                  : milestone.status === "active"
                  ? "border-backlot-gold/30 bg-backlot-gold/10"
                  : "border-white/10 bg-white/5"
              }`}>
                {statusIcon[milestone.status]}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className={`font-medium ${
                    milestone.status === "upcoming" ? "text-backlot-muted/60" : "text-backlot-text"
                  }`}>
                    {milestone.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    {milestone.status === "active" && (
                      <FundMilestone milestoneId={milestone.id} milestoneTitle={milestone.title} />
                    )}
                    <span className={`text-xs capitalize ${
                      milestone.status === "completed" ? "text-backlot-tropical" :
                      milestone.status === "active" ? "text-backlot-gold" : "text-backlot-muted/40"
                    }`}>
                      {milestone.status}
                    </span>
                  </div>
                </div>

                {milestone.description && (
                  <p className="mt-1 text-sm text-backlot-muted">{milestone.description}</p>
                )}

                {/* Progress bar */}
                {milestone.status !== "upcoming" && milestone.target_amount && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-backlot-muted">
                      <span>{progress.toFixed(0)}%</span>
                      <span>{milestone.current_amount} / {milestone.target_amount}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        className={`h-full rounded-full ${
                          milestone.status === "completed" ? "bg-backlot-tropical" : "bg-backlot-gold"
                        }`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${progress}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.2 + i * 0.1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
