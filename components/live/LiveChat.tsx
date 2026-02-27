"use client";
import { useState, useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/lib/supabase";
import { useBacklotTier } from "@/hooks/useBacklotTier";
import TierBadge from "@/components/TierBadge";
import type { ChatMessage, Tier } from "@/lib/types";
import { Send } from "lucide-react";

export default function LiveChat() {
  const { publicKey, connected } = useWallet();
  const { tier } = useBacklotTier();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { supabase.from("chat_messages").select("*").order("created_at", { ascending: true }).limit(50).then(({ data }) => setMessages(data || [])); }, []);

  useEffect(() => {
    const channel = supabase.channel("live-chat").on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => { setMessages((prev) => [...prev.slice(-99), payload.new as ChatMessage]); }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !connected || !publicKey || tier === "viewer") return;
    if (input.length > 500) return;
    setSending(true);
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: publicKey.toBase58(), message: input.trim() }),
      });
    } catch { /* silent */ }
    setInput("");
    setSending(false);
  };

  return (
    <div className="flex h-full flex-col glass rounded-xl">
      <div className="border-b border-white/5 p-3"><div className="flex items-center justify-between"><h3 className="text-sm font-medium text-backlot-text">Live Chat</h3><span className="text-xs text-backlot-muted">{messages.length} messages</span></div></div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ maxHeight: "400px" }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`rounded-lg p-2 text-sm ${msg.is_highlighted ? "border border-backlot-gold/20 bg-backlot-gold/5" : "bg-white/5"}`}>
            <div className="flex items-center gap-2"><span className="font-medium text-backlot-text text-xs">{msg.display_name || msg.wallet_address.slice(0, 8)}</span><TierBadge tier={msg.tier as Tier} /></div>
            <p className="mt-1 text-backlot-muted">{msg.message}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-white/5 p-3">
        {connected && tier !== "viewer" ? (
          <div className="flex gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Say something..." className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-backlot-text placeholder:text-backlot-muted/40 focus:border-backlot-lavender/30 focus:outline-none" disabled={sending} />
            <button onClick={sendMessage} disabled={sending || !input.trim()} className="rounded-lg bg-backlot-lavender/20 p-2 text-backlot-lavender transition hover:bg-backlot-lavender/30 disabled:opacity-50"><Send size={16} /></button>
          </div>
        ) : (<p className="text-center text-xs text-backlot-muted">{connected ? "Hold $BACKLOT to chat" : "Connect wallet to chat"}</p>)}
      </div>
    </div>
  );
}
