"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Prices {
  backlot: { price: number; change: number };
  sol: { price: number; change: number };
  eth: { price: number; change: number };
}

function PriceItem({ label, price, change, format }: { label: string; price: number; change: number; format: (n: number) => string }) {
  const isUp = change >= 0;
  const Arrow = isUp ? TrendingUp : TrendingDown;
  const color = isUp ? "text-backlot-tropical" : "text-red-400";
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className="text-backlot-muted">{label}</span>
      <span className="font-medium text-backlot-text">{format(price)}</span>
      <Arrow size={10} className={color} />
      <span className={color}>{Math.abs(change).toFixed(1)}%</span>
    </span>
  );
}

export default function PriceTicker() {
  const [prices, setPrices] = useState<Prices | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [backlotRes, cgRes] = await Promise.all([
          fetch("/api/token-stats"),
          fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana,ethereum&vs_currencies=usd&include_24hr_change=true"),
        ]);
        const backlotData = await backlotRes.json();
        const cgData = await cgRes.json();
        setPrices({
          backlot: { price: backlotData.price || 0, change: backlotData.priceChange24h || 0 },
          sol: { price: cgData.solana?.usd || 0, change: cgData.solana?.usd_24h_change || 0 },
          eth: { price: cgData.ethereum?.usd || 0, change: cgData.ethereum?.usd_24h_change || 0 },
        });
      } catch { /* silent */ }
    };
    fetchAll();
    const interval = setInterval(fetchAll, 30_000);
    return () => clearInterval(interval);
  }, []);

  const fmtBacklot = (n: number) => `$${n < 0.01 ? n.toFixed(6) : n.toFixed(4)}`;
  const fmtUsd = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const sep = <span className="text-white/10 mx-4">|</span>;
  const castingMsg = (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className="h-1.5 w-1.5 rounded-full bg-backlot-tropical animate-pulse" />
      <span className="text-backlot-gold font-medium">Now Casting</span>
      <span className="text-backlot-muted">&mdash; submissions open for Caribbean founders</span>
    </span>
  );

  const tickerContent = prices ? (
    <>
      <PriceItem label="$BACKLOT" price={prices.backlot.price} change={prices.backlot.change} format={fmtBacklot} />
      {sep}
      <PriceItem label="SOL" price={prices.sol.price} change={prices.sol.change} format={fmtUsd} />
      {sep}
      <PriceItem label="ETH" price={prices.eth.price} change={prices.eth.change} format={fmtUsd} />
      {sep}
      {castingMsg}
    </>
  ) : (
    castingMsg
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/5 bg-backlot-bg/90 backdrop-blur-sm overflow-hidden">
      <div className="ticker-scroll flex items-center gap-0 py-3 text-sm">
        <div className="flex shrink-0 items-center gap-0 animate-marquee">{tickerContent}</div>
        <div className="flex shrink-0 items-center gap-0 animate-marquee" aria-hidden="true">{sep}{tickerContent}</div>
      </div>
    </div>
  );
}
