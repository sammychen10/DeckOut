"use client";

const GAME_FILTERS = [
  { id: "all",     label: "All Shows" },
  { id: "pokemon", label: "Pokémon" },
  { id: "mtg",     label: "MTG" },
  { id: "sports",  label: "Sports" },
  { id: "yugioh",  label: "Yu-Gi-Oh" },
];

interface SearchBarProps {
  keyword: string;
  gameFilter: string;
  isLoading: boolean;
  onKeywordChange: (value: string) => void;
  onGameFilterChange: (value: string) => void;
}

export function SearchBar({
  keyword,
  gameFilter,
  isLoading,
  onKeywordChange,
  onGameFilterChange,
}: SearchBarProps) {
  return (
    <div className="absolute top-4 left-4 right-16 z-10 flex flex-col gap-2 pointer-events-none">
      {/* Keyword search */}
      <div className="relative pointer-events-auto">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 select-none">
          🔍
        </span>
        <input
          type="text"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder="Search shows, venues…"
          className="w-full pl-9 pr-16 py-2.5 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-brand-500 shadow-xl"
        />
        {isLoading && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 animate-pulse">
            Loading…
          </span>
        )}
      </div>

      {/* Game filter chips */}
      <div className="flex gap-1.5 overflow-x-auto pointer-events-auto pb-0.5"
           style={{ scrollbarWidth: "none" }}>
        {GAME_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => onGameFilterChange(f.id)}
            className={[
              "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all shadow-md",
              gameFilter === f.id
                ? "bg-brand-500 border-brand-400 text-white"
                : "bg-slate-900/95 backdrop-blur-md border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white",
            ].join(" ")}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
