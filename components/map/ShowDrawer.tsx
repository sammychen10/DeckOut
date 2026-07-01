"use client";

import type { Show } from "@/types";
import { haversineDistance } from "@/lib/utils";

export const GAME_INFO: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  pokemon: { label: "Pokémon", bg: "#fbbf24", text: "#78350f" },
  sports:  { label: "Sports",  bg: "#3b82f6", text: "#ffffff" },
  mtg:     { label: "MTG",     bg: "#a855f7", text: "#ffffff" },
  yugioh:  { label: "Yu-Gi-Oh", bg: "#ef4444", text: "#ffffff" },
};

function defaultGameInfo(game: string) {
  return GAME_INFO[game] ?? { label: game, bg: "#64748b", text: "#ffffff" };
}

interface ShowDrawerProps {
  show: Show | null;
  rsvpCount: number;
  isRsvpd: boolean;
  userLocation: { lat: number; lng: number } | null;
  onClose: () => void;
  onRsvp: (showId: string) => void;
}

export function ShowDrawer({
  show,
  rsvpCount,
  isRsvpd,
  userLocation,
  onClose,
  onRsvp,
}: ShowDrawerProps) {
  if (!show) return null;

  const distance =
    userLocation != null
      ? haversineDistance(userLocation.lat, userLocation.lng, show.lat, show.lng)
      : null;

  const start = new Date(show.starts_at);
  const end   = new Date(show.ends_at);

  const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) =>
    d.toLocaleString("en-US", opts);

  const dateLabel = fmt(start, { weekday: "long", month: "long", day: "numeric" });
  const timeRange = `${fmt(start, { hour: "numeric", minute: "2-digit" })} – ${fmt(end, { hour: "numeric", minute: "2-digit" })}`;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-20"
        onClick={onClose}
      />

      {/*
        Mobile  → bottom sheet (slide up, max 75 vh)
        Desktop → right side panel (full height, 384 px wide)
      */}
      <div className="fixed z-30 flex flex-col
        bottom-0 left-0 right-0 max-h-[75vh] rounded-t-2xl
        md:top-0 md:right-0 md:bottom-0 md:left-auto md:w-96 md:max-h-none md:rounded-none md:rounded-l-none
        bg-slate-900 border-t border-slate-700/80
        md:border-t-0 md:border-l
        shadow-2xl overflow-y-auto
        animate-drawer-up md:animate-drawer-right"
      >
        {/* Drag handle (mobile only) */}
        <div className="md:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-600" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-4 pb-2 flex-shrink-0">
          <div className="flex-1 min-w-0 pr-3">
            <h2 className="text-xl font-bold text-white leading-snug">{show.title}</h2>
            <p className="text-slate-400 text-sm mt-0.5">{show.venue_name}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors flex-shrink-0 mt-0.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Game tags */}
        <div className="flex flex-wrap gap-1.5 px-5 pb-4">
          {show.games.map((game) => {
            const info = defaultGameInfo(game);
            return (
              <span
                key={game}
                className="px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: info.bg, color: info.text }}
              >
                {info.label}
              </span>
            );
          })}
        </div>

        {/* Details */}
        <div className="px-5 space-y-3 pb-4 border-b border-slate-800">
          <DetailRow icon="📅" label={dateLabel} sub={timeRange} />
          <DetailRow icon="📍" label={show.venue_name} sub={show.address} />
          {distance != null && (
            <DetailRow
              icon="🧭"
              label={
                distance < 0.1
                  ? "You're here!"
                  : `${distance.toFixed(1)} mi away`
              }
            />
          )}
          {show.entry_fee && (
            <DetailRow icon="🎟️" label={`Entry: ${show.entry_fee}`} />
          )}
          {show.description && (
            <p className="text-slate-400 text-sm leading-relaxed pt-1">
              {show.description}
            </p>
          )}
        </div>

        {/* RSVP */}
        <div className="px-5 py-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-white font-semibold text-sm">
              {rsvpCount} {rsvpCount === 1 ? "person" : "people"} going
            </p>
            <p className="text-slate-500 text-xs mt-0.5">
              {isRsvpd ? "You're on the list ✓" : "Will you be there?"}
            </p>
          </div>
          <button
            onClick={() => onRsvp(show.id)}
            className={[
              "px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 whitespace-nowrap",
              isRsvpd
                ? "bg-slate-700 text-brand-400 border border-brand-500/50 hover:bg-slate-600"
                : "bg-brand-500 text-white hover:bg-brand-400 shadow-lg shadow-brand-500/20",
            ].join(" ")}
          >
            {isRsvpd ? "✓ Going" : "I'm going"}
          </button>
        </div>
      </div>
    </>
  );
}

function DetailRow({
  icon,
  label,
  sub,
}: {
  icon: string;
  label: string;
  sub?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-base mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-white text-sm font-medium leading-snug">{label}</p>
        {sub && <p className="text-slate-400 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
