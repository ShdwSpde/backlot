"use client";
import { motion } from "framer-motion";
import JupiterSwapButton from "@/components/swap/JupiterSwapButton";

export default function TokenCTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="overflow-hidden rounded-2xl border border-backlot-gold/20 bg-gradient-to-br from-backlot-surface to-backlot-bg p-8 text-center md:p-12">
        <h2 className="font-serif text-3xl text-backlot-text md:text-4xl">Join the <span className="text-backlot-gold">Experiment</span></h2>
        <p className="mx-auto mt-4 max-w-xl text-backlot-muted">Hold $BACKLOT to unlock episodes, vote on what happens next, access behind-the-scenes content, and be part of the community shaping which ambitious ideas get documented.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <JupiterSwapButton className="inline-flex items-center rounded-lg bg-backlot-gold px-8 py-3 font-medium text-backlot-bg transition hover:bg-backlot-gold/90">
            Swap for $BACKLOT
          </JupiterSwapButton>
          <a
            href="https://pump.fun/coin/DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg border border-backlot-gold/30 px-8 py-3 font-medium text-backlot-gold transition hover:bg-backlot-gold/10"
          >
            View on Pump.fun
          </a>
        </div>
        <p className="mt-6 text-xs text-backlot-muted/60">$BACKLOT is not equity and doesn&apos;t promise returns. It&apos;s your onchain receipt for showing up early.</p>
      </motion.div>
    </section>
  );
}
