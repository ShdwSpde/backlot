"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Landmark, ExternalLink, Users, TrendingUp, Coins } from "lucide-react";
import AnimatedNumber from "@/components/AnimatedNumber";

interface HolderRow {
  rank: number;
  wallet: string;
  walletFull: string;
  amount: number;
  percentage: number;
}

interface TreasuryData {
  holders: HolderRow[];
  totalHolders: number;
  topHolderPercentage: number;
  top5Percentage: number;
  top10Percentage: number;
  totalSupply: number;
  lastUpdated: string | null;
}

const SOLSCAN_TOKEN_URL =
  "https://solscan.io/token/DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump";

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatAmount(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

// Distribution bar colors for top holders
const BAR_COLORS = [
  "bg-backlot-gold",       // #1 holder
  "bg-backlot-lavender",   // #2
  "bg-[#9B8BBF]",          // #3 (darker lavender)
  "bg-[#7E6DAA]",          // #4
  "bg-[#635896]",          // #5
];
const OTHERS_COLOR = "bg-backlot-muted";

const LEGEND_LABELS = [
  "Top Holder",
  "2nd Holder",
  "3rd Holder",
  "4th Holder",
  "5th Holder",
  "Others",
];
const LEGEND_COLORS = [
  "bg-backlot-gold",
  "bg-backlot-lavender",
  "bg-[#9B8BBF]",
  "bg-[#7E6DAA]",
  "bg-[#635896]",
  "bg-backlot-muted",
];

export default function TreasuryPage() {
  const [data, setData] = useState<TreasuryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/treasury")
      .then((res) => res.json())
      .then((json: TreasuryData) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Build distribution segments for the bar chart
  const segments: { label: string; percentage: number; color: string }[] = [];
  if (data && data.holders.length > 0) {
    const top5 = data.holders.slice(0, 5);
    let accounted = 0;
    top5.forEach((h, i) => {
      segments.push({
        label: LEGEND_LABELS[i],
        percentage: h.percentage,
        color: BAR_COLORS[i],
      });
      accounted += h.percentage;
    });
    const othersPercentage = Math.max(0, 100 - accounted);
    if (othersPercentage > 0) {
      segments.push({
        label: "Others",
        percentage: othersPercentage,
        color: OTHERS_COLOR,
      });
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Section 1: Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="flex items-center gap-3 font-serif text-3xl text-backlot-text md:text-4xl">
          <Landmark className="text-backlot-gold" />
          Treasury
        </h1>
        <p className="mt-3 text-lg text-backlot-muted">
          Every token, every holder, on-chain and verifiable. Radical
          transparency.
        </p>
      </motion.div>

      {loading ? (
        <div className="mt-10 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-backlot-surface" />
            ))}
          </div>
          <div className="h-40 animate-pulse rounded-2xl bg-backlot-surface" />
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-backlot-surface" />
            ))}
          </div>
        </div>
      ) : !data || data.holders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 rounded-2xl border border-white/5 bg-backlot-surface p-8 text-center"
        >
          <p className="text-backlot-muted">
            Unable to load treasury data. Please try again later.
          </p>
        </motion.div>
      ) : (
        <>
          {/* Section 2: Distribution Stats */}
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Users,
                label: "Total Holders",
                node: <AnimatedNumber value={data.totalHolders} />,
              },
              {
                icon: TrendingUp,
                label: "Top Holder %",
                node: <AnimatedNumber value={data.topHolderPercentage} suffix="%" decimals={1} />,
              },
              {
                icon: Coins,
                label: "Total Supply",
                node: <AnimatedNumber value={data.totalSupply} formatter={formatNumber} />,
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="rounded-2xl border border-white/5 bg-backlot-surface p-6"
              >
                <div className="flex items-center gap-2 text-backlot-muted">
                  <stat.icon size={16} />
                  <span className="text-sm">{stat.label}</span>
                </div>
                <p className="mt-2 font-serif text-2xl text-backlot-text">
                  {stat.node}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Section 3: Holder Distribution Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10 rounded-2xl border border-white/5 bg-backlot-surface p-6"
          >
            <h2 className="font-serif text-xl text-backlot-text">
              Holder Distribution
            </h2>
            <p className="mt-1 text-sm text-backlot-muted">
              Top 5 holders vs. the rest of the community
            </p>

            {/* Stacked horizontal bar */}
            <div className="mt-5 flex h-8 overflow-hidden rounded-full">
              {segments.map((seg) => (
                <div
                  key={seg.label}
                  className={`${seg.color} transition-all duration-700`}
                  style={{ width: `${Math.max(seg.percentage, 0.5)}%` }}
                  title={`${seg.label}: ${seg.percentage.toFixed(2)}%`}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {segments.map((seg, i) => (
                <div key={seg.label} className="flex items-center gap-2">
                  <div
                    className={`h-3 w-3 rounded-full ${LEGEND_COLORS[i]}`}
                  />
                  <span className="text-xs text-backlot-muted">
                    {seg.label}{" "}
                    <span className="text-backlot-text">
                      {seg.percentage.toFixed(2)}%
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Section 4: Top Holders Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 overflow-hidden rounded-2xl border border-white/5"
          >
            <h2 className="bg-backlot-surface px-6 py-4 font-serif text-xl text-backlot-text">
              Top Holders
            </h2>

            {/* Table header */}
            <div className="grid grid-cols-4 gap-2 border-b border-white/5 bg-backlot-surface px-6 py-3 text-xs font-medium uppercase tracking-wider text-backlot-muted">
              <span>Rank</span>
              <span>Wallet</span>
              <span className="text-right">Amount</span>
              <span className="text-right">% Supply</span>
            </div>

            {/* Table rows */}
            {data.holders.slice(0, 20).map((holder, i) => (
              <motion.div
                key={holder.walletFull}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.03 }}
                className={`grid grid-cols-4 gap-2 px-6 py-3 text-sm ${
                  i % 2 === 0 ? "bg-backlot-surface" : "bg-backlot-bg"
                } ${holder.rank === 1 ? "border-l-2 border-l-backlot-gold" : ""}`}
              >
                <span className="text-backlot-muted">#{holder.rank}</span>
                <a
                  href={`https://solscan.io/account/${holder.walletFull}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-backlot-lavender transition-colors hover:text-backlot-gold"
                >
                  {holder.wallet}
                </a>
                <span className="text-right text-backlot-text">
                  {formatAmount(holder.amount)}
                </span>
                <span className="text-right text-backlot-muted">
                  {holder.percentage.toFixed(2)}%
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Concentration Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6 grid gap-4 md:grid-cols-2"
          >
            <div className="rounded-2xl border border-white/5 bg-backlot-surface p-6">
              <p className="text-sm text-backlot-muted">
                Top 5 Holders Control
              </p>
              <p className="mt-1 font-serif text-2xl text-backlot-text">
                {data.top5Percentage}%
              </p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-backlot-surface p-6">
              <p className="text-sm text-backlot-muted">
                Top 10 Holders Control
              </p>
              <p className="mt-1 font-serif text-2xl text-backlot-text">
                {data.top10Percentage}%
              </p>
            </div>
          </motion.div>

          {/* Section 5: Transparency Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-10 rounded-2xl border border-white/5 bg-backlot-surface p-6"
          >
            <h3 className="font-serif text-lg text-backlot-text">
              Transparency Note
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-backlot-muted">
              All data is pulled directly from the Solana blockchain via Helius
              API. Nothing is hidden, nothing is fabricated. Verify any wallet on
              Solscan.
            </p>
            <a
              href={SOLSCAN_TOKEN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-backlot-lavender transition-colors hover:text-backlot-gold"
            >
              View $BACKLOT on Solscan
              <ExternalLink size={14} />
            </a>
            {data.lastUpdated && (
              <p className="mt-3 text-xs text-backlot-muted">
                Last updated:{" "}
                {new Date(data.lastUpdated).toLocaleString()}
              </p>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
