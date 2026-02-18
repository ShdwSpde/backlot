"use client";
import { motion } from "framer-motion";

const flows = [
  {
    title: "Voting Flow",
    color: "#B8A9D4",
    steps: [
      { label: "Connect Wallet", icon: "wallet" },
      { label: "Check $BACKLOT Balance", icon: "token" },
      { label: "Cast Weighted Vote", icon: "vote" },
      { label: "Write to Supabase", icon: "db" },
      { label: "Mint cNFT Receipt", icon: "nft" },
      { label: "Broadcast via Realtime", icon: "live" },
    ],
  },
  {
    title: "Funding Flow",
    color: "#F472B6",
    steps: [
      { label: "Select Milestone", icon: "target" },
      { label: "Choose SOL Amount", icon: "coin" },
      { label: "Build Transaction", icon: "tx" },
      { label: "Sign with Wallet", icon: "sign" },
      { label: "Confirm On-Chain", icon: "chain" },
      { label: "Update Progress", icon: "progress" },
    ],
  },
  {
    title: "Blinks Flow",
    color: "#60A5FA",
    steps: [
      { label: "Share Blink URL", icon: "share" },
      { label: "Twitter Renders Card", icon: "card" },
      { label: "User Clicks Vote", icon: "click" },
      { label: "Memo TX Created", icon: "memo" },
      { label: "Vote Recorded", icon: "check" },
      { label: "Receipt Minted", icon: "nft" },
    ],
  },
];

const iconPaths: Record<string, string> = {
  wallet: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  token: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1",
  vote: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  db: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4",
  nft: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
  live: "M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728M9.172 15.172a5 5 0 010-7.072m5.656 0a5 5 0 010 7.072M13 12a1 1 0 11-2 0 1 1 0 012 0z",
  target: "M13 10V3L4 14h7v7l9-11h-7z",
  coin: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1",
  tx: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
  sign: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z",
  chain: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
  progress: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  share: "M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z",
  card: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  click: "M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122",
  memo: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  check: "M5 13l4 4L19 7",
};

export default function DataFlowDiagram() {
  return (
    <div className="space-y-6">
      {flows.map((flow, fi) => (
        <motion.div
          key={flow.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: fi * 0.1 }}
          className="rounded-xl border border-white/5 bg-backlot-surface p-5"
        >
          <h3 className="text-sm font-medium" style={{ color: flow.color }}>{flow.title}</h3>
          <div className="mt-4 flex flex-wrap items-center gap-1">
            {flow.steps.map((step, si) => (
              <motion.div
                key={step.label}
                className="flex items-center gap-1"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: fi * 0.1 + si * 0.08 }}
              >
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={flow.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={iconPaths[step.icon] || iconPaths.check} />
                  </svg>
                  <span className="text-xs text-backlot-text whitespace-nowrap">{step.label}</span>
                </div>
                {si < flow.steps.length - 1 && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={flow.color} strokeWidth="1.5" opacity={0.4}>
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
