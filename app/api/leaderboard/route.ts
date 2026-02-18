import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");

  const { data: voters } = await supabase.from("votes").select("wallet_address");
  const { data: chatters } = await supabase.from("chat_messages").select("wallet_address");

  const wallets = new Set<string>();
  (voters || []).forEach((v) => wallets.add(v.wallet_address));
  (chatters || []).forEach((c) => wallets.add(c.wallet_address));

  const scores: Record<string, {
    wallet_address: string;
    votes_cast: number;
    polls_participated: number;
    chat_messages_sent: number;
    cnft_receipts: number;
    total_score: number;
  }> = {};

  for (const w of Array.from(wallets)) {
    const { count: voteCount } = await supabase
      .from("votes").select("*", { count: "exact", head: true }).eq("wallet_address", w);

    const { data: uniquePolls } = await supabase
      .from("votes").select("poll_id").eq("wallet_address", w);
    const pollsParticipated = new Set((uniquePolls || []).map((p) => p.poll_id)).size;

    const { count: chatCount } = await supabase
      .from("chat_messages").select("*", { count: "exact", head: true }).eq("wallet_address", w);

    const { count: receiptCount } = await supabase
      .from("vote_receipts").select("*", { count: "exact", head: true }).eq("wallet_address", w);

    const totalScore =
      (voteCount || 0) * 10 +
      pollsParticipated * 25 +
      (chatCount || 0) * 2 +
      (receiptCount || 0) * 15;

    scores[w] = {
      wallet_address: w,
      votes_cast: voteCount || 0,
      polls_participated: pollsParticipated,
      chat_messages_sent: chatCount || 0,
      cnft_receipts: receiptCount || 0,
      total_score: totalScore,
    };
  }

  const leaderboard = Object.values(scores)
    .sort((a, b) => b.total_score - a.total_score)
    .slice(0, 50);

  let myRank = null;
  if (wallet) {
    const allSorted = Object.values(scores).sort((a, b) => b.total_score - a.total_score);
    const idx = allSorted.findIndex((s) => s.wallet_address === wallet);
    if (idx >= 0) {
      myRank = { rank: idx + 1, ...allSorted[idx] };
    }
  }

  return NextResponse.json({ leaderboard, myRank });
}
