import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const revalidate = 60;

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");

  // Fetch all data in 3 queries instead of N+1
  const [votesRes, chatsRes, receiptsRes] = await Promise.all([
    supabaseAdmin.from("votes").select("wallet_address, poll_id"),
    supabaseAdmin.from("chat_messages").select("wallet_address"),
    supabaseAdmin.from("vote_receipts").select("wallet_address"),
  ]);

  const votes = votesRes.data || [];
  const chats = chatsRes.data || [];
  const receipts = receiptsRes.data || [];

  // Aggregate in memory
  const scores: Record<string, {
    wallet_address: string;
    votes_cast: number;
    polls: Set<string>;
    chat_messages_sent: number;
    cnft_receipts: number;
  }> = {};

  function ensure(w: string) {
    if (!scores[w]) {
      scores[w] = {
        wallet_address: w,
        votes_cast: 0,
        polls: new Set(),
        chat_messages_sent: 0,
        cnft_receipts: 0,
      };
    }
    return scores[w];
  }

  for (const v of votes) {
    const s = ensure(v.wallet_address);
    s.votes_cast++;
    s.polls.add(v.poll_id);
  }

  for (const c of chats) {
    ensure(c.wallet_address).chat_messages_sent++;
  }

  for (const r of receipts) {
    ensure(r.wallet_address).cnft_receipts++;
  }

  const leaderboard = Object.values(scores)
    .map((s) => {
      const polls_participated = s.polls.size;
      const total_score =
        s.votes_cast * 10 +
        polls_participated * 25 +
        s.chat_messages_sent * 2 +
        s.cnft_receipts * 15;
      return {
        wallet_address: s.wallet_address,
        votes_cast: s.votes_cast,
        polls_participated,
        chat_messages_sent: s.chat_messages_sent,
        cnft_receipts: s.cnft_receipts,
        total_score,
      };
    })
    .sort((a, b) => b.total_score - a.total_score);

  const top50 = leaderboard.slice(0, 50);

  let myRank = null;
  if (wallet) {
    const idx = leaderboard.findIndex((s) => s.wallet_address === wallet);
    if (idx >= 0) {
      myRank = { rank: idx + 1, ...leaderboard[idx] };
    }
  }

  return NextResponse.json({ leaderboard: top50, myRank });
}
