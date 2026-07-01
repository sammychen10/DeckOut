import Link from "next/link";
import { LikeButton } from "./LikeButton";
import { relativeTime, formatShowDate } from "@/lib/utils";
import type { FeedItemData } from "./FeedClient";

interface FeedItemProps {
  item: FeedItemData;
  currentUserId: string;
  isNew?: boolean;
}

export function FeedItem({ item, currentUserId, isNew }: FeedItemProps) {
  const profile = item.profiles;
  const show = item.shows;

  const displayName = profile?.display_name ?? profile?.username ?? "Someone";
  const username = profile?.username ?? "unknown";

  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const actionLine = {
    rsvp: (
      <>
        <span className="font-semibold text-white">{displayName}</span>{" "}
        <span className="text-slate-400">is going to</span>{" "}
        {show ? (
          <Link
            href={`/map`}
            className="font-semibold text-brand-400 hover:text-brand-300 transition-colors"
          >
            {show.title}
          </Link>
        ) : (
          <span className="font-semibold text-brand-400">a show</span>
        )}
        {show && (
          <span className="text-slate-500">
            {" "}on {formatShowDate(show.starts_at)}
          </span>
        )}
      </>
    ),
    checkin: (
      <>
        <span className="font-semibold text-white">{displayName}</span>{" "}
        <span className="text-slate-400">checked in at</span>{" "}
        {show ? (
          <Link
            href={`/map`}
            className="font-semibold text-brand-400 hover:text-brand-300 transition-colors"
          >
            {show.title}
          </Link>
        ) : (
          <span className="font-semibold text-brand-400">a show</span>
        )}
      </>
    ),
    post: (
      <>
        <span className="font-semibold text-white">{displayName}</span>{" "}
        <span className="text-slate-400">posted from</span>{" "}
        {show ? (
          <Link
            href={`/map`}
            className="font-semibold text-brand-400 hover:text-brand-300 transition-colors"
          >
            {show.title}
          </Link>
        ) : (
          <span className="font-semibold text-slate-300">a show</span>
        )}
      </>
    ),
  }[item.type] ?? (
    <span className="font-semibold text-white">{displayName}</span>
  );

  return (
    <article
      className={[
        "bg-slate-800/60 border border-slate-700/50 rounded-xl p-4",
        "hover:border-slate-600 transition-colors",
        isNew ? "animate-feed-in border-brand-700/40 bg-brand-900/10" : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Link href={`/profile/${username}`} className="flex-shrink-0">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={username}
              className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-700 hover:ring-brand-500 transition-all"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white hover:bg-brand-500 transition-colors">
              {initials}
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          {/* Header: action + timestamp */}
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm leading-snug">
              {actionLine}
            </p>
            <time
              dateTime={item.created_at}
              className="text-xs text-slate-600 flex-shrink-0 mt-0.5"
              title={new Date(item.created_at).toLocaleString()}
            >
              {relativeTime(item.created_at)}
            </time>
          </div>

          {/* Show card preview — rsvp type */}
          {item.type === "rsvp" && show && (
            <div className="mt-2.5 rounded-xl border border-slate-700/60 bg-slate-900/60 px-3.5 py-2.5 text-sm">
              <p className="font-semibold text-white truncate">{show.title}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                <span>📍 {show.venue_name}</span>
                <span>🗓 {formatShowDate(show.starts_at)}</span>
              </div>
            </div>
          )}

          {/* Body text — post / checkin */}
          {item.body && (
            <p className="mt-2.5 text-sm text-slate-200 bg-slate-700/40 rounded-xl px-3.5 py-2.5 leading-relaxed">
              {item.body}
            </p>
          )}

          {/* Optional image */}
          {item.image_url && (
            <img
              src={item.image_url}
              alt="Post image"
              className="mt-2.5 w-full max-h-72 object-cover rounded-xl border border-slate-700/50"
            />
          )}

          {/* Footer: username + like */}
          <div className="flex items-center justify-between mt-3">
            <Link
              href={`/profile/${username}`}
              className="text-xs text-slate-600 hover:text-slate-400 font-mono transition-colors"
            >
              @{username}
            </Link>
            <LikeButton
              activityId={item.id}
              initialCount={item.reaction_count}
              initialLiked={item.user_has_reacted}
              currentUserId={currentUserId}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
