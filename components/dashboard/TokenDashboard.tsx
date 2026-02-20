"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, Coins, BarChart3 } from "lucide-react";
import AnimatedNumber from "@/components/AnimatedNumber";

interface TokenStats {
  price: number;
  marketCap: number;
  holders: number;
  supply: number;
  lastUpdated: string | null;
}

function StatCard({
  label,
  icon: Icon,
  delay,
  children,
}: {
  label: string;
  icon: React.ElementType;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="rounded-xl border border-white/5 bg-backlot-surface p-4"
    >
      <div className="flex items-center gap-2 text-backlot-muted">
        <Icon size={14} />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-2 font-serif text-2xl text-backlot-text">{children}</div>
    </motion.div>
  );
}

export default function TokenDashboard() {
  const [stats, setStats] = useState<TokenStats | null>(null);

  useEffect(() => {
    const fetchStats = () =>
      fetch("/api/token-stats")
        .then((r) => r.json())
        .then(setStats)
        .catch(console.error);

    fetchStats();
    const interval = setInterval(fetchStats, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-backlot-surface" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-xl text-backlot-text">$BACKLOT Dashboard</h2>
        {stats.lastUpdated && (
          <span className="text-xs text-backlot-muted">
            Updated {new Date(stats.lastUpdated).toLocaleTimeString()}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Price" icon={TrendingUp} delay={0}>
          <AnimatedNumber
            value={stats.price}
            prefix="$"
            decimals={stats.price < 0.01 ? 6 : stats.price < 1 ? 4 : 2}
          />
        </StatCard>
        <StatCard label="Market Cap" icon={BarChart3} delay={0.1}>
          <AnimatedNumber
            value={stats.marketCap}
            formatter={(n) =>
              n >= 1_000_000
                ? `$${(n / 1_000_000).toFixed(1)}M`
                : n >= 1_000
                  ? `$${(n / 1_000).toFixed(1)}K`
                  : `$${n.toFixed(0)}`
            }
          />
        </StatCard>
        <StatCard label="Holders" icon={Users} delay={0.2}>
          {stats.holders > 0 ? (
            <AnimatedNumber value={stats.holders} />
          ) : "—"}
        </StatCard>
        <StatCard label="Supply" icon={Coins} delay={0.3}>
          {stats.supply > 0 ? (
            <AnimatedNumber
              value={stats.supply / 1e6}
              suffix="M"
              decimals={0}
            />
          ) : "—"}
        </StatCard>
      </div>
    </section>
  );
}
