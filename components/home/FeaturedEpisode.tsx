"use client";
import { motion } from "framer-motion";
import { Play, Clock, ExternalLink } from "lucide-react";

const PUMP_TOKEN = "DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump";

interface PumpStream {
  title: string;
  duration: string;
  clipId: string;
  date: string;
  episode: number;
}

// Latest streams — first entry is featured
const latestStreams: PumpStream[] = [
  { title: "24/7 Live Streaming from Jamaica — Living Art Experiment", duration: "53:44", clipId: "20260218_023836:2070942_20260218_023820", date: "Feb 18", episode: 20 },
  { title: "24/7 Live Streaming from Jamaica — Living Art Experiment", duration: "1:50:54", clipId: "20260218_004337:2070734_20260218_004320", date: "Feb 18", episode: 19 },
  { title: "24/7 Live Streaming from Jamaica — Living Art Experiment", duration: "2:50:36", clipId: "20260217_214808:2070397_20260217_214749", date: "Feb 17", episode: 18 },
];

const clipUrl = (clipId: string) =>
  `https://pump.fun/coin/${PUMP_TOKEN}?clip=${encodeURIComponent(clipId)}`;
const thumbUrl = (clipId: string) =>
  `https://clips.pump.fun/${PUMP_TOKEN}/clips/${clipId}/thumbnail.jpg`;

export default function FeaturedEpisode() {
  const featured = latestStreams[0];
  const recent = latestStreams.slice(1);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <h2 className="font-serif text-2xl text-backlot-text md:text-3xl">Now Showing</h2>
        <p className="mt-2 text-backlot-muted">
          Episode {featured.episode}: {featured.title}
        </p>

        {/* Featured episode */}
        <a
          href={clipUrl(featured.clipId)}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-6 block overflow-hidden rounded-xl border border-white/5 bg-backlot-surface transition-colors hover:border-backlot-lavender/30"
        >
          <div className="relative aspect-video w-full bg-backlot-bg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbUrl(featured.clipId)}
              alt={featured.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/20">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-backlot-gold/90 text-backlot-bg transition-transform group-hover:scale-110">
                <Play size={28} fill="currentColor" className="ml-1" />
              </div>
            </div>
            {/* Duration badge */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-xs text-white">
              <Clock size={10} />
              {featured.duration}
            </div>
            {/* Episode badge */}
            <div className="absolute left-3 top-3 rounded-md bg-backlot-lavender/90 px-2 py-1 text-xs font-bold text-white">
              EP {featured.episode}
            </div>
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-backlot-text group-hover:text-backlot-gold transition-colors">{featured.title}</p>
              <p className="mt-1 text-xs text-backlot-muted">{featured.date} &middot; pump.fun stream</p>
            </div>
            <ExternalLink size={14} className="shrink-0 text-backlot-muted group-hover:text-backlot-lavender transition-colors" />
          </div>
        </a>

        {/* Recent episodes row */}
        {recent.length > 0 && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {recent.map((stream, i) => (
              <motion.a
                key={stream.clipId}
                href={clipUrl(stream.clipId)}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="group flex gap-3 overflow-hidden rounded-lg border border-white/5 bg-backlot-surface p-3 transition-colors hover:border-backlot-lavender/20"
              >
                <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-md bg-backlot-bg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbUrl(stream.clipId)}
                    alt={stream.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play size={16} fill="white" className="text-white" />
                  </div>
                  <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1 text-[10px] text-white">
                    {stream.duration}
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-xs font-medium text-backlot-text line-clamp-2">EP {stream.episode}: {stream.title}</p>
                  <p className="mt-1 text-[10px] text-backlot-muted">{stream.date}</p>
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}
