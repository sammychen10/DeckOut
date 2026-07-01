"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

interface LikeButtonProps {
  activityId: string;
  initialCount: number;
  initialLiked: boolean;
  currentUserId: string;
}

export function LikeButton({
  activityId,
  initialCount,
  initialLiked,
  currentUserId,
}: LikeButtonProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, startTransition] = useTransition();

  async function toggle() {
    if (!currentUserId) {
      router.push("/auth/login");
      return;
    }

    const next = !liked;
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));

    const supabase = createBrowserSupabaseClient();

    if (next) {
      await supabase.from("activity_feed_reactions").insert({
        activity_id: activityId,
        user_id: currentUserId,
        emoji: "❤️",
      });
    } else {
      await supabase
        .from("activity_feed_reactions")
        .delete()
        .eq("activity_id", activityId)
        .eq("user_id", currentUserId);
    }

    startTransition(() => {/* trigger re-render flush */});
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      aria-label={liked ? "Unlike" : "Like"}
      className={[
        "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all active:scale-90",
        liked
          ? "text-red-400 bg-red-500/10 hover:bg-red-500/20"
          : "text-slate-500 hover:text-slate-300 hover:bg-slate-700/50",
      ].join(" ")}
    >
      <span className="text-sm leading-none">{liked ? "❤️" : "🤍"}</span>
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
