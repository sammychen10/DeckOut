import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "DeckOut — Find Card Shows Near You",
  description:
    "Discover nearby TCG and sports card shows, RSVP with friends, and share your pulls.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  let navProfile: { username: string; display_name: string | null; avatar_url: string | null } | null = null;

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("username, display_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();
    navProfile = data ?? null;
  }

  return (
    <html lang="en">
      <body className="min-h-screen">
        <Navbar user={user ? { id: user.id, email: user.email } : null} profile={navProfile} />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
