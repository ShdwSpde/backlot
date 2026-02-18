"use client";

import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getBacklotBalance } from "@/lib/wallet";
import type { Tier } from "@/lib/types";

const SUPPORTER_THRESHOLD = Number(process.env.NEXT_PUBLIC_SUPPORTER_THRESHOLD || 1);
const PRODUCER_THRESHOLD = Number(process.env.NEXT_PUBLIC_PRODUCER_THRESHOLD || 10000);
const EXEC_PRODUCER_THRESHOLD = Number(process.env.NEXT_PUBLIC_EXEC_PRODUCER_THRESHOLD || 100000);

function balanceToTier(balance: number): Tier {
  if (balance >= EXEC_PRODUCER_THRESHOLD) return "executive_producer";
  if (balance >= PRODUCER_THRESHOLD) return "producer";
  if (balance >= SUPPORTER_THRESHOLD) return "supporter";
  return "viewer";
}

export function useBacklotTier() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [tier, setTier] = useState<Tier>("viewer");
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!connected || !publicKey) {
      setTier("viewer");
      setBalance(0);
      return;
    }

    setLoading(true);
    getBacklotBalance(connection, publicKey)
      .then((bal) => {
        setBalance(bal);
        setTier(balanceToTier(bal));
      })
      .finally(() => setLoading(false));
  }, [connection, publicKey, connected]);

  return { tier, balance, loading, connected };
}
