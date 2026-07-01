"use client";

import { useRef, useState } from "react";

const GAME_FILTERS = [
  { id: "all",       label: "All Shows" },
  { id: "pokemon",   label: "Pokémon" },
  { id: "mtg",       label: "MTG" },
  { id: "sports",    label: "Sports" },
  { id: "yugioh",    label: "Yu-Gi-Oh" },
  { id: "one_piece", label: "One Piece" },
];

interface GeoSuggestion {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
}

interface SearchBarProps {
  keyword: string;
  gameFilter: string;
  isLoading: boolean;
  onKeywordChange: (value: string) => void;
  onGameFilterChange: (value: string) => void;
  onLocationSelect: (center: [number, number], label: string) => void;
}

export function SearchBar({
  keyword,
  gameFilter,
  isLoading,
  onKeywordChange,
  onGameFilterChange,
  onLocationSelect,
}: SearchBarProps) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const [locationQuery, setLocationQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeoSuggestion[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleLocationChange(value: string) {
    setLocationQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!token || value.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const url =
          `https://api.mapbox.com/geocoding/v5/mapbox.places/` +
          `${encodeURIComponent(value.trim())}.json` +
          `?access_token=${token}` +
          `&types=place,locality,neighborhood,district,region` +
          `&limit=5`;
        const res = await fetch(url);
        const json = await res.json();
        setSuggestions(json.features ?? []);
        setDropdownOpen(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);
  }

  function handleSelect(s: GeoSuggestion) {
    // Show just the primary place name in the input box
    const short = s.place_name.split(",")[0];
    setLocationQuery(short);
    setSuggestions([]);
    setDropdownOpen(false);
    onLocationSelect(s.center, short);
  }

  function handleLocationBlur() {
    // Small delay so a click on a suggestion fires before blur hides the dropdown
    setTimeout(() => setDropdownOpen(false), 150);
  }

  return (
    <div className="absolute top-4 left-4 right-16 z-10 flex flex-col gap-2 pointer-events-none">

      {/* ── Location search ───────────────────────────────────────────────── */}
      <div className="relative pointer-events-auto">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 select-none text-base leading-none">
          📍
        </span>
        <input
          type="text"
          value={locationQuery}
          onChange={(e) => handleLocationChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setDropdownOpen(true)}
          onBlur={handleLocationBlur}
          placeholder="Search a city or neighborhood…"
          className="w-full pl-9 pr-4 py-2.5 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-brand-500 shadow-xl transition-colors"
        />

        {/* Autocomplete dropdown */}
        {dropdownOpen && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden z-30">
            {suggestions.map((s, i) => {
              const [primary, ...rest] = s.place_name.split(",");
              return (
                <button
                  key={s.id}
                  onMouseDown={() => handleSelect(s)}
                  className={[
                    "w-full text-left px-4 py-2.5 flex items-baseline gap-2 hover:bg-slate-800 transition-colors",
                    i < suggestions.length - 1 ? "border-b border-slate-800" : "",
                  ].join(" ")}
                >
                  <span className="text-sm font-medium text-white truncate">
                    {primary}
                  </span>
                  {rest.length > 0 && (
                    <span className="text-xs text-slate-500 truncate">
                      {rest.join(",").trim()}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Show keyword search ───────────────────────────────────────────── */}
      <div className="relative pointer-events-auto">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 select-none">
          🔍
        </span>
        <input
          type="text"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder="Search shows, venues…"
          className="w-full pl-9 pr-16 py-2.5 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-brand-500 shadow-xl transition-colors"
        />
        {isLoading && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 animate-pulse">
            Loading…
          </span>
        )}
      </div>

      {/* ── Game filter chips ─────────────────────────────────────────────── */}
      <div
        className="flex gap-1.5 overflow-x-auto pointer-events-auto pb-0.5"
        style={{ scrollbarWidth: "none" }}
      >
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
