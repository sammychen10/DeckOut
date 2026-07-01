"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

const GAME_OPTIONS = [
  { id: "pokemon",   label: "Pokémon",      emoji: "⚡" },
  { id: "sports",    label: "Sports Cards", emoji: "🏈" },
  { id: "mtg",       label: "Magic: TG",    emoji: "🔮" },
  { id: "yugioh",    label: "Yu-Gi-Oh",     emoji: "🐉" },
  { id: "one_piece", label: "One Piece",    emoji: "⚓" },
  { id: "other",     label: "Other",        emoji: "🃏" },
];

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  games_collected: string[];
}

interface SettingsFormProps {
  profile: Profile;
  userEmail: string;
}

export function SettingsForm({ profile, userEmail }: SettingsFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [games, setGames] = useState<string[]>(profile.games_collected ?? []);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function toggleGame(id: string) {
    setGames((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        games_collected: games,
      })
      .eq("id", profile.id);

    setSaving(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }

    setMessage({ type: "success", text: "Profile updated!" });
    router.refresh();
  }

  async function handleSignOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Email (read-only) */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1.5">
          Email
        </label>
        <p className="text-slate-300 text-sm bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5">
          {userEmail}
        </p>
      </div>

      {/* Username (read-only — shown for reference) */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1.5">
          Username
        </label>
        <p className="text-slate-300 text-sm bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 font-mono">
          @{profile.username}
        </p>
        <p className="text-slate-600 text-xs mt-1">
          Username cannot be changed after onboarding.
        </p>
      </div>

      {/* Display name */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Display name
        </label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your full name or nickname"
          maxLength={60}
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell collectors who you are…"
          maxLength={160}
          rows={3}
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors resize-none"
        />
        <p className="text-slate-600 text-xs mt-1 text-right">{bio.length}/160</p>
      </div>

      {/* Avatar URL */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Avatar URL
        </label>
        <input
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://example.com/your-photo.jpg"
          type="url"
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
        />
      </div>

      {/* Games collected */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2.5">
          What do you collect?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {GAME_OPTIONS.map((g) => {
            const selected = games.includes(g.id);
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => toggleGame(g.id)}
                className={[
                  "flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all text-left",
                  selected
                    ? "bg-brand-500/15 border-brand-500 text-white"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500",
                ].join(" ")}
              >
                <span>{g.emoji}</span>
                <span className="leading-tight">{g.label}</span>
                {selected && <span className="ml-auto text-brand-400 text-xs">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback */}
      {message && (
        <div
          className={[
            "rounded-xl px-4 py-3 text-sm",
            message.type === "success"
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : "bg-red-500/10 border border-red-500/30 text-red-400",
          ].join(" ")}
        >
          {message.text}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-red-400 font-medium rounded-xl border border-slate-700 transition-colors"
        >
          Sign out
        </button>
      </div>
    </form>
  );
}
