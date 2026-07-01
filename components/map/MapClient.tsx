"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Show } from "@/types";
import { ShowDrawer, GAME_INFO } from "./ShowDrawer";
import { SearchBar } from "./SearchBar";
import {
  fetchShowsInBounds,
  fetchRsvpCount,
  toggleRsvp,
  type MapBounds,
} from "@/lib/shows";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

// ─── Constants ────────────────────────────────────────────────────────────────

const NYC: [number, number] = [-74.006, 40.7128];
const DEBOUNCE_MS = 700;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getBoundsFromMap(map: {
  getBounds: () => {
    getNorth: () => number;
    getSouth: () => number;
    getEast: () => number;
    getWest: () => number;
  } | null;
}): MapBounds | null {
  const b = map.getBounds();
  if (!b) return null;
  return {
    north: b.getNorth(),
    south: b.getSouth(),
    east: b.getEast(),
    west: b.getWest(),
  };
}

function pinColor(games: string[]): string {
  if (games.includes("pokemon")) return "#fbbf24";
  if (games.includes("mtg"))     return "#a855f7";
  if (games.includes("sports"))  return "#3b82f6";
  if (games.includes("yugioh"))  return "#ef4444";
  return "#0ea5e9";
}

function createPinEl(show: Show, onClick: () => void): HTMLElement {
  const color = pinColor(show.games);

  const btn = document.createElement("button");
  btn.type = "button";
  btn.title = show.title;
  btn.style.cssText = [
    "width:42px", "height:42px",
    `background:${color}`,
    "border:3px solid white",
    "border-radius:50%",
    "cursor:pointer",
    "display:flex", "align-items:center", "justify-content:center",
    "font-size:18px", "line-height:1",
    "box-shadow:0 2px 10px rgba(0,0,0,0.55)",
    "transition:transform 0.14s,box-shadow 0.14s",
    "padding:0",
  ].join(";");
  btn.textContent = "🃏";

  btn.addEventListener("click", (e) => { e.stopPropagation(); onClick(); });
  btn.addEventListener("mouseenter", () => {
    btn.style.transform = "scale(1.3)";
    btn.style.boxShadow = "0 4px 18px rgba(0,0,0,0.65)";
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "";
    btn.style.boxShadow = "0 2px 10px rgba(0,0,0,0.55)";
  });

  return btn;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MapClient() {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef        = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef    = useRef<Map<string, any>>(new Map());
  const debounceRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep keyword/gameFilter accessible inside stable map event callbacks
  const keywordRef    = useRef("");
  const gameFilterRef = useRef("all");

  const [shows,        setShows]        = useState<Show[]>([]);
  const [selected,     setSelected]     = useState<Show | null>(null);
  const [rsvpCounts,   setRsvpCounts]   = useState<Record<string, number>>({});
  const [userRsvps,    setUserRsvps]    = useState<Set<string>>(new Set());
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [keyword,      setKeyword]      = useState("");
  const [gameFilter,   setGameFilter]   = useState("all");
  const [isLoading,    setIsLoading]    = useState(false);

  // Sync refs with state so map event handlers always have fresh values
  useEffect(() => { keywordRef.current    = keyword; },    [keyword]);
  useEffect(() => { gameFilterRef.current = gameFilter; }, [gameFilter]);

  // ── Geolocation ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  }, []);

  // ── Fetch shows ──────────────────────────────────────────────────────────────
  const doFetch = useCallback(
    async (bounds: MapBounds, kw: string, game: string) => {
      setIsLoading(true);
      try {
        let data = await fetchShowsInBounds(bounds, kw || undefined);
        if (game !== "all") data = data.filter((s) => s.games.includes(game));
        setShows(data);
      } catch (err) {
        console.error("fetchShowsInBounds:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ── Initialize map (runs once) ───────────────────────────────────────────────
  useEffect(() => {
    if (!token || !containerRef.current || mapRef.current) return;

    let mounted = true;

    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      // Dynamic CSS import avoids SSR flash
      await import("mapbox-gl/dist/mapbox-gl.css");
      if (!mounted || !containerRef.current) return;

      mapboxgl.accessToken = token;

      const center = userLocation
        ? [userLocation.lng, userLocation.lat] as [number, number]
        : NYC;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center,
        zoom: 11,
        attributionControl: false,
      });

      map.addControl(
        new mapboxgl.AttributionControl({ compact: true }),
        "bottom-left"
      );
      map.addControl(new mapboxgl.NavigationControl(), "top-right");
      map.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: false,
        }),
        "top-right"
      );

      map.on("load", () => {
        const bounds = getBoundsFromMap(map);
        if (bounds) doFetch(bounds, keywordRef.current, gameFilterRef.current);
      });

      // Debounced re-fetch on pan / zoom
      map.on("moveend", () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          const bounds = getBoundsFromMap(map);
          if (bounds) doFetch(bounds, keywordRef.current, gameFilterRef.current);
        }, DEBOUNCE_MS);
      });

      mapRef.current = map;
    })();

    return () => {
      mounted = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ── Re-fetch when search / filter changes ────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const bounds = getBoundsFromMap(mapRef.current);
      if (bounds) doFetch(bounds, keyword, gameFilter);
    }, DEBOUNCE_MS);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, gameFilter]);

  // ── Sync markers ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;

      const incomingIds = new Set(shows.map((s) => s.id));

      // Remove stale markers
      markersRef.current.forEach((marker, id) => {
        if (!incomingIds.has(id)) {
          marker.remove();
          markersRef.current.delete(id);
        }
      });

      // Add new markers
      shows.forEach((show) => {
        if (markersRef.current.has(show.id)) return;

        const el = createPinEl(show, () => setSelected(show));
        const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
          .setLngLat([show.lng, show.lat])
          .addTo(map);

        markersRef.current.set(show.id, marker);
      });
    })();
  }, [shows]);

  // ── Fetch RSVP counts when shows list changes ────────────────────────────────
  useEffect(() => {
    if (shows.length === 0) return;

    (async () => {
      const counts: Record<string, number> = {};
      await Promise.all(
        shows.map(async (s) => {
          counts[s.id] = await fetchRsvpCount(s.id);
        })
      );
      setRsvpCounts((prev) => ({ ...prev, ...counts }));
    })();
  }, [shows]);

  // ── Load user's existing RSVPs ────────────────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const sb = supabase; // capture so async closure has a stable non-null ref

    (async () => {
      const { data: sessionData } = await sb.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId) return;

      const { data } = await sb
        .from("rsvps")
        .select("show_id")
        .eq("user_id", userId)
        .returns<{ show_id: string }[]>();

      if (data) setUserRsvps(new Set(data.map((r) => r.show_id)));
    })();
  }, []);

  // ── RSVP handler ─────────────────────────────────────────────────────────────
  const handleRsvp = useCallback(
    async (showId: string) => {
      if (!isSupabaseConfigured || !supabase) {
        alert("Connect your Supabase project to RSVP to shows.");
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId) {
        alert("Sign in to RSVP to this show.");
        return;
      }

      const isRsvpd = userRsvps.has(showId);

      // Optimistic update
      setUserRsvps((prev) => {
        const next = new Set(prev);
        isRsvpd ? next.delete(showId) : next.add(showId);
        return next;
      });
      setRsvpCounts((prev) => ({
        ...prev,
        [showId]: (prev[showId] ?? 0) + (isRsvpd ? -1 : 1),
      }));

      try {
        await toggleRsvp(showId, userId, isRsvpd);
      } catch {
        // Revert optimistic update on error
        setUserRsvps((prev) => {
          const next = new Set(prev);
          isRsvpd ? next.add(showId) : next.delete(showId);
          return next;
        });
        setRsvpCounts((prev) => ({
          ...prev,
          [showId]: (prev[showId] ?? 0) + (isRsvpd ? 1 : -1),
        }));
      }
    },
    [userRsvps]
  );

  // ── No token state ───────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-slate-900 gap-3 px-4 text-center">
        <span className="text-5xl">🗺️</span>
        <p className="text-white font-semibold">Map unavailable</p>
        <p className="text-slate-500 text-sm max-w-xs">
          Add{" "}
          <code className="bg-slate-800 px-1.5 py-0.5 rounded text-brand-400 text-xs">
            NEXT_PUBLIC_MAPBOX_TOKEN
          </code>{" "}
          to your{" "}
          <code className="text-slate-400 text-xs">.env.local</code> file and
          restart the dev server.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-4rem)] overflow-hidden bg-slate-950">
      {/* Search bar — floats over the map */}
      <SearchBar
        keyword={keyword}
        gameFilter={gameFilter}
        isLoading={isLoading}
        onKeywordChange={setKeyword}
        onGameFilterChange={setGameFilter}
      />

      {/* Game legend — bottom-left, above attribution */}
      <div className="absolute bottom-8 left-4 z-10 flex flex-wrap gap-1.5 max-w-[200px] md:max-w-xs pointer-events-none">
        {Object.entries(GAME_INFO).map(([key, info]) => (
          <span
            key={key}
            className="px-2 py-0.5 rounded-full text-[10px] font-semibold opacity-90"
            style={{ backgroundColor: info.bg, color: info.text }}
          >
            {info.label}
          </span>
        ))}
      </div>

      {/* Map container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Show detail drawer */}
      <ShowDrawer
        show={selected}
        rsvpCount={selected ? (rsvpCounts[selected.id] ?? 0) : 0}
        isRsvpd={selected ? userRsvps.has(selected.id) : false}
        userLocation={userLocation}
        onClose={() => setSelected(null)}
        onRsvp={handleRsvp}
      />
    </div>
  );
}
