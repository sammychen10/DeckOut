import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

/**
 * Handles Supabase auth callbacks (email confirmation, OAuth).
 * Exchanges the one-time code for a session and redirects.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      // Check if this user still needs onboarding (empty games_collected)
      const { data: profile } = await supabase
        .from("profiles")
        .select("games_collected")
        .eq("id", data.session.user.id)
        .maybeSingle();

      const needsOnboarding =
        !profile || !profile.games_collected?.length;

      if (needsOnboarding && !next.startsWith("/onboarding")) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth failed — send to login with error hint
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`);
}
