import { ActivityFeed } from "@/components/ActivityFeed";

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Your Feed</h1>
        <p className="text-slate-400 text-sm">
          Shows and activity from people you follow
        </p>
      </div>
      <ActivityFeed />
    </div>
  );
}
