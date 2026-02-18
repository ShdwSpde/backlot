"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, Coins, BarChart3 } from "lucide-react";

interface TokenStats {
  price: number;
  marketCap: number;
  holders: number;
  supply: number;
  lastUpdated: string | null;
}

function StatCard({
  label,
  value,
  icon: Icon,
  delay,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  delay: number;
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
      <p className="mt-2 font-serif text-2xl text-backlot-text">{value}</p>
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

  const formatPrice = (p: number) =>
    p < 0.01 ? `$${p.toFixed(6)}` : p < 1 ? `$${p.toFixed(4)}` : `$${p.toFixed(2)}`;

  const formatMcap = (m: number) =>
    m >= 1_000_000 ? `$${(m / 1_000_000).toFixed(1)}M` : m >= 1_000 ? `$${(m / 1_000).toFixed(1)}K` : `$${m.toFixed(0)}`;

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
        <StatCard label="Price" value={formatPrice(stats.price)} icon={TrendingUp} delay={0} />
        <StatCard label="Market Cap" value={formatMcap(stats.marketCap)} icon={BarChart3} delay={0.1} />
        <StatCard label="Holders" value={stats.holders > 0 ? stats.holders.toLocaleString() : "—"} icon={Users} delay={0.2} />
        <StatCard label="Supply" value={stats.supply > 0 ? `${(stats.supply / 1e6).toFixed(0)}M` : "—"} icon={Coins} delay={0.3} />
      </div>
    </section>
  );
}
