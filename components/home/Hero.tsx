"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image src="/brand/banner.jpeg" alt="Backlot" fill className="object-cover opacity-30" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-backlot-bg/60 via-backlot-bg/80 to-backlot-bg" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-24 md:pt-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-backlot-lavender">The Social Experiment</p>
          <h1 className="font-serif text-4xl leading-tight text-backlot-text md:text-6xl">Reality TV. <span className="text-backlot-gold">On Chain.</span> For Good.</h1>
          <p className="mt-6 text-lg text-backlot-muted md:text-xl">An onchain reality docu-series using a meme token + community to fund and document ambitious creative projects from the Caribbean and beyond — in public.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="https://pump.fun/coin/DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump" target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-lg bg-backlot-gold px-6 py-3 font-medium text-backlot-bg transition hover:bg-backlot-gold/90">Get $BACKLOT</a>
            <a href="/live" className="inline-flex items-center rounded-lg border border-backlot-lavender/30 px-6 py-3 font-medium text-backlot-lavender transition hover:bg-backlot-lavender/10"><span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-red-500" />Watch Live</a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
