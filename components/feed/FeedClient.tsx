"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { FeedItem } from "./FeedItem";

// ── Shared type used by page.tsx and FeedItem ──────────────────────────────
export interface FeedItemData {
  id: string;
  type: string;
  body: string | null;
  image_url: string | null;
  created_at: string;
  user_id: string;
  show_id: string | null;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  shows: {
    id: string;
    title: string;
    venue_name: string;
    starts_at: string;
  } | null;
  reaction_count: number;
  user_has_reacted: boolean;
}

interface FeedClientProps {
  currentUserId: string;
  followedIds: string[];
  initialFeed: FeedItemData[];
}

export function FeedClient({
  currentUserId,
  followedIds,
  initialFeed,
}: FeedClientProps) {
  const [feed, setFeed] = useState<FeedItemData[]>(initialFeed);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const followedSet = useRef(new Set(followedIds));

  // Keep followedSet in sync if parent re-renders with new data
  useEffect(() => {
    followedSet.current = new Set(followedIds);
  }, [followedIds]);

  // ── Supabase Realtime subscription ──────────────────────────────────────
  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    const channel = supabase
      .channel("public:activity_feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_feed" },
        async (payload) => {
          const row = payload.new as { id: string; user_id: string };

          // Only show items from followed users
          if (!followedSet.current.has(row.user_id)) return;

          // Avoid duplicates (e.g. the current user also follows someone)
          setFeed((prev) => {
            if (prev.some((f) => f.id === row.id)) return prev;
            return prev; // placeholder until fetch resolves
          });

          // Fetch the full item with joins
          const { data } = await supabase
            .from("activity_feed")
            .select(
              `id, type, body, image_url, created_at, user_id, show_id,
               profiles ( username, display_name, avatar_url ),
               shows ( id, title, venue_name, starts_at )`
            )
            .eq("id", row.id)
            .maybeSingle();

          if (!data) return;

          const enriched: FeedItemData = {
            ...(data as unknown as FeedItemData),
            reaction_count: 0,
            user_has_reacted: false,
          };

          setFeed((prev) => {
            if (prev.some((f) => f.id === enriched.id)) return prev;
            return [enriched, ...prev];
          });

          // Mark as "new" for the slide-in animation; remove after 5s
          setNewIds((s) => new Set(s).add(enriched.id));
          setTimeout(
            () =>
              setNewIds((s) => {
                const next = new Set(s);
                next.delete(enriched.id);
                return next;
              }),
            5000
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Empty state: follows nobody ─────────────────────────────────────────
  if (followedIds.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <span className="text-5xl block mb-4">🤝</span>
        <h2 className="text-xl font-bold text-white mb-2">
          Your feed is empty
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Follow collectors to see their RSVPs, check-ins, and pulls here.
        </p>
        <Link
          href="/map"
          className="inline-block px-5 py-2.5 bg-brand-500 hover:bg-brand-400 text-white font-semibold rounded-xl transition-colors"
        >
          Find people on the map →
        </Link>
      </div>
    );
  }

  // ── Empty state: following people but no activity yet ───────────────────
  if (feed.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <span className="text-5xl block mb-4">📭</span>
        <h2 className="text-xl font-bold text-white mb-2">
          Nothing yet
        </h2>
        <p className="text-slate-400 text-sm">
          The people you follow haven&apos;t posted anything yet. Check back soon!
        </p>
      </div>
    );
  }

  // ── Feed ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-white">Following</h1>
        <Link
          href="/map"
          className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors"
        >
          Find shows →
        </Link>
      </div>

      <div className="space-y-3">
        {feed.map((item) => (
          <FeedItem
            key={item.id}
            item={item}
            currentUserId={currentUserId}
            isNew={newIds.has(item.id)}
          />
        ))}
      </div>
    </div>
  );
}
