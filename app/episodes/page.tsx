"use client";
import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useInView, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { Episode } from "@/lib/types";
import EpisodeCard from "@/components/episodes/EpisodeCard";
import GatedContent from "@/components/GatedContent";
import { Play, ExternalLink, Clock, Radio } from "lucide-react";

const PUMP_TOKEN = "DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump";
const clipUrl = (clipId: string) =>
  `https://pump.fun/coin/${PUMP_TOKEN}?clip=${encodeURIComponent(clipId)}`;
const thumbUrl = (clipId: string) =>
  `https://clips.pump.fun/${PUMP_TOKEN}/clips/${clipId}/thumbnail.jpg`;

interface PumpStream {
  id: string;
  title: string;
  duration: string;
  clipId: string;
  date: string;
  likes: number;
  episode: number;
}

const pumpStreams: PumpStream[] = [
  { id: "s1", title: "On-Chain Reality Show — Memes for Good", duration: "9:12", clipId: "20260216_195559:2067498_20260216_195544", date: "Feb 16", likes: 0, episode: 1 },
  { id: "s2", title: "Memecoin Reality TV On-Chain (Q&A + Chill)", duration: "10:44", clipId: "20260217_010905:2068192_20260217_010849", date: "Feb 17", likes: 0, episode: 2 },
  { id: "s3", title: "Memecoin Reality TV Show On-Chain (Q&A + Chill)", duration: "7:26", clipId: "20260217_012912:2068231_20260217_012855", date: "Feb 17", likes: 0, episode: 3 },
  { id: "s4", title: "Memecoin Reality TV On-Chain (Q&A + Chill)", duration: "44:10", clipId: "20260217_013745:2068241_20260217_013731", date: "Feb 17", likes: 0, episode: 4 },
  { id: "s5", title: "Memecoin Reality TV-Show On-Chain (Q&A + Chill)", duration: "58:56", clipId: "20260217_023111:2068332_20260217_023056", date: "Feb 17", likes: 0, episode: 5 },
  { id: "s6", title: "Memecoin Reality TV Show On-Chain", duration: "2:23:54", clipId: "20260217_033329:2068441_20260217_033314", date: "Feb 17", likes: 0, episode: 6 },
  { id: "s7", title: "Memecoin Reality TV-Show On-Chain (Q&A + Chill)", duration: "20:16", clipId: "20260217_072649:2068851_20260217_072634", date: "Feb 17", likes: 0, episode: 7 },
  { id: "s8", title: "Feed the Dev — Memecoin Reality TV-Show On-Chain", duration: "1:50:38", clipId: "20260217_075431:2068902_20260217_075416", date: "Feb 17", likes: 2, episode: 8 },
  { id: "s9", title: "Feed the Dev — Memecoin Reality TV-Show On-Chain", duration: "17:38", clipId: "20260217_095449:2069049_20260217_095435", date: "Feb 17", likes: 0, episode: 9 },
  { id: "s10", title: "Feed the Dev — 24Hr Streaming Living Art", duration: "31:24", clipId: "20260217_101249:2069049_20260217_101233", date: "Feb 17", likes: 0, episode: 10 },
  { id: "s11", title: "Feed the Dev — 24Hr Streaming Living Art", duration: "1:29:50", clipId: "20260217_104434:2069049_20260217_104417", date: "Feb 17", likes: 1, episode: 11 },
  { id: "s12", title: "24/7 Live Streaming — Living Art Experiment", duration: "2:20:38", clipId: "20260217_121802:2069232_20260217_121747", date: "Feb 17", likes: 1, episode: 12 },
  { id: "s13", title: "Hold $BACKLOT to Decide How the Day Goes", duration: "2:21:58", clipId: "20260217_143943:2069473_20260217_143922", date: "Feb 17", likes: 0, episode: 13 },
  { id: "s14", title: "Hold $BACKLOT to Decide How the Day Goes", duration: "51:34", clipId: "20260217_170246:2069814_20260217_170229", date: "Feb 17", likes: 0, episode: 14 },
  { id: "s15", title: "24/7 Live Streaming — Living Art Experiment", duration: "1:29:22", clipId: "20260217_180309:2069931_20260217_180254", date: "Feb 17", likes: 3, episode: 15 },
  { id: "s16", title: "24/7 Live Streaming — Living Art Experiment", duration: "18:16", clipId: "20260217_203744:2070246_20260217_203727", date: "Feb 17", likes: 1, episode: 16 },
  { id: "s17", title: "24/7 Live Streaming — Living Art Experiment", duration: "43:22", clipId: "20260217_205957:2070294_20260217_205942", date: "Feb 17", likes: 0, episode: 17 },
  { id: "s18", title: "24/7 Live Streaming from Jamaica — Living Art Experiment", duration: "2:50:36", clipId: "20260217_214808:2070397_20260217_214749", date: "Feb 17", likes: 1, episode: 18 },
  { id: "s19", title: "24/7 Live Streaming from Jamaica — Living Art Experiment", duration: "1:50:54", clipId: "20260218_004337:2070734_20260218_004320", date: "Feb 18", likes: 0, episode: 19 },
  { id: "s20", title: "24/7 Live Streaming from Jamaica — Living Art Experiment", duration: "53:44", clipId: "20260218_023836:2070942_20260218_023820", date: "Feb 18", likes: 0, episode: 20 },
];

/* ── Animated counter ── */
function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 80, damping: 20 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (isInView) motionVal.set(value);
  }, [isInView, value, motionVal]);

  useEffect(() => {
    const unsub = spring.on("change", (v: number) => setDisplay(Math.round(v)));
    return unsub;
  }, [spring]);

  return <span ref={ref} className={className}>{display}</span>;
}

/* ── Stream card with micro-animations ── */
function StreamCard({ stream, index }: { stream: PumpStream; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.a
      href={clipUrl(stream.clipId)}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.04, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group relative overflow-hidden rounded-xl border border-white/5 bg-backlot-surface"
    >
      {/* Hover glow border */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-10 rounded-xl pointer-events-none"
            style={{ boxShadow: "inset 0 0 0 1px rgba(168,130,255,0.3), 0 0 20px rgba(168,130,255,0.08)" }}
          />
        )}
      </AnimatePresence>

      <div className="relative aspect-video bg-backlot-bg/50 overflow-hidden">
        {/* Ken Burns slow zoom on thumbnail */}
        <motion.img
          src={thumbUrl(stream.clipId)}
          alt={stream.title}
          onLoad={() => setImageLoaded(true)}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={imageLoaded ? { opacity: 1, scale: hovered ? 1.08 : 1.0 } : {}}
          transition={{ opacity: { duration: 0.4 }, scale: { duration: 4, ease: "easeOut" } }}
          className="h-full w-full object-cover"
        />

        {/* Play button — scale + pulse on hover */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <motion.div
            animate={hovered ? { scale: [1, 1.15, 1] } : { scale: 1 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative rounded-full bg-backlot-gold p-3 shadow-lg shadow-backlot-gold/30"
          >
            <Play size={20} className="text-backlot-bg fill-backlot-bg ml-0.5" />
          </motion.div>
        </motion.div>

        {/* Duration badge — slides in from right */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.04 + 0.3, duration: 0.3 }}
          className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/80 backdrop-blur-sm px-2 py-0.5 text-xs text-white"
        >
          <Clock size={10} className="opacity-60" />
          {stream.duration}
        </motion.div>

        {/* Episode badge — pops in with spring */}
        <motion.div
          initial={{ opacity: 0, scale: 0, rotate: -12 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.04 + 0.2, type: "spring", stiffness: 300, damping: 15 }}
          className="absolute top-2 left-2 rounded-md bg-backlot-gold px-2 py-0.5 text-xs font-bold text-backlot-bg shadow-lg shadow-backlot-gold/20"
        >
          EP {stream.episode}
        </motion.div>
      </div>

      <div className="p-4">
        {/* Title with underline wipe on hover */}
        <h3 className="text-sm font-medium text-backlot-text line-clamp-2 relative">
          <span className="transition-colors duration-200 group-hover:text-backlot-gold">
            {stream.title}
          </span>
        </h3>
        <div className="mt-2 flex items-center justify-between text-xs text-backlot-muted">
          <span>{stream.date}, 2026</span>
          <motion.span
            className="flex items-center gap-1"
            animate={{ x: hovered ? 2 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ExternalLink size={10} className="transition-colors group-hover:text-backlot-lavender" />
            <span className="transition-colors group-hover:text-backlot-lavender">pump.fun</span>
          </motion.span>
        </div>
      </div>
    </motion.a>
  );
}

export default function EpisodesPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("episodes")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setEpisodes(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="font-serif text-3xl text-backlot-text md:text-4xl">Episodes</h1>
          <motion.p
            className="mt-2 text-backlot-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            The Backlot docu-series. New episodes as the experiment unfolds.
          </motion.p>
        </motion.div>
        <motion.a
          href={`https://pump.fun/coin/${PUMP_TOKEN}`}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(168,130,255,0.15)" }}
          whileTap={{ scale: 0.97 }}
          className="hidden md:flex items-center gap-2 rounded-lg border border-backlot-lavender/20 bg-backlot-lavender/10 px-4 py-2 text-sm text-backlot-lavender transition"
        >
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Radio size={14} className="text-red-400" />
          </motion.span>
          Watch Live on pump.fun
        </motion.a>
      </div>

      {/* ── Stats bar with animated counters ── */}
      <motion.div
        className="mt-8 flex items-center gap-8 border-b border-white/5 pb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="text-center">
          <div className="text-2xl font-bold text-backlot-gold">
            <AnimatedNumber value={pumpStreams.length} />
          </div>
          <motion.div
            className="text-xs text-backlot-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Episodes
          </motion.div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-backlot-text">
            <AnimatedNumber value={3} />
          </div>
          <motion.div
            className="text-xs text-backlot-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            Days Streaming
          </motion.div>
        </div>
        <div className="text-center">
          <motion.div
            className="text-2xl font-bold text-backlot-tropical"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            24/7
          </motion.div>
          <motion.div
            className="text-xs text-backlot-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            From Jamaica
          </motion.div>
        </div>
      </motion.div>

      {/* ── Previous Streams section ── */}
      <div className="mt-10">
        <motion.div
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="rounded-lg bg-gradient-to-r from-backlot-gold/20 to-backlot-lavender/20 p-2"
            animate={{ rotate: [0, 3, -3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Play size={18} className="text-backlot-gold fill-backlot-gold" />
          </motion.div>
          <div>
            <h2 className="font-serif text-xl text-backlot-text">Previous Streams</h2>
            <p className="text-xs text-backlot-muted">Live recordings from pump.fun — click to replay</p>
          </div>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pumpStreams.slice().reverse().map((stream, i) => (
            <StreamCard key={stream.id} stream={stream} index={i} />
          ))}
        </div>
      </div>

      {/* ── Supabase episodes (if any exist) ── */}
      {!loading && episodes.length > 0 && (
        <motion.div
          className="mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="font-serif text-xl text-backlot-text mb-6">Produced Episodes</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {episodes.map((episode, i) => (
              <div key={episode.id}>
                {episode.tier_required === "viewer" ? (
                  <EpisodeCard episode={episode} index={i} />
                ) : (
                  <GatedContent requiredTier={episode.tier_required}>
                    <EpisodeCard episode={episode} index={i} />
                  </GatedContent>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Mobile CTA ── */}
      <motion.div
        className="mt-12 md:hidden"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <motion.a
          href={`https://pump.fun/coin/${PUMP_TOKEN}`}
          target="_blank"
          rel="noopener noreferrer"
          whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-2 rounded-lg bg-backlot-lavender/20 px-4 py-3 text-sm text-backlot-lavender transition hover:bg-backlot-lavender/30"
        >
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Radio size={14} className="text-red-400" />
          </motion.span>
          Watch Live on pump.fun
        </motion.a>
      </motion.div>
    </div>
  );
}
