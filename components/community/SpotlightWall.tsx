"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

const TWEETS = [
  "2024374993706975263", // Alpha incoming — Wiki page drop
  "2023067452368667082", // Community tweet
  "2023006843422011700", // Community tweet
];

function TweetEmbed({ tweetId }: { tweetId: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Load Twitter widget script if not already loaded
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;

    const existingScript = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]');
    if (!existingScript) {
      document.head.appendChild(script);
    }

    // Render tweet once script is loaded
    const render = () => {
      if (window.twttr?.widgets) {
        ref.current!.innerHTML = "";
        window.twttr.widgets.createTweet(tweetId, ref.current!, {
          theme: "dark",
          align: "center",
          dnt: true,
        });
      }
    };

    if (window.twttr?.widgets) {
      render();
    } else {
      script.onload = render;
    }
  }, [tweetId]);

  return <div ref={ref} className="min-h-[200px]" />;
}

export default function SpotlightWall() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="font-serif text-2xl text-backlot-text md:text-3xl">Community Spotlight</h2>
        <p className="mt-2 text-backlot-muted">
          From the community. Follow along on{" "}
          <a href="https://x.com/backlot876" target="_blank" rel="noopener noreferrer" className="text-backlot-lavender hover:underline">
            @Backlot876
          </a>
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TWEETS.map((id, i) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="overflow-hidden rounded-xl border border-white/5 bg-backlot-surface"
            >
              <TweetEmbed tweetId={id} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
