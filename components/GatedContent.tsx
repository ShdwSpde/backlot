"use client";

import { useBacklotTier } from "@/hooks/useBacklotTier";
import type { Tier } from "@/lib/types";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const tierRank: Record<Tier, number> = {
  viewer: 0,
  supporter: 1,
  producer: 2,
  executive_producer: 3,
};

export default function GatedContent({
  requiredTier,
  children,
}: {
  requiredTier: Tier;
  children: React.ReactNode;
}) {
  const { tier, connected } = useBacklotTier();

  if (tierRank[tier] >= tierRank[requiredTier]) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-backlot-surface/50 p-12 text-center">
      <div className="mb-4 text-4xl">&#x1F512;</div>
      <h3 className="font-serif text-xl text-backlot-text">
        {connected ? `${requiredTier.replace("_", " ")} access required` : "Connect your wallet"}
      </h3>
      <p className="mt-2 text-sm text-backlot-muted">
        {connected
          ? "Hold more $BACKLOT to unlock this content."
          : "Connect your wallet to check your $BACKLOT tier."}
      </p>
      {!connected && (
        <div className="mt-4">
          <WalletMultiButton className="!bg-backlot-lavender/20 !text-backlot-lavender !rounded-lg" />
        </div>
      )}
    </div>
  );
}
