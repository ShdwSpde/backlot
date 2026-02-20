"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Activity, Vote, MessageSquare, Award } from "lucide-react";

/* ── Types ────────────────────────────────────────────────────────── */

type FeedItemKind = "vote" | "chat" | "cnft";

interface FeedItem {
  id: string;
  kind: FeedItemKind;
  wallet: string;
  label: string;
  timestamp: string;
}

interface VoteRow {
  id: string;
  wallet_address: string;
  poll_id: string;
  created_at: string;
}

interface ChatRow {
  id: string;
  wallet_address: string;
  message: string;
  tier: string;
  created_at: string;
}

interface ReceiptRow {
  id: string;
  wallet_address: string;
  poll_title: string;
  minted_at: string;
}

/* ── Helpers ──────────────────────────────────────────────────────── */

const MAX_ITEMS = 50;

function truncateWallet(address: string): string {
  if (address.length <= 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const iconMap: Record<FeedItemKind, { Icon: typeof Vote; color: string }> = {
  vote: { Icon: Vote, color: "text-backlot-lavender" },
  chat: { Icon: MessageSquare, color: "text-backlot-tropical" },
  cnft: { Icon: Award, color: "text-backlot-gold" },
};

/* ── Component ────────────────────────────────────────────────────── */

export default function ActivityFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [connected, setConnected] = useState(false);

  /* Push a new item to the top, cap at MAX_ITEMS */
  const pushItem = useCallback((item: FeedItem) => {
    setItems((prev) => [item, ...prev].slice(0, MAX_ITEMS));
  }, []);

  /* ── Fetch recent history on mount ──────────────────────────────── */
  useEffect(() => {
    const fetchRecent = async () => {
      const [votesRes, chatsRes, receiptsRes] = await Promise.all([
        supabase
          .from("votes")
          .select("id, wallet_address, poll_id, created_at")
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("chat_messages")
          .select("id, wallet_address, message, tier, created_at")
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("vote_receipts")
          .select("id, wallet_address, poll_title, minted_at")
          .order("minted_at", { ascending: false })
          .limit(20),
      ]);

      const feed: FeedItem[] = [];

      if (votesRes.data) {
        for (const v of votesRes.data as VoteRow[]) {
          feed.push({
            id: `vote-${v.id}`,
            kind: "vote",
            wallet: v.wallet_address,
            label: "voted on a poll",
            timestamp: v.created_at,
          });
        }
      }

      if (chatsRes.data) {
        for (const c of chatsRes.data as ChatRow[]) {
          feed.push({
            id: `chat-${c.id}`,
            kind: "chat",
            wallet: c.wallet_address,
            label: "sent a message",
            timestamp: c.created_at,
          });
        }
      }

      if (receiptsRes.data) {
        for (const r of receiptsRes.data as ReceiptRow[]) {
          feed.push({
            id: `cnft-${r.id}`,
            kind: "cnft",
            wallet: r.wallet_address,
            label: `minted a vote receipt`,
            timestamp: r.minted_at,
          });
        }
      }

      feed.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setItems(feed.slice(0, MAX_ITEMS));
    };

    fetchRecent();
  }, []);

  /* ── Realtime subscriptions ─────────────────────────────────────── */
  useEffect(() => {
    const channel = supabase
      .channel("activity-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "votes" },
        (payload) => {
          const v = payload.new as VoteRow;
          pushItem({
            id: `vote-${v.id}`,
            kind: "vote",
            wallet: v.wallet_address,
            label: "voted on a poll",
            timestamp: v.created_at,
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          const c = payload.new as ChatRow;
          pushItem({
            id: `chat-${c.id}`,
            kind: "chat",
            wallet: c.wallet_address,
            label: "sent a message",
            timestamp: c.created_at,
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "vote_receipts" },
        (payload) => {
          const r = payload.new as ReceiptRow;
          pushItem({
            id: `cnft-${r.id}`,
            kind: "cnft",
            wallet: r.wallet_address,
            label: "minted a vote receipt",
            timestamp: r.minted_at,
          });
        }
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pushItem]);

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div className="rounded-2xl border border-white/5 bg-backlot-surface p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Activity size={20} className="text-backlot-lavender" />
        <h2 className="font-serif text-xl text-backlot-text">Live Activity</h2>
        <span className="relative ml-auto flex h-3 w-3">
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
              connected ? "bg-emerald-400" : "bg-backlot-muted"
            }`}
          />
          <span
            className={`relative inline-flex h-3 w-3 rounded-full ${
              connected ? "bg-emerald-500" : "bg-backlot-muted"
            }`}
          />
        </span>
      </div>

      {/* Feed */}
      <div
        className="mt-4 space-y-2 overflow-y-auto pr-1"
        style={{ maxHeight: "520px" }}
      >
        {!connected && items.length === 0 && (
          <p className="py-8 text-center text-sm text-backlot-muted">
            Connecting to live feed...
          </p>
        )}

        <AnimatePresence initial={false}>
          {items.map((item) => {
            const { Icon, color } = iconMap[item.kind];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-3 rounded-lg bg-white/5 px-4 py-3"
              >
                <Icon size={16} className={color} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-backlot-text">
                    <span className="font-medium">
                      {truncateWallet(item.wallet)}
                    </span>{" "}
                    <span className="text-backlot-muted">{item.label}</span>
                  </p>
                </div>
                <span className="shrink-0 text-xs text-backlot-muted">
                  {relativeTime(item.timestamp)}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {connected && items.length === 0 && (
          <p className="py-8 text-center text-sm text-backlot-muted">
            No activity yet. Be the first!
          </p>
        )}
      </div>
    </div>
  );
}
