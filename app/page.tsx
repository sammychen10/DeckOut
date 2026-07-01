import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { FeedClient } from "@/components/feed/FeedClient";
import type { FeedItemData } from "@/components/feed/FeedClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Unauthenticated landing ──────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 text-center">
        <span className="text-6xl mb-6">🃏</span>
        <h1 className="text-4xl font-bold text-white mb-3">
          Find card shows near you
        </h1>
        <p className="text-slate-400 max-w-sm mb-8 text-lg">
          Discover nearby TCG and sports card shows, RSVP with friends, and
          share your pulls.
        </p>
        <div className="flex gap-3">
          <Link
            href="/auth/signup"
            className="px-6 py-3 bg-brand-500 hover:bg-brand-400 text-white font-semibold rounded-xl transition-colors"
          >
            Get started
          </Link>
          <Link
            href="/map"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl border border-slate-700 transition-colors"
          >
            Browse map
          </Link>
        </div>
      </div>
    );
  }

  // ── Who does this user follow? ────────────────────────────────────────────
  const { data: follows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id);

  const followedIds = (follows ?? []).map(
    (f: { following_id: string }) => f.following_id
  );

  // ── Initial feed items ────────────────────────────────────────────────────
  let initialFeed: FeedItemData[] = [];

  if (followedIds.length > 0) {
    const { data: feedData } = await supabase
      .from("activity_feed")
      .select(
        `id, type, body, image_url, created_at, user_id, show_id,
         profiles ( username, display_name, avatar_url ),
         shows ( id, title, venue_name, starts_at )`
      )
      .in("user_id", followedIds)
      .order("created_at", { ascending: false })
      .limit(30);

    if (feedData && feedData.length > 0) {
      const feedIds = feedData.map((f: { id: string }) => f.id);

      const { data: reactions } = await supabase
        .from("activity_feed_reactions")
        .select("activity_id, user_id")
        .in("activity_id", feedIds);

      const reactionRows = (reactions ?? []) as {
        activity_id: string;
        user_id: string;
      }[];

      initialFeed = (feedData ?? []).map((item) => {
        const raw = item as unknown as FeedItemData;
        return {
          ...raw,
          reaction_count: reactionRows.filter(
            (r) => r.activity_id === raw.id
          ).length,
          user_has_reacted: reactionRows.some(
            (r) => r.activity_id === raw.id && r.user_id === user.id
          ),
        };
      });
    }
  }

  return (
    <FeedClient
      currentUserId={user.id}
      followedIds={followedIds}
      initialFeed={initialFeed}
    />
  );
}
