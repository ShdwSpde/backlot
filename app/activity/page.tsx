"use client";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import ActivityFeed from "@/components/activity/ActivityFeed";

export default function ActivityPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <Activity size={28} className="text-backlot-lavender" />
          <h1 className="font-serif text-3xl text-backlot-text md:text-4xl">
            Live Activity
          </h1>
        </div>
        <p className="mt-2 text-backlot-muted">
          Every vote, message, and mint &mdash; as it happens.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8"
      >
        <ActivityFeed />
      </motion.div>
    </div>
  );
}
