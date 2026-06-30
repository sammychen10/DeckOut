-- =============================================================================
-- DeckOut — initial schema
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "uuid-ossp";


-- ---------------------------------------------------------------------------
-- profiles
-- Extends auth.users 1-to-1. Row is created via a trigger on sign-up.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id              uuid        primary key references auth.users (id) on delete cascade,
  username        text        unique not null,
  display_name    text,
  avatar_url      text,
  bio             text,
  games_collected text[]      not null default '{}',
  created_at      timestamptz not null default now()
);

comment on table public.profiles is
  'Public collector profile, one row per auth.users record.';

-- Auto-create a bare profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    -- fall back to the email local-part so username is never null
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ---------------------------------------------------------------------------
-- shows
-- ---------------------------------------------------------------------------
create table public.shows (
  id           uuid        primary key default uuid_generate_v4(),
  title        text        not null,
  organizer    text        not null,
  description  text,
  venue_name   text        not null,
  address      text        not null,
  lat          float8      not null,
  lng          float8      not null,
  starts_at    timestamptz not null,
  ends_at      timestamptz not null,
  entry_fee    text,
  games        text[]      not null default '{}',
  created_at   timestamptz not null default now()
);

comment on table public.shows is
  'TCG / sports-card show listings with location and metadata.';

-- Geospatial lookup index
create index idx_shows_lat_lng on public.shows (lat, lng);


-- ---------------------------------------------------------------------------
-- rsvps
-- ---------------------------------------------------------------------------
create table public.rsvps (
  id         uuid        primary key default uuid_generate_v4(),
  user_id    uuid        not null references public.profiles (id) on delete cascade,
  show_id    uuid        not null references public.shows   (id) on delete cascade,
  created_at timestamptz not null default now(),

  constraint rsvps_user_show_unique unique (user_id, show_id)
);

comment on table public.rsvps is
  'Records which users have RSVP''d to which shows.';

create index idx_rsvps_show_id on public.rsvps (show_id);


-- ---------------------------------------------------------------------------
-- follows
-- ---------------------------------------------------------------------------
create table public.follows (
  follower_id  uuid        not null references public.profiles (id) on delete cascade,
  following_id uuid        not null references public.profiles (id) on delete cascade,
  created_at   timestamptz not null default now(),

  primary key (follower_id, following_id),
  -- prevent self-follows at the DB level
  constraint follows_no_self_follow check (follower_id <> following_id)
);

comment on table public.follows is
  'Directed follow graph between collector profiles.';


-- ---------------------------------------------------------------------------
-- activity_feed
-- ---------------------------------------------------------------------------
create table public.activity_feed (
  id         uuid        primary key default uuid_generate_v4(),
  user_id    uuid        not null references public.profiles (id) on delete cascade,
  type       text        not null check (type in ('rsvp', 'checkin', 'post')),
  show_id    uuid        references public.shows (id) on delete set null,
  body       text,
  created_at timestamptz not null default now()
);

comment on table public.activity_feed is
  'Social activity items shown in follower feeds (RSVPs, check-ins, posts).';

create index idx_activity_feed_user_created
  on public.activity_feed (user_id, created_at desc);


-- =============================================================================
-- Row Level Security
-- =============================================================================

alter table public.profiles     enable row level security;
alter table public.shows        enable row level security;
alter table public.rsvps        enable row level security;
alter table public.follows      enable row level security;
alter table public.activity_feed enable row level security;


-- ---------------------------------------------------------------------------
-- profiles RLS
-- ---------------------------------------------------------------------------
-- Anyone can read profiles (public directory)
create policy "profiles: public read"
  on public.profiles for select
  using (true);

-- Only the owner can update their own profile
create policy "profiles: owner update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Insert is handled by the trigger (service role), so no user insert policy


-- ---------------------------------------------------------------------------
-- shows RLS
-- ---------------------------------------------------------------------------
-- Anyone (including anonymous) can browse shows
create policy "shows: public read"
  on public.shows for select
  using (true);

-- Authenticated users can create shows
create policy "shows: authenticated insert"
  on public.shows for insert
  to authenticated
  with check (true);

-- Only the organizer (matched by username) can edit their show.
-- Adjust this predicate once you add an organizer_id FK.
create policy "shows: authenticated update own"
  on public.shows for update
  to authenticated
  using (
    organizer = (select username from public.profiles where id = auth.uid())
  )
  with check (
    organizer = (select username from public.profiles where id = auth.uid())
  );

create policy "shows: authenticated delete own"
  on public.shows for delete
  to authenticated
  using (
    organizer = (select username from public.profiles where id = auth.uid())
  );


-- ---------------------------------------------------------------------------
-- rsvps RLS
-- ---------------------------------------------------------------------------
-- Anyone can see who is attending (powers social proof on show pins)
create policy "rsvps: public read"
  on public.rsvps for select
  using (true);

-- Only the authenticated user can create their own RSVP
create policy "rsvps: owner insert"
  on public.rsvps for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Only the authenticated user can delete their own RSVP
create policy "rsvps: owner delete"
  on public.rsvps for delete
  to authenticated
  using (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- follows RLS
-- ---------------------------------------------------------------------------
-- Anyone can read the follow graph (e.g. follower counts)
create policy "follows: public read"
  on public.follows for select
  using (true);

-- Only the authenticated user can create a follow from themselves
create policy "follows: owner insert"
  on public.follows for insert
  to authenticated
  with check (auth.uid() = follower_id);

-- Only the authenticated user can unfollow
create policy "follows: owner delete"
  on public.follows for delete
  to authenticated
  using (auth.uid() = follower_id);


-- ---------------------------------------------------------------------------
-- activity_feed RLS
-- ---------------------------------------------------------------------------
-- Any authenticated user can read the feed (scoped by the app to followed users)
create policy "activity_feed: authenticated read"
  on public.activity_feed for select
  to authenticated
  using (true);

-- Only the owner can insert their own activity
create policy "activity_feed: owner insert"
  on public.activity_feed for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Only the owner can delete their own activity
create policy "activity_feed: owner delete"
  on public.activity_feed for delete
  to authenticated
  using (auth.uid() = user_id);
