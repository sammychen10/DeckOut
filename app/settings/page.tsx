import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { SettingsForm } from "@/components/profile/SettingsForm";

export const metadata = { title: "Settings — DeckOut" };

export default async function SettingsPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/onboarding");

  return (
    <div className="max-w-xl mx-auto px-4 py-8 pb-24">
      <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
      <p className="text-slate-400 text-sm mb-8">
        Update your collector profile.
      </p>
      <SettingsForm profile={profile} userEmail={user.email ?? ""} />
    </div>
  );
}
