"use client";

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, CheckCircle, Loader2 } from "lucide-react";
const AMOUNTS = [0.01, 0.05, 0.1, 0.5];

export default function FundMilestone({
  milestoneId,
  milestoneTitle,
}: {
  milestoneId: string;
  milestoneTitle: string;
}) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [open, setOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(AMOUNTS[0]);
  const [status, setStatus] = useState<
    "idle" | "signing" | "confirming" | "done" | "error"
  >("idle");

  const handleFund = async () => {
    if (!publicKey) return;

    setStatus("signing");
    try {
      const res = await fetch("/api/fund-milestone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestoneId,
          amount: selectedAmount,
          walletAddress: publicKey.toBase58(),
        }),
      });

      const { transaction: txBase64 } = await res.json();
      const tx = Transaction.from(Buffer.from(txBase64, "base64"));

      setStatus("confirming");
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, "confirmed");

      // Verify and record server-side
      const confirmRes = await fetch("/api/fund-milestone/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestoneId,
          txSignature: signature,
          amount: selectedAmount,
          walletAddress: publicKey.toBase58(),
        }),
      });

      if (!confirmRes.ok) {
        const err = await confirmRes.json();
        console.error("Fund confirmation failed:", err.error);
      }

      setStatus("done");
      setTimeout(() => {
        setStatus("idle");
        setOpen(false);
      }, 2000);
    } catch (error) {
      console.error("Fund error:", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-lg bg-backlot-tropical/10 px-3 py-1.5 text-xs text-backlot-tropical transition hover:bg-backlot-tropical/20"
      >
        <Heart size={12} /> Fund
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <div className="rounded-lg border border-white/5 bg-backlot-bg p-4">
              <p className="text-xs text-backlot-muted mb-3">
                Contribute SOL to &quot;{milestoneTitle}&quot;
              </p>

              <div className="flex gap-2 mb-4">
                {AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setSelectedAmount(amt)}
                    className={`rounded-lg px-3 py-1.5 text-xs transition ${
                      selectedAmount === amt
                        ? "bg-backlot-tropical text-backlot-bg"
                        : "bg-white/5 text-backlot-muted hover:bg-white/10"
                    }`}
                  >
                    {amt} SOL
                  </button>
                ))}
              </div>

              <button
                onClick={handleFund}
                disabled={!publicKey || status !== "idle"}
                className="w-full rounded-lg bg-backlot-tropical px-4 py-2 text-sm font-medium text-backlot-bg transition hover:bg-backlot-tropical/90 disabled:opacity-50"
              >
                {status === "idle" && `Send ${selectedAmount} SOL`}
                {status === "signing" && (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Sign in wallet...
                  </span>
                )}
                {status === "confirming" && (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Confirming...
                  </span>
                )}
                {status === "done" && (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle size={14} /> Funded!
                  </span>
                )}
                {status === "error" && "Failed — try again"}
              </button>

              {!publicKey && (
                <p className="mt-2 text-center text-xs text-backlot-muted">
                  Connect wallet to contribute
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
