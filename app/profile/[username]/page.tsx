import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { FollowButton } from "@/components/profile/FollowButton";
import { formatShowDate } from "@/lib/utils";

const GAME_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  pokemon:   { label: "Pokémon",      bg: "#fbbf24", text: "#78350f" },
  sports:    { label: "Sports",       bg: "#3b82f6", text: "#ffffff" },
  mtg:       { label: "MTG",          bg: "#a855f7", text: "#ffffff" },
  yugioh:    { label: "Yu-Gi-Oh",     bg: "#ef4444", text: "#ffffff" },
  one_piece: { label: "One Piece",    bg: "#f97316", text: "#ffffff" },
  other:     { label: "Other",        bg: "#64748b", text: "#ffffff" },
};

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}) {
  return { title: `@${params.username} — DeckOut` };
}

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const supabase = createServerSupabaseClient();

  // ── Current user ─────────────────────────────────────────────────────────
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  // ── Profile ───────────────────────────────────────────────────────────────
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", params.username)
    .maybeSingle();

  if (profileError || !profile) notFound();

  const isOwn = currentUser?.id === profile.id;

  // ── Counts + follow state (parallel) ─────────────────────────────────────
  const [followerRes, followingRes, isFollowingRes] = await Promise.all([
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", profile.id),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", profile.id),
    currentUser && !isOwn
      ? supabase
          .from("follows")
          .select("follower_id")
          .eq("follower_id", currentUser.id)
          .eq("following_id", profile.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const followerCount = followerRes.count ?? 0;
  const followingCount = followingRes.count ?? 0;
  const isFollowing = !!isFollowingRes.data;

  // ── Upcoming RSVPs ────────────────────────────────────────────────────────
  const { data: rsvpRows } = await supabase
    .from("rsvps")
    .select("show_id")
    .eq("user_id", profile.id);

  const showIds = (rsvpRows ?? []).map((r: { show_id: string }) => r.show_id);
  let upcomingShows: Array<{
    id: string; title: string; venue_name: string;
    starts_at: string; games: string[];
  }> = [];

  if (showIds.length > 0) {
    const { data: shows } = await supabase
      .from("shows")
      .select("id, title, venue_name, starts_at, games")
      .in("id", showIds)
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(5);
    upcomingShows = (shows ?? []) as typeof upcomingShows;
  }

  // ── Recent activity ───────────────────────────────────────────────────────
  const { data: activity } = await supabase
    .from("activity_feed")
    .select("id, type, body, created_at, shows(title)")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(8);

  const initials = (profile.display_name ?? profile.username)
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-5 mb-6">
        {/* Avatar */}
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.username}
            className="w-20 h-20 rounded-full object-cover ring-2 ring-slate-700 flex-shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-brand-600 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
            {initials}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-white">
              {profile.display_name ?? profile.username}
            </h1>
            {isOwn && (
              <Link
                href="/settings"
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
              >
                Edit profile
              </Link>
            )}
          </div>
          <p className="text-slate-400 text-sm">@{profile.username}</p>
          {profile.bio && (
            <p className="text-slate-300 text-sm mt-2 leading-relaxed">
              {profile.bio}
            </p>
          )}

          {/* Stats + follow */}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <span className="text-slate-400 text-sm">
              <span className="font-semibold text-white">{followingCount}</span>{" "}
              following
            </span>

            {isOwn ? (
              <span className="text-slate-400 text-sm">
                <span className="font-semibold text-white">{followerCount}</span>{" "}
                followers
              </span>
            ) : (
              <FollowButton
                targetUserId={profile.id}
                isFollowing={isFollowing}
                followerCount={followerCount}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Games collected ───────────────────────────────────────────────── */}
      {profile.games_collected?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
            Collecting
          </h2>
          <div className="flex flex-wrap gap-2">
            {(profile.games_collected as string[]).map((g) => {
              const info = GAME_LABELS[g] ?? { label: g, bg: "#64748b", text: "#fff" };
              return (
                <span
                  key={g}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: info.bg, color: info.text }}
                >
                  {info.label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Upcoming RSVPs ────────────────────────────────────────────────── */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Upcoming shows
        </h2>
        {upcomingShows.length === 0 ? (
          <p className="text-slate-600 text-sm">No upcoming shows yet.</p>
        ) : (
          <div className="space-y-2">
            {upcomingShows.map((show) => (
              <div
                key={show.id}
                className="flex items-center justify-between bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {show.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    📍 {show.venue_name}
                  </p>
                </div>
                <span className="text-xs text-slate-500 flex-shrink-0 ml-3">
                  {formatShowDate(show.starts_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Recent activity ───────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Recent activity
        </h2>
        {!activity || activity.length === 0 ? (
          <p className="text-slate-600 text-sm">No recent activity.</p>
        ) : (
          <div className="space-y-2">
            {(activity as Array<{
              id: string;
              type: string;
              body: string | null;
              created_at: string;
              shows: { title: string }[] | null;
            }>).map((item) => {
              const showTitle = Array.isArray(item.shows)
                ? item.shows[0]?.title
                : null;
              return (
                <div
                  key={item.id}
                  className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-300"
                >
                  {item.type === "rsvp" && (
                    <span>
                      RSVP&apos;d to{" "}
                      <span className="text-white font-medium">
                        {showTitle ?? "a show"}
                      </span>
                    </span>
                  )}
                  {item.type === "post" && <span>{item.body}</span>}
                  {item.type === "checkin" && (
                    <span>
                      Checked in at{" "}
                      <span className="text-white font-medium">
                        {showTitle ?? "a show"}
                      </span>
                    </span>
                  )}
                  <span className="block text-slate-600 text-xs mt-0.5">
                    {new Date(item.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
