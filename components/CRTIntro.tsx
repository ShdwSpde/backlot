"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function CRTIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"black" | "line" | "glow" | "logo" | "done">("black");

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("line"), 300),
      setTimeout(() => setPhase("glow"), 800),
      setTimeout(() => setPhase("logo"), 1400),
      setTimeout(() => {
        setPhase("done");
        onComplete();
      }, 2800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {phase === "black" && (
            <div className="absolute inset-0 opacity-20">
              <div className="h-full w-full animate-pulse bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900" />
            </div>
          )}

          {phase === "line" && (
            <motion.div
              className="absolute bg-white"
              initial={{ width: 0, height: "2px" }}
              animate={{ width: "100%", height: "2px" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          )}

          {phase === "glow" && (
            <motion.div
              className="absolute bg-[#0A0A0F]"
              initial={{ width: "100%", height: "2px" }}
              animate={{ width: "100%", height: "100%" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{
                boxShadow: "0 0 100px 50px rgba(184, 169, 212, 0.15)",
              }}
            />
          )}

          {phase === "logo" && (
            <motion.div
              className="relative z-10 flex flex-col items-center gap-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <Image
                src="/brand/logo.jpg"
                alt="BACKLOT"
                width={120}
                height={120}
                className="rounded-full"
              />
              <motion.p
                className="font-serif text-2xl tracking-widest text-[#C5A644]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                BACKLOT
              </motion.p>
              <motion.p
                className="text-sm text-[#8B8B9E]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                tuning in...
              </motion.p>
            </motion.div>
          )}

          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)",
            }}
          />

          <div
            className="pointer-events-none absolute inset-0"
            style={{
              boxShadow: "inset 0 0 150px 60px rgba(0,0,0,0.7)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
