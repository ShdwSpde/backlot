"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const PUMP_STREAM_URL =
  "https://pump.fun/coin/DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump";

export default function StreamEmbed() {
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-xl border border-white/5"
    >
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-red-600/90 px-3 py-1 text-xs font-bold text-white">
        <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
        LIVE
      </div>

      <div className="aspect-video w-full bg-backlot-surface">
        <iframe
          src={PUMP_STREAM_URL}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setLoaded(true)}
          title="BACKLOT Live Stream"
        />

        {!loaded && (
          <div className="absolute inset-0 bg-backlot-surface">
            <div className="h-full w-full animate-pulse bg-backlot-surface" />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-backlot-muted">Loading stream...</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-white/5 bg-backlot-surface/50 px-4 py-2">
        <span className="text-xs text-backlot-muted">
          Streaming from Jamaica
        </span>
        <a
          href={PUMP_STREAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-backlot-lavender hover:underline"
        >
          Open on pump.fun ↗
        </a>
      </div>
    </motion.div>
  );
}
