"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const tiers = [
  { name: "Viewer", requirement: "No tokens needed", access: "Landing page, about, episode previews, watch livestream", color: "bg-gray-600" },
  { name: "Supporter", requirement: "Hold any $BACKLOT", access: "Full episodes, backstage content, basic polls, live chat", color: "bg-backlot-lavender" },
  { name: "Producer", requirement: "Hold 10,000+ $BACKLOT", access: "All polls, project nomination, highlighted in chat", color: "bg-backlot-gold" },
  { name: "Executive Producer", requirement: "Hold 100,000+ $BACKLOT", access: "Inner circle updates, direct feedback, episode credits", color: "bg-backlot-tropical" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif text-3xl text-backlot-text md:text-5xl">The <span className="text-backlot-gold">Experiment</span></h1>
        <p className="mt-4 text-lg text-backlot-muted">Backlot is an onchain reality docu-series for social good — using a meme token + community support to help &ldquo;too big&rdquo; ideas hit real milestones in public.</p>
      </motion.div>
      <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16">
        <h2 className="font-serif text-2xl text-backlot-text">How It Works</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[{ step: "1", title: "Get $BACKLOT", desc: "Buy the token on Pump.fun. This is your ticket into the experiment." }, { step: "2", title: "Watch & Participate", desc: "Stream the 24/7 dev cam, vote on what happens next, access behind-the-scenes content." }, { step: "3", title: "Shape the Story", desc: "Vote on which ambitious projects to follow next. Your voice decides what gets documented." }].map((item, i) => (
            <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rounded-xl border border-white/5 bg-backlot-surface p-6">
              <span className="font-serif text-3xl text-backlot-gold">{item.step}</span><h3 className="mt-3 font-medium text-backlot-text">{item.title}</h3><p className="mt-2 text-sm text-backlot-muted">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
      <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16">
        <h2 className="font-serif text-2xl text-backlot-text">Holder Tiers</h2>
        <p className="mt-2 text-backlot-muted">What you unlock depends on how much $BACKLOT you hold.</p>
        <div className="mt-6 space-y-3">
          {tiers.map((tier, i) => (
            <motion.div key={tier.name} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex items-start gap-4 rounded-xl border border-white/5 bg-backlot-surface p-4">
              <span className={`mt-1 h-3 w-3 rounded-full ${tier.color}`} /><div><h3 className="font-medium text-backlot-text">{tier.name}</h3><p className="text-sm text-backlot-gold">{tier.requirement}</p><p className="mt-1 text-sm text-backlot-muted">{tier.access}</p></div>
            </motion.div>
          ))}
        </div>
      </motion.section>
      <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16">
        <h2 className="font-serif text-2xl text-backlot-text">First Project: The Complex</h2>
        <p className="mt-2 text-backlot-muted">Portland, Jamaica</p>
        <div className="mt-6 overflow-hidden rounded-xl border border-white/5"><Image src="/brand/banner.jpeg" alt="The Complex - Jamaica" width={1500} height={500} className="w-full" /></div>
        <p className="mt-4 text-backlot-muted">The Complex is where it all starts. An ambitious creative project in Portland, Jamaica — documented from the ground up as the Backlot community watches, votes, and participates in real time.</p>
      </motion.section>
      <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16 rounded-xl border border-white/5 bg-backlot-surface p-6">
        <h2 className="font-serif text-lg text-backlot-text">Important Disclaimer</h2>
        <p className="mt-2 text-sm text-backlot-muted">$BACKLOT is not equity, doesn&apos;t promise returns, and doesn&apos;t give ownership of The Complex or any project we document. It&apos;s a way to participate in and be recognized inside the social experiment and the docu-series we&apos;re building around it.</p>
      </motion.section>
    </div>
  );
}
