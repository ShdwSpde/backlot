import type { Tier } from "@/lib/types";

const tierConfig: Record<Tier, { label: string; color: string }> = {
  viewer: { label: "Viewer", color: "bg-gray-600 text-gray-300" },
  supporter: { label: "Supporter", color: "bg-backlot-lavender/20 text-backlot-lavender" },
  producer: { label: "Producer", color: "bg-backlot-gold/20 text-backlot-gold" },
  executive_producer: { label: "Exec Producer", color: "bg-backlot-tropical/20 text-backlot-tropical" },
};

export default function TierBadge({ tier }: { tier: Tier }) {
  const config = tierConfig[tier];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
