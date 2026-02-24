import Leaderboard from "@/components/leaderboard/Leaderboard";
import { Trophy } from "lucide-react";

export default function LeaderboardPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 font-serif text-3xl text-backlot-text md:text-4xl">
          <Trophy className="text-backlot-gold" /> Leaderboard
        </h1>
        <p className="mt-2 text-backlot-muted">
          The most active participants in the Backlot experiment. The score is based
          on engagement; voting, chatting, and showing up. No token counts.
          Just action.
        </p>
      </div>
      <Leaderboard />
    </div>
  );
}
