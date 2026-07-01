import { supabase } from "./supabase";
import type { Show } from "@/types";

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// ─── Placeholder data (used when Supabase is not yet configured) ─────────────

const NOW = new Date().toISOString();

const PLACEHOLDER_SHOWS: Show[] = [
  {
    id: "p1",
    title: "NYC Collectors Weekend",
    organizer: "East Coast TCG Events",
    description: "The biggest show in the Northeast. 200+ vendors.",
    venue_name: "Jacob Javits Center",
    address: "429 11th Ave, New York, NY 10001",
    lat: 40.7569,
    lng: -74.0021,
    starts_at: "2026-07-12T09:00:00Z",
    ends_at: "2026-07-12T18:00:00Z",
    entry_fee: "$5",
    games: ["pokemon", "mtg", "sports"],
    created_at: NOW,
  },
  {
    id: "p2",
    title: "Brooklyn Pokémon Swap Meet",
    organizer: "BK Collectibles",
    description: null,
    venue_name: "Brooklyn Expo Center",
    address: "72 Noble St, Brooklyn, NY 11222",
    lat: 40.7237,
    lng: -73.9521,
    starts_at: "2026-07-19T10:00:00Z",
    ends_at: "2026-07-19T17:00:00Z",
    entry_fee: null,
    games: ["pokemon"],
    created_at: NOW,
  },
  {
    id: "p3",
    title: "SoCal Sports Card Convention",
    organizer: "Pacific Collectors Guild",
    description: "The West Coast's premier sports card event.",
    venue_name: "LA Convention Center",
    address: "1201 S Figueroa St, Los Angeles, CA 90015",
    lat: 34.0401,
    lng: -118.2697,
    starts_at: "2026-07-25T09:00:00Z",
    ends_at: "2026-07-27T18:00:00Z",
    entry_fee: "$10",
    games: ["sports"],
    created_at: NOW,
  },
  {
    id: "p4",
    title: "Midwest TCG Open",
    organizer: "Chicago Card Co.",
    description: null,
    venue_name: "McCormick Place",
    address: "2301 S Lake Shore Dr, Chicago, IL 60616",
    lat: 41.8503,
    lng: -87.6163,
    starts_at: "2026-08-01T09:00:00Z",
    ends_at: "2026-08-02T18:00:00Z",
    entry_fee: "$8",
    games: ["pokemon", "yugioh", "mtg"],
    created_at: NOW,
  },
  {
    id: "p5",
    title: "Houston Card Expo",
    organizer: "Lone Star Gaming",
    description: "Yu-Gi-Oh regionals + sports card show combined!",
    venue_name: "George R. Brown Convention Center",
    address: "1001 Avenida De Las Americas, Houston, TX 77010",
    lat: 29.7543,
    lng: -95.3677,
    starts_at: "2026-08-08T10:00:00Z",
    ends_at: "2026-08-09T17:00:00Z",
    entry_fee: "Free",
    games: ["yugioh", "sports"],
    created_at: NOW,
  },
  {
    id: "p6",
    title: "New England TCG Showcase",
    organizer: "Northeast Events LLC",
    description: null,
    venue_name: "Boston Convention Center",
    address: "415 Summer St, Boston, MA 02210",
    lat: 42.3478,
    lng: -71.0466,
    starts_at: "2026-07-18T10:00:00Z",
    ends_at: "2026-07-18T16:00:00Z",
    entry_fee: "$3",
    games: ["mtg", "pokemon"],
    created_at: NOW,
  },
  {
    id: "p7",
    title: "Desert Collector Con",
    organizer: "AZ Card Club",
    description: null,
    venue_name: "Phoenix Convention Center",
    address: "100 N 3rd St, Phoenix, AZ 85004",
    lat: 33.4484,
    lng: -112.074,
    starts_at: "2026-08-15T09:00:00Z",
    ends_at: "2026-08-15T18:00:00Z",
    entry_fee: "$5",
    games: ["sports", "pokemon"],
    created_at: NOW,
  },
  {
    id: "p8",
    title: "Pacific Northwest Card Show",
    organizer: "NW Collectibles",
    description: null,
    venue_name: "Washington State Convention Center",
    address: "705 Pike St, Seattle, WA 98101",
    lat: 47.613,
    lng: -122.331,
    starts_at: "2026-07-26T10:00:00Z",
    ends_at: "2026-07-26T17:00:00Z",
    entry_fee: null,
    games: ["mtg"],
    created_at: NOW,
  },
  {
    id: "p9",
    title: "ATL TCG & Sports Card Fair",
    organizer: "Peach State Cards",
    description: null,
    venue_name: "Georgia World Congress Center",
    address: "285 Andrew Young International Blvd NW, Atlanta, GA 30313",
    lat: 33.7587,
    lng: -84.3963,
    starts_at: "2026-08-22T10:00:00Z",
    ends_at: "2026-08-23T18:00:00Z",
    entry_fee: "$7",
    games: ["pokemon", "sports", "yugioh"],
    created_at: NOW,
  },
  {
    id: "p10",
    title: "Bay Area MTG Open",
    organizer: "NorCal Magic",
    description: "Standard, Pioneer, and Modern main events.",
    venue_name: "San Jose Convention Center",
    address: "150 W San Carlos St, San Jose, CA 95113",
    lat: 37.3293,
    lng: -121.8893,
    starts_at: "2026-08-02T09:00:00Z",
    ends_at: "2026-08-03T20:00:00Z",
    entry_fee: "$15",
    games: ["mtg"],
    created_at: NOW,
  },
];

// ─── Queries ──────────────────────────────────────────────────────────────────

function showsInBounds(shows: Show[], bounds: MapBounds): Show[] {
  return shows.filter(
    (s) =>
      s.lat >= bounds.south &&
      s.lat <= bounds.north &&
      s.lng >= bounds.west &&
      s.lng <= bounds.east
  );
}

export async function fetchShowsInBounds(
  bounds: MapBounds,
  keyword?: string
): Promise<Show[]> {
  if (!supabase) {
    // Dev fallback: filter placeholder data
    let data = showsInBounds(PLACEHOLDER_SHOWS, bounds);
    if (keyword) {
      const q = keyword.toLowerCase();
      data = data.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.venue_name.toLowerCase().includes(q) ||
          s.games.some((g) => g.includes(q))
      );
    }
    return data;
  }

  let query = supabase
    .from("shows")
    .select("*")
    .gte("lat", bounds.south)
    .lte("lat", bounds.north)
    .gte("lng", bounds.west)
    .lte("lng", bounds.east)
    .order("starts_at", { ascending: true });

  if (keyword) {
    query = query.or(
      `title.ilike.%${keyword}%,venue_name.ilike.%${keyword}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function fetchRsvpCount(showId: string): Promise<number> {
  if (!supabase) return Math.floor(Math.random() * 40) + 1;

  const { count, error } = await supabase
    .from("rsvps")
    .select("*", { count: "exact", head: true })
    .eq("show_id", showId);

  if (error) return 0;
  return count ?? 0;
}

export async function fetchUserRsvps(userId: string): Promise<string[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("rsvps")
    .select("show_id")
    .eq("user_id", userId)
    .returns<{ show_id: string }[]>();

  if (error) return [];
  return (data ?? []).map((r) => r.show_id);
}

export async function toggleRsvp(
  showId: string,
  userId: string,
  isCurrentlyRsvpd: boolean
): Promise<void> {
  if (!supabase) return;

  if (isCurrentlyRsvpd) {
    await supabase
      .from("rsvps")
      .delete()
      .eq("show_id", showId)
      .eq("user_id", userId);
  } else {
    await supabase.from("rsvps").insert({ show_id: showId, user_id: userId });
  }
}
