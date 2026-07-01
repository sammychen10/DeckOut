-- ── Add image_url to activity_feed ──────────────────────────────────────────
ALTER TABLE public.activity_feed
  ADD COLUMN IF NOT EXISTS image_url text;

-- ── activity_feed_reactions ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_feed_reactions (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid        NOT NULL REFERENCES public.activity_feed(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES public.profiles(id)      ON DELETE CASCADE,
  emoji       text        NOT NULL DEFAULT '❤️',
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (activity_id, user_id)
);

ALTER TABLE public.activity_feed_reactions ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all reactions
CREATE POLICY "Reactions are readable by all authenticated users"
  ON public.activity_feed_reactions
  FOR SELECT TO authenticated
  USING (true);

-- Users can insert their own reactions only
CREATE POLICY "Users can add reactions"
  ON public.activity_feed_reactions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reactions only
CREATE POLICY "Users can remove their own reactions"
  ON public.activity_feed_reactions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_afr_activity_id ON public.activity_feed_reactions (activity_id);
CREATE INDEX IF NOT EXISTS idx_afr_user_id     ON public.activity_feed_reactions (user_id);

-- ── Enable Realtime for activity_feed ────────────────────────────────────────
-- Run in the Supabase dashboard SQL editor or enable via
-- Database → Replication → supabase_realtime publication → add activity_feed
-- Alternatively, uncomment the lines below:
--
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_feed;
