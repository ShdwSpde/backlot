"use client";

import { motion } from "framer-motion";

const tierColors: Record<string, { bg: string; text: string; glow: string }> = {
  "1": { bg: "bg-white/5", text: "text-backlot-muted", glow: "" },
  "2": { bg: "bg-sky-500/10", text: "text-sky-400", glow: "" },
  "3": { bg: "bg-backlot-lavender/15", text: "text-backlot-lavender", glow: "" },
  "4": { bg: "bg-cyan-400/15", text: "text-cyan-300", glow: "shadow-[0_0_8px_rgba(103,232,249,0.3)]" },
};

function getHoldingTier(multiplier: number): { label: string; level: string } {
  if (multiplier >= 4) return { label: "Diamond Hands", level: "4" };
  if (multiplier >= 3) return { label: "Strong Holder", level: "3" };
  if (multiplier >= 2) return { label: "Steady Holder", level: "2" };
  return { label: "New Holder", level: "1" };
}

export default function DiamondHandsBadge({
  multiplier,
  compact = false,
}: {
  multiplier: number;
  compact?: boolean;
}) {
  if (multiplier <= 1) return null;

  const { label, level } = getHoldingTier(multiplier);
  const colors = tierColors[level];
  const isDiamond = level === "4";

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text} ${colors.glow}`}
      title={`${multiplier.toFixed(1)}x vote weight — holding ${Math.round((multiplier - 1) * 30)} days`}
    >
      {isDiamond ? (
        <>
          <span className="relative">
            💎
            {!compact && (
              <motion.span
                className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-cyan-400"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </span>
          {!compact && <span>Diamond Hands</span>}
        </>
      ) : (
        <>
          <span>{level === "3" ? "💪" : "🤝"}</span>
          {!compact && <span>{label}</span>}
        </>
      )}
      {compact && <span>{multiplier.toFixed(1)}x</span>}
    </motion.span>
  );
}
