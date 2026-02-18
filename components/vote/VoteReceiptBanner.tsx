"use client";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/lib/supabase";
import type { VoteReceipt } from "@/lib/types";

export default function VoteReceiptBanner() {
  const { publicKey, connected } = useWallet();
  const [receipts, setReceipts] = useState<VoteReceipt[]>([]);
  useEffect(() => { if (!publicKey) return; supabase.from("vote_receipts").select("*").eq("wallet_address", publicKey.toBase58()).order("minted_at", { ascending: false }).then(({ data }) => setReceipts(data || [])); }, [publicKey]);
  if (!connected || receipts.length === 0) return null;
  return (
    <div className="rounded-xl border border-backlot-tropical/20 bg-backlot-tropical/5 p-4">
      <h3 className="text-sm font-medium text-backlot-tropical">Your Vote Receipts ({receipts.length})</h3>
      <p className="mt-1 text-xs text-backlot-muted">Each vote is recorded on-chain as a compressed NFT — your proof of participation.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {receipts.map((r) => (<div key={r.id} className="rounded-lg border border-white/5 bg-backlot-surface px-3 py-1.5 text-xs"><span className="text-backlot-text">{r.poll_title}</span><span className="mx-1 text-backlot-muted">&middot;</span><span className="text-backlot-lavender">{r.option_label}</span>{r.mint_address && r.mint_address !== "pending_tree_setup" && (
  <span className="ml-1 text-backlot-tropical" title={r.mint_address}>✓ minted</span>
)}</div>))}
      </div>
    </div>
  );
}
