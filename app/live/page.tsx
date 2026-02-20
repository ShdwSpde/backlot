import StreamEmbed from "@/components/live/StreamEmbed";
import LiveChat from "@/components/live/LiveChat";
import ActivityFeed from "@/components/activity/ActivityFeed";

export default function LivePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-backlot-text md:text-4xl">Live from Portland, Jamaica</h1>
        <p className="mt-2 text-backlot-muted">24/7 dev cam. Token holders in chat steer the show.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <StreamEmbed />
        <LiveChat />
      </div>
      <div className="mt-8">
        <ActivityFeed />
      </div>
    </div>
  );
}
