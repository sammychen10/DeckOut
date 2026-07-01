import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Supabase browser client.
 * Null when env vars are not yet configured (development without a project).
 *
 * Once you have a Supabase project, replace this file with the output of:
 *   npx supabase gen types typescript --project-id <id> --schema public
 * and restore the `createClient<Database>()` generic for full type safety.
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
