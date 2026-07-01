"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

interface NavUser {
  id: string;
  email?: string;
}

interface NavProfile {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface NavbarProps {
  user: NavUser | null;
  profile: NavProfile | null;
}

const navLinks = [
  { href: "/", label: "Feed" },
  { href: "/map", label: "Map" },
];

export function Navbar({ user, profile }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Hide nav chrome on auth + onboarding pages
  const bare = ["/auth/", "/onboarding"].some((p) => pathname.startsWith(p));
  if (bare) return null;

  const initials = (profile?.display_name ?? profile?.username ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleSignOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🃏</span>
            <span className="font-bold text-xl text-white tracking-tight">
              Deck<span className="text-brand-400">Out</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-600 text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-800",
                  ].join(" ")}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right side — auth */}
          {user && profile ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-slate-800 transition-colors"
              >
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.username}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white">
                    {initials}
                  </div>
                )}
                <span className="hidden sm:block text-sm text-slate-300 font-medium">
                  @{profile.username}
                </span>
                <svg
                  className="w-3 h-3 text-slate-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden">
                    <Link
                      href={`/profile/${profile.username}`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <span>👤</span> My Profile
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <span>⚙️</span> Settings
                    </Link>
                    <div className="border-t border-slate-800" />
                    <button
                      onClick={() => { setMenuOpen(false); handleSignOut(); }}
                      className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-red-400 hover:bg-slate-800 transition-colors"
                    >
                      <span>🚪</span> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-400 text-white text-sm font-semibold transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile bottom tab bar */}
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex z-50">
          {navLinks.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "flex-1 py-3 text-center text-xs font-medium transition-colors",
                  active ? "text-brand-400" : "text-slate-500",
                ].join(" ")}
              >
                {label}
              </Link>
            );
          })}
          {user && profile ? (
            <Link
              href={`/profile/${profile.username}`}
              className={[
                "flex-1 py-3 text-center text-xs font-medium transition-colors",
                pathname.startsWith("/profile") ? "text-brand-400" : "text-slate-500",
              ].join(" ")}
            >
              Profile
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="flex-1 py-3 text-center text-xs font-medium text-slate-500"
            >
              Sign In
            </Link>
          )}
        </nav>
      </header>
    </>
  );
}
