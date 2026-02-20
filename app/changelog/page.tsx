"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Rocket,
  Sparkles,
  Wrench,
  Package,
  Shield,
  GitCommit,
  ExternalLink,
} from "lucide-react";

interface ShipEntry {
  hash: string;
  message: string;
  date: string;
  type: "feat" | "fix" | "chore" | "sec";
  tags: string[];
}

interface ShipLogData {
  entries: ShipEntry[];
  stats: {
    totalCommits: number;
    features: number;
    fixes: number;
    security: number;
    daysActive: number;
  };
}

const TYPE_CONFIG = {
  feat: { icon: Sparkles, color: "text-backlot-tropical", dot: "bg-backlot-tropical", label: "Feature" },
  fix: { icon: Wrench, color: "text-backlot-gold", dot: "bg-backlot-gold", label: "Fix" },
  chore: { icon: Package, color: "text-backlot-muted", dot: "bg-backlot-muted", label: "Chore" },
  sec: { icon: Shield, color: "text-red-400", dot: "bg-red-400", label: "Security" },
};

const TAG_COLORS: Record<string, string> = {
  solana: "bg-backlot-lavender/20 text-backlot-lavender",
  security: "bg-red-400/20 text-red-400",
  ui: "bg-backlot-tropical/20 text-backlot-tropical",
  infra: "bg-backlot-gold/20 text-backlot-gold",
  "pump.fun": "bg-pink-400/20 text-pink-400",
  supabase: "bg-emerald-400/20 text-emerald-400",
  "framer-motion": "bg-purple-400/20 text-purple-400",
  helius: "bg-orange-400/20 text-orange-400",
  jupiter: "bg-cyan-400/20 text-cyan-400",
  blinks: "bg-backlot-lavender/20 text-backlot-lavender",
  bubblegum: "bg-pink-300/20 text-pink-300",
  metaplex: "bg-fuchsia-400/20 text-fuchsia-400",
  dexscreener: "bg-lime-400/20 text-lime-400",
  realtime: "bg-emerald-400/20 text-emerald-400",
  transparency: "bg-backlot-gold/20 text-backlot-gold",
  middleware: "bg-amber-400/20 text-amber-400",
};

function getTagColor(tag: string): string {
  return TAG_COLORS[tag] || "bg-backlot-muted/20 text-backlot-muted";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function ChangelogPage() {
  const [data, setData] = useState<ShipLogData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/shiplog")
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  // Group entries by date
  const grouped: Record<string, ShipEntry[]> = {};
  if (data) {
    for (const entry of data.entries) {
      if (!grouped[entry.date]) grouped[entry.date] = [];
      grouped[entry.date].push(entry);
    }
  }
  const dateGroups = Object.entries(grouped);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="flex items-center gap-3 font-serif text-3xl text-backlot-text md:text-4xl">
          <Rocket className="text-backlot-gold" /> Ship Log
        </h1>
        <p className="mt-2 text-backlot-muted">
          Everything we&apos;ve built, in public. Every commit, every feature, every
          fix &mdash; timestamped and verifiable.
        </p>
      </motion.div>

      {loading ? (
        <div className="mt-16 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-backlot-gold border-t-transparent" />
        </div>
      ) : data ? (
        <>
          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Commits", value: data.stats.totalCommits, color: "text-backlot-text" },
              { label: "Features", value: data.stats.features, color: "text-backlot-tropical" },
              { label: "Security", value: data.stats.security, color: "text-red-400" },
              { label: "Days Active", value: data.stats.daysActive, color: "text-backlot-gold" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="rounded-2xl border border-white/5 bg-backlot-surface p-4 text-center"
              >
                <p className={`font-serif text-2xl ${stat.color}`}>{stat.value}</p>
                <p className="mt-1 text-xs text-backlot-muted">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Timeline */}
          <div className="relative mt-12">
            {/* Vertical line */}
            <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-white/5" />

            {dateGroups.map(([date, entries]) => (
              <div key={date} className="mb-10">
                {/* Date header */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 }}
                  className="relative mb-4 flex items-center gap-4"
                >
                  <div className="z-10 h-6 w-6 rounded-full border-2 border-backlot-lavender bg-backlot-bg" />
                  <h2 className="font-serif text-lg text-backlot-lavender">
                    {formatDate(date)}
                  </h2>
                </motion.div>

                {/* Entries */}
                <div className="ml-3 space-y-3 border-l border-white/5 pl-8">
                  {entries.map((entry, i) => {
                    const config = TYPE_CONFIG[entry.type];
                    const Icon = config.icon;
                    return (
                      <motion.div
                        key={entry.hash}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.05 + i * 0.03 }}
                        className="relative rounded-xl border border-white/5 bg-backlot-surface p-4"
                      >
                        {/* Timeline dot */}
                        <div
                          className={`absolute -left-[25px] top-5 h-2.5 w-2.5 rounded-full ${config.dot}`}
                        />
                        {/* Connector line */}
                        <div className="absolute -left-[17px] top-[23px] h-px w-[17px] bg-white/10" />

                        <div className="flex items-start gap-3">
                          <Icon size={16} className={`mt-0.5 shrink-0 ${config.color}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-backlot-text">{entry.message}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span className="flex items-center gap-1 font-mono text-xs text-backlot-muted">
                                <GitCommit size={10} />
                                {entry.hash}
                              </span>
                              {entry.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getTagColor(tag)}`}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 rounded-2xl border border-white/5 bg-backlot-surface p-6 text-center"
          >
            <p className="font-serif text-lg text-backlot-text">
              Follow the build in real-time
            </p>
            <p className="mt-1 text-sm text-backlot-muted">
              We ship daily. Watch us build Backlot from the ground up.
            </p>
            <div className="mt-4 flex justify-center gap-4">
              <a
                href="https://pump.fun/coin/DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-backlot-gold/20 px-4 py-2 text-sm text-backlot-gold transition-colors hover:bg-backlot-gold/30"
              >
                pump.fun <ExternalLink size={12} />
              </a>
              <a
                href="https://x.com/thebougiebrat"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-backlot-lavender/20 px-4 py-2 text-sm text-backlot-lavender transition-colors hover:bg-backlot-lavender/30"
              >
                Follow on X <ExternalLink size={12} />
              </a>
            </div>
          </motion.div>
        </>
      ) : null}
    </div>
  );
}
