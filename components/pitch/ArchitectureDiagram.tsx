"use client";
import { motion } from "framer-motion";

const nodes = [
  // Row 1 — User Layer
  { id: "user", label: "User", sub: "Browser + Wallet", x: 350, y: 30, color: "#F5F5F5", border: "#8B8B9E" },

  // Row 2 — Frontend
  { id: "nextjs", label: "Next.js 14", sub: "App Router + SSR", x: 350, y: 140, color: "#F5F5F5", border: "#B8A9D4" },

  // Row 3 — Client-side integrations
  { id: "wallet", label: "Wallet Adapter", sub: "Phantom / Solflare", x: 80, y: 260, color: "#B8A9D4", border: "#B8A9D4" },
  { id: "jupiter", label: "Jupiter Terminal", sub: "In-app token swap", x: 280, y: 260, color: "#C5A644", border: "#C5A644" },
  { id: "framer", label: "Framer Motion", sub: "Animations + CRT", x: 480, y: 260, color: "#2DD4BF", border: "#2DD4BF" },
  { id: "tailwind", label: "Tailwind CSS", sub: "Design system", x: 660, y: 260, color: "#8B8B9E", border: "#8B8B9E" },

  // Row 4 — API Routes
  { id: "api-vote", label: "/api/actions/vote", sub: "Solana Blinks", x: 80, y: 390, color: "#60A5FA", border: "#60A5FA" },
  { id: "api-mint", label: "/api/mint-receipt", sub: "cNFT minting", x: 280, y: 390, color: "#2DD4BF", border: "#2DD4BF" },
  { id: "api-token", label: "/api/token-stats", sub: "Price + supply", x: 480, y: 390, color: "#C5A644", border: "#C5A644" },
  { id: "api-fund", label: "/api/fund-milestone", sub: "Solana Pay", x: 660, y: 390, color: "#F472B6", border: "#F472B6" },

  // Row 5 — Backend Services
  { id: "supabase", label: "Supabase", sub: "Postgres + Realtime", x: 200, y: 520, color: "#2DD4BF", border: "#2DD4BF" },
  { id: "solana", label: "Solana", sub: "Mainnet-beta", x: 500, y: 520, color: "#B8A9D4", border: "#B8A9D4" },

  // Row 6 — Solana Programs
  { id: "bubblegum", label: "Bubblegum", sub: "cNFT program", x: 350, y: 640, color: "#2DD4BF", border: "#2DD4BF" },
  { id: "memo", label: "Memo Program", sub: "Vote recording", x: 550, y: 640, color: "#60A5FA", border: "#60A5FA" },
  { id: "system", label: "System Program", sub: "SOL transfers", x: 150, y: 640, color: "#F472B6", border: "#F472B6" },
];

const connections: [string, string, string][] = [
  ["user", "nextjs", "#8B8B9E"],
  ["nextjs", "wallet", "#B8A9D4"],
  ["nextjs", "jupiter", "#C5A644"],
  ["nextjs", "framer", "#2DD4BF"],
  ["nextjs", "tailwind", "#8B8B9E"],
  ["nextjs", "api-vote", "#60A5FA"],
  ["nextjs", "api-mint", "#2DD4BF"],
  ["nextjs", "api-token", "#C5A644"],
  ["nextjs", "api-fund", "#F472B6"],
  ["api-vote", "supabase", "#60A5FA"],
  ["api-mint", "supabase", "#2DD4BF"],
  ["api-token", "solana", "#C5A644"],
  ["api-fund", "solana", "#F472B6"],
  ["api-vote", "solana", "#60A5FA"],
  ["api-mint", "solana", "#2DD4BF"],
  ["supabase", "system", "#F472B6"],
  ["solana", "bubblegum", "#2DD4BF"],
  ["solana", "memo", "#60A5FA"],
  ["solana", "system", "#F472B6"],
];

function getNodeCenter(id: string): { x: number; y: number } {
  const node = nodes.find((n) => n.id === id);
  if (!node) return { x: 0, y: 0 };
  return { x: node.x + 70, y: node.y + 25 };
}

export default function ArchitectureDiagram() {
  return (
    <div className="relative w-full overflow-x-auto">
      <svg viewBox="0 0 800 700" className="mx-auto w-full max-w-4xl" style={{ minWidth: 600 }}>
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="800" height="700" fill="url(#grid)" />

        {/* Layer labels */}
        {[
          { y: 15, label: "USER LAYER", color: "#8B8B9E" },
          { y: 125, label: "FRONTEND", color: "#B8A9D4" },
          { y: 245, label: "CLIENT INTEGRATIONS", color: "#C5A644" },
          { y: 375, label: "API ROUTES", color: "#60A5FA" },
          { y: 505, label: "BACKEND", color: "#2DD4BF" },
          { y: 625, label: "SOLANA PROGRAMS", color: "#F472B6" },
        ].map((layer) => (
          <text key={layer.label} x="4" y={layer.y} fill={layer.color} fontSize="8" fontFamily="monospace" opacity={0.5}>
            {layer.label}
          </text>
        ))}

        {/* Connections */}
        {connections.map(([from, to, color], i) => {
          const start = getNodeCenter(from);
          const end = getNodeCenter(to);
          return (
            <motion.line
              key={`${from}-${to}`}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke={color}
              strokeWidth="1"
              opacity={0.2}
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.2 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.03 }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node, i) => (
          <motion.g
            key={node.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
          >
            <rect
              x={node.x}
              y={node.y}
              width="140"
              height="50"
              rx="8"
              fill="rgba(26, 21, 37, 0.9)"
              stroke={node.border}
              strokeWidth="1"
              opacity="0.8"
            />
            <text x={node.x + 70} y={node.y + 22} textAnchor="middle" fill={node.color} fontSize="11" fontWeight="500" fontFamily="system-ui">
              {node.label}
            </text>
            <text x={node.x + 70} y={node.y + 38} textAnchor="middle" fill="#8B8B9E" fontSize="8" fontFamily="system-ui">
              {node.sub}
            </text>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
