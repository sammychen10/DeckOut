"use client";

const PLACEHOLDER_ITEMS = [
  {
    id: 1,
    user: "Jordan K.",
    avatar: "JK",
    action: "is going to",
    show: "Pacific Coast Card Expo",
    location: "San Diego, CA",
    date: "Jul 12",
    time: "9 min ago",
  },
  {
    id: 2,
    user: "Maria T.",
    avatar: "MT",
    action: "posted from",
    show: "Northeast TCG Open",
    location: "Boston, MA",
    date: "Jul 8",
    time: "1 hr ago",
    post: "Pulled a PSA 10 Charizard at the door 🔥",
  },
  {
    id: 3,
    user: "Devon R.",
    avatar: "DR",
    action: "is going to",
    show: "Midwest Collectors Fair",
    location: "Chicago, IL",
    date: "Jul 19",
    time: "3 hr ago",
  },
];

export function ActivityFeed() {
  return (
    <div className="space-y-3">
      {PLACEHOLDER_ITEMS.map((item) => (
        <div
          key={item.id}
          className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-colors"
        >
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {item.avatar}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-white">{item.user}</span>{" "}
                {item.action}{" "}
                <span className="font-semibold text-brand-400">
                  {item.show}
                </span>
              </p>

              {item.post && (
                <p className="mt-1.5 text-sm text-slate-200 bg-slate-700/50 rounded-lg px-3 py-2">
                  {item.post}
                </p>
              )}

              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-slate-500">
                  📍 {item.location}
                </span>
                <span className="text-xs text-slate-500">🗓 {item.date}</span>
                <span className="text-xs text-slate-600 ml-auto">
                  {item.time}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Empty state hint */}
      <p className="text-center text-slate-600 text-sm pt-4">
        Follow more collectors to fill up your feed
      </p>
    </div>
  );
}
