/**
 * Supabase Database generic type.
 *
 * Replace this file with the output of:
 *   npx supabase gen types typescript --project-id <your-project-id> --schema public
 * once your Supabase project is connected.
 */
import type { Profile, Show, Rsvp, Follow, ActivityFeedItem } from "./index";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at"> & { created_at?: string };
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      shows: {
        Row: Show;
        Insert: Omit<Show, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<Show, "id" | "created_at">>;
      };
      rsvps: {
        Row: Rsvp;
        Insert: Omit<Rsvp, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: never;
      };
      follows: {
        Row: Follow;
        Insert: Omit<Follow, "created_at"> & { created_at?: string };
        Update: never;
      };
      activity_feed: {
        Row: ActivityFeedItem;
        Insert: Omit<ActivityFeedItem, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Pick<ActivityFeedItem, "body">>;
      };
    };
  };
};
