"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

interface FollowButtonProps {
  targetUserId: string;
  isFollowing: boolean;
  followerCount: number;
}

export function FollowButton({
  targetUserId,
  isFollowing: initialFollowing,
  followerCount: initialCount,
}: FollowButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [following, setFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(initialCount);

  async function toggle() {
    const supabase = createBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Optimistic update
    const next = !following;
    setFollowing(next);
    setCount((c) => c + (next ? 1 : -1));

    if (next) {
      await supabase
        .from("follows")
        .insert({ follower_id: user.id, following_id: targetUserId });
    } else {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId);
    }

    startTransition(() => router.refresh());
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-slate-400 text-sm">
        <span className="font-semibold text-white">{count}</span> followers
      </span>
      <button
        onClick={toggle}
        disabled={isPending}
        className={[
          "px-4 py-2 rounded-xl text-sm font-semibold border transition-all active:scale-95",
          following
            ? "bg-slate-800 border-slate-600 text-slate-300 hover:border-red-500/50 hover:text-red-400"
            : "bg-brand-500 border-brand-400 text-white hover:bg-brand-400",
        ].join(" ")}
      >
        {following ? "Following" : "Follow"}
      </button>
    </div>
  );
}
