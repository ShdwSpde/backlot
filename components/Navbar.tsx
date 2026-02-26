"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useBacklotTier } from "@/hooks/useBacklotTier";
import TierBadge from "./TierBadge";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/live", label: "Live", badge: true },
  { href: "/episodes", label: "Episodes" },
  { href: "/vote", label: "Vote" },
  { href: "/treasury", label: "Treasury" },
  { href: "/leaderboard", label: "Board" },
  { href: "/changelog", label: "Ship Log" },
  { href: "/pitch", label: "Pitch" },
  { href: "/tech-chat", label: "Chat" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { tier, connected } = useBacklotTier();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <nav className="sticky top-0 z-40 border-b border-white/5 bg-backlot-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/brand/logo.jpg" alt="BACKLOT" width={36} height={36} className="rounded-full" />
          <span className="font-serif text-lg tracking-wider text-backlot-gold">BACKLOT</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative rounded-lg px-3 py-2 text-sm transition-colors ${
                pathname === link.href
                  ? "text-backlot-gold"
                  : "text-backlot-muted hover:text-backlot-text"
              }`}
            >
              {link.label}
              {link.badge && (
                <span className="ml-1 inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
              )}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {mounted && connected && <TierBadge tier={tier} />}
          {mounted && <WalletMultiButton className="!bg-backlot-lavender/20 !text-backlot-lavender hover:!bg-backlot-lavender/30 !rounded-lg !h-9 !text-sm" />}
        </div>

        <button className="md:hidden text-backlot-muted" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/5 bg-backlot-bg px-4 pb-4 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block py-2 text-sm ${
                pathname === link.href ? "text-backlot-gold" : "text-backlot-muted"
              }`}
            >
              {link.label}
              {link.badge && (
                <span className="ml-1 inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
              )}
            </Link>
          ))}
          <div className="mt-3 flex items-center gap-2">
            {connected && <TierBadge tier={tier} />}
            <WalletMultiButton className="!bg-backlot-lavender/20 !text-backlot-lavender !rounded-lg !h-9 !text-sm" />
          </div>
        </div>
      )}
    </nav>
  );
}
