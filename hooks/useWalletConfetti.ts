"use client";

import { useState, useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export function useWalletConfetti() {
  const { connected } = useWallet();
  const [showConfetti, setShowConfetti] = useState(false);
  const wasConnected = useRef(false);

  useEffect(() => {
    if (connected && !wasConnected.current) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
    wasConnected.current = connected;
  }, [connected]);

  return showConfetti;
}
