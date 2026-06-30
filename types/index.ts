export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  games_collected: string[];
  created_at: string;
}

export interface Show {
  id: string;
  title: string;
  organizer: string;
  description: string | null;
  venue_name: string;
  address: string;
  lat: number;
  lng: number;
  starts_at: string;
  ends_at: string;
  entry_fee: string | null;
  games: string[];
  created_at: string;
}

export interface Rsvp {
  id: string;
  user_id: string;
  show_id: string;
  created_at: string;
}

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export type ActivityType = "rsvp" | "checkin" | "post";

export interface ActivityFeedItem {
  id: string;
  user_id: string;
  type: ActivityType;
  show_id: string | null;
  body: string | null;
  created_at: string;
}

/** Joined shape used in the social feed UI */
export interface ActivityFeedItemWithRelations extends ActivityFeedItem {
  profile: Profile;
  show?: Show;
}
