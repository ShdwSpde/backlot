"use client";

import { motion } from "framer-motion";
import type { PollOption } from "@/lib/types";

const BAR_COLORS = [
  "bg-backlot-lavender",
  "bg-backlot-gold",
  "bg-backlot-tropical",
  "bg-backlot-lavender/60",
  "bg-backlot-gold/60",
  "bg-backlot-tropical/60",
];

export default function VoteChart({
  options,
  votedOptionId,
}: {
  options: PollOption[];
  votedOptionId: string | null;
}) {
  const totalWeighted = options.reduce(
    (sum, o) => sum + (o.weighted_count || o.vote_count),
    0
  );

  return (
    <div className="space-y-2">
      {options.map((option, i) => {
        const weighted = option.weighted_count || option.vote_count;
        const pct = totalWeighted > 0 ? (weighted / totalWeighted) * 100 : 0;
        const isVoted = votedOptionId === option.id;

        return (
          <div key={option.id} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className={`flex items-center gap-1.5 ${isVoted ? "text-backlot-gold" : "text-backlot-text"}`}>
                {isVoted && <span className="text-xs">&#10003;</span>}
                {option.label}
              </span>
              <span className="text-xs text-backlot-muted">
                {option.vote_count} vote{option.vote_count !== 1 ? "s" : ""} &middot; {pct.toFixed(0)}%
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-white/5">
              <motion.div
                className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]} ${isVoted ? "opacity-100" : "opacity-70"}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(pct, 1)}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.1 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
