"use client";

const PLACEHOLDER_SHOWS = [
  { name: "Pacific Coast Card Expo", date: "Jun 14", location: "San Diego, CA" },
  { name: "Northwest TCG Swap Meet", date: "May 28", location: "Seattle, WA" },
];

const COLLECTING = ["Pokémon", "One Piece", "Sports Cards — NFL"];

export function ProfileView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-brand-600 flex items-center justify-center text-2xl font-bold text-white">
          U
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Your Profile</h1>
          <p className="text-slate-400 text-sm mt-0.5">@username</p>
          <div className="flex gap-4 mt-2 text-sm">
            <span className="text-slate-300">
              <span className="font-semibold text-white">0</span>{" "}
              <span className="text-slate-500">following</span>
            </span>
            <span className="text-slate-300">
              <span className="font-semibold text-white">0</span>{" "}
              <span className="text-slate-500">followers</span>
            </span>
          </div>
        </div>
      </div>

      {/* Sign in prompt */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 text-center">
        <p className="text-slate-300 text-sm mb-3">
          Sign in to track shows, follow collectors, and share your pulls.
        </p>
        <button className="px-5 py-2.5 bg-brand-500 hover:bg-brand-400 text-white text-sm font-semibold rounded-lg transition-colors">
          Sign In with Email
        </button>
      </div>

      {/* What I collect */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Collecting
        </h2>
        <div className="flex flex-wrap gap-2">
          {COLLECTING.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-300"
            >
              {tag}
            </span>
          ))}
          <span className="px-3 py-1.5 bg-slate-800 border border-dashed border-slate-600 rounded-full text-sm text-slate-500 cursor-pointer hover:border-slate-500">
            + Add
          </span>
        </div>
      </div>

      {/* Recent shows */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Shows Attended
        </h2>
        <div className="space-y-2">
          {PLACEHOLDER_SHOWS.map((show) => (
            <div
              key={show.name}
              className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-white">{show.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  📍 {show.location}
                </p>
              </div>
              <span className="text-xs text-slate-500">{show.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
