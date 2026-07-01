"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

const GAME_OPTIONS = [
  { id: "pokemon",   label: "Pokémon",       emoji: "⚡" },
  { id: "sports",    label: "Sports Cards",  emoji: "🏈" },
  { id: "mtg",       label: "Magic: TG",     emoji: "🔮" },
  { id: "yugioh",    label: "Yu-Gi-Oh",      emoji: "🐉" },
  { id: "one_piece", label: "One Piece",     emoji: "⚓" },
  { id: "other",     label: "Other",         emoji: "🃏" },
];

const USERNAME_RE = /^[a-z0-9_-]{3,20}$/;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState("");
  const [games, setGames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);

  const supabase = createBrowserSupabaseClient();

  // ── Step 1: username validation + availability ─────────────────────────────
  async function handleStep1() {
    const value = username.trim().toLowerCase();

    if (!USERNAME_RE.test(value)) {
      setError("3–20 characters: lowercase letters, numbers, _ or -");
      return;
    }

    setChecking(true);
    setError(null);

    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", value)
      .maybeSingle();

    setChecking(false);

    if (data) {
      setError("That username is already taken — try another.");
      return;
    }

    setUsername(value);
    setStep(2);
  }

  function toggleGame(id: string) {
    setGames((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }

  // ── Step 2: save profile ───────────────────────────────────────────────────
  async function handleFinish() {
    if (games.length === 0) {
      setError("Pick at least one game you collect.");
      return;
    }

    setSaving(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    const { error } = await supabase
      .from("profiles")
      .update({ username, games_collected: games })
      .eq("id", user.id);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    router.push(`/profile/${username}`);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map((n) => (
            <div
              key={n}
              className={[
                "h-1.5 flex-1 rounded-full transition-colors",
                step >= n ? "bg-brand-500" : "bg-slate-800",
              ].join(" ")}
            />
          ))}
        </div>

        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Choose your username
            </h1>
            <p className="text-slate-400 text-sm mb-6">
              This is how other collectors will find you.
            </p>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-mono">
                @
              </span>
              <input
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.toLowerCase());
                  setError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleStep1()}
                placeholder="yourhandle"
                maxLength={20}
                className="w-full pl-8 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-lg font-mono transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            )}

            <p className="text-slate-600 text-xs mt-2">
              Lowercase letters, numbers, _ and - · 3–20 characters
            </p>

            <button
              onClick={handleStep1}
              disabled={checking || username.length < 3}
              className="mt-6 w-full py-3 bg-brand-500 hover:bg-brand-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
            >
              {checking ? "Checking…" : "Continue →"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              What do you collect?
            </h1>
            <p className="text-slate-400 text-sm mb-6">
              Select all that apply — this tailors your feed and map.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {GAME_OPTIONS.map((g) => {
                const selected = games.includes(g.id);
                return (
                  <button
                    key={g.id}
                    onClick={() => toggleGame(g.id)}
                    className={[
                      "flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all",
                      selected
                        ? "bg-brand-500/15 border-brand-500 text-white"
                        : "bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-500",
                    ].join(" ")}
                  >
                    <span className="text-2xl">{g.emoji}</span>
                    <span className="text-sm font-medium leading-tight">
                      {g.label}
                    </span>
                    {selected && (
                      <span className="ml-auto text-brand-400 text-xs font-bold">✓</span>
                    )}
                  </button>
                );
              })}
            </div>

            {error && (
              <p className="text-red-400 text-sm mt-3">{error}</p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setStep(1); setError(null); }}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleFinish}
                disabled={saving || games.length === 0}
                className="flex-1 py-3 bg-brand-500 hover:bg-brand-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
              >
                {saving ? "Saving…" : "Finish setup →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
