-- =============================================================================
-- DeckOut — seed data: card shows across NYC, Chicago, and Los Angeles
-- Run after 20240001_init.sql and 20240002_reactions.sql
-- =============================================================================

INSERT INTO public.shows
  (title, organizer, description, venue_name, address, lat, lng,
   starts_at, ends_at, entry_fee, games)
VALUES

-- ─── NEW YORK CITY AREA (11 shows) ──────────────────────────────────────────

(
  'NYC Sports Card & TCG Expo',
  'East Coast Hobby Events',
  'The tristate area''s biggest multi-game show. 200+ vendor tables, grading on-site, pack breaks every hour.',
  'Jacob K. Javits Convention Center',
  '429 11th Ave, New York, NY 10001',
  40.7569, -74.0021,
  '2026-07-12 14:00:00+00', '2026-07-13 21:00:00+00',
  '$5',
  ARRAY['sports','pokemon','mtg','yugioh']
),

(
  'Brooklyn Pokémon Swap Meet',
  'BK Collectibles',
  'Casual swap meet for Pokémon collectors. All sets welcome. Free binder trades encouraged.',
  'Brooklyn Expo Center',
  '72 Noble St, Brooklyn, NY 11222',
  40.7237, -73.9521,
  '2026-07-19 15:00:00+00', '2026-07-19 21:00:00+00',
  'Free',
  ARRAY['pokemon']
),

(
  'Queens TCG Weekend',
  'Queens Card Club',
  'Two-day event with open trading, side events, and vendor hall. Pokémon VGC and Yu-Gi-Oh locals on Sunday.',
  'Resorts World NYC Event Space',
  '110-00 Rockaway Blvd, Jamaica, NY 11420',
  40.6721, -73.8337,
  '2026-07-25 14:00:00+00', '2026-07-26 20:00:00+00',
  '$3',
  ARRAY['pokemon','yugioh','one_piece']
),

(
  'Manhattan MTG Open',
  'Chelsea Card Co.',
  'Competitive Magic weekend — Standard, Pioneer, and Commander events. Judge-certified. 1K prize pool.',
  'The Altman Building',
  '135 W 18th St, New York, NY 10011',
  40.7400, -74.0004,
  '2026-08-01 14:00:00+00', '2026-08-02 00:00:00+00',
  '$10',
  ARRAY['mtg']
),

(
  'Bronx Card Collectors Fair',
  'Grand Concourse Hobbies',
  'Monthly local show with 30+ tables. Great for vintage finds and cheap binder pickups.',
  'Bronx Terminal Market Events Hall',
  '610 Exterior St, Bronx, NY 10451',
  40.8198, -73.9280,
  '2026-07-05 14:00:00+00', '2026-07-05 20:00:00+00',
  'Free',
  ARRAY['sports','other']
),

(
  'NYC Yu-Gi-Oh! Regional Qualifier',
  'Konami Official Events',
  'Official Konami regional qualifier. Master Duel and OCG side events. Top 8 earns invite to nationals.',
  'New York Hilton Midtown',
  '1335 6th Ave, New York, NY 10019',
  40.7620, -73.9776,
  '2026-08-08 13:00:00+00', '2026-08-09 23:00:00+00',
  '$10',
  ARRAY['yugioh']
),

(
  'Staten Island Sports Card Swap',
  'SI Collectors Group',
  'Come trade vintage baseball, basketball, and football cards. Mostly raw, some graded slabs.',
  'Staten Island Mall Community Room',
  '2655 Richmond Ave, Staten Island, NY 10314',
  40.5837, -74.1696,
  '2026-07-20 14:00:00+00', '2026-07-20 19:00:00+00',
  'Free',
  ARRAY['sports']
),

(
  'Long Island TCG Invitational',
  'Nassau Hobby Events',
  'Multi-game vendor show plus competitive invitational brackets for Pokémon and MTG. Free parking.',
  'Nassau Veterans Memorial Coliseum',
  '1255 Hempstead Tpke, Uniondale, NY 11553',
  40.7224, -73.5900,
  '2026-07-25 13:00:00+00', '2026-07-26 21:00:00+00',
  '$7',
  ARRAY['pokemon','mtg','yugioh']
),

(
  'New Jersey Collectors Showcase',
  'Garden State Card Events',
  'Packed vendor hall with 150+ tables. Strong sports card section — vintage to modern rookies.',
  'Meadowlands Exposition Center',
  '355 Plaza Dr, Secaucus, NJ 07094',
  40.7838, -74.0697,
  '2026-08-15 14:00:00+00', '2026-08-16 21:00:00+00',
  '$5',
  ARRAY['sports','pokemon','other']
),

(
  'One Piece Card Game NYC Premiere',
  'Bandai Official Events',
  'Official Bandai OP premiere event. Pre-release drafts, prize wall, cosplay welcome.',
  'Brooklyn Expo Center',
  '72 Noble St, Brooklyn, NY 11222',
  40.7237, -73.9521,
  '2026-08-22 15:00:00+00', '2026-08-22 22:00:00+00',
  'Free',
  ARRAY['one_piece']
),

(
  'Flushing TCG & Sports Show',
  'Queens Hobby Collective',
  'Neighborhood hobby show with a focus on Asian-market cards — One Piece, Pokémon Japanese sets, and sports.',
  'Sheraton LaGuardia East Hotel',
  '135-20 39th Ave, Flushing, NY 11354',
  40.7581, -73.8290,
  '2026-08-29 14:00:00+00', '2026-08-29 20:00:00+00',
  '$3',
  ARRAY['sports','pokemon','one_piece']
),

-- ─── CHICAGO AREA (4 shows) ──────────────────────────────────────────────────

(
  'Midwest TCG Open',
  'Chicago Card Co.',
  'The Midwest''s premiere multi-game event. Dealer room opens at 9 AM; tournaments run all weekend.',
  'McCormick Place West Building',
  '2301 S Martin Luther King Dr, Chicago, IL 60616',
  41.8503, -87.6163,
  '2026-08-01 14:00:00+00', '2026-08-02 23:00:00+00',
  '$8',
  ARRAY['pokemon','yugioh','mtg']
),

(
  'Chicago Sports Card Convention',
  'Windy City Collectibles',
  'Dedicated sports card show — 100+ tables of vintage and modern wax, singles, and graded slabs.',
  'United Center Concourse Hall',
  '1901 W Madison St, Chicago, IL 60612',
  41.8806, -87.6742,
  '2026-07-18 15:00:00+00', '2026-07-19 21:00:00+00',
  '$5',
  ARRAY['sports']
),

(
  'Rosemont Card Expo',
  'Midwest Expo Events',
  'Two-day suburban show near O''Hare. Great for families — Pokémon pulls, cheap binders, and food trucks outside.',
  'Donald E. Stephens Convention Center',
  '5555 N River Rd, Rosemont, IL 60018',
  41.9927, -87.8707,
  '2026-08-15 14:00:00+00', '2026-08-16 22:00:00+00',
  '$7',
  ARRAY['pokemon','sports','other']
),

(
  'Chicago Anime & TCG Card Fest',
  'Lake Shore Gaming Events',
  'Anime-adjacent card show — One Piece, Dragon Ball Super, and Yu-Gi-Oh. Cosplay contest at 4 PM.',
  'Sheraton Grand Chicago Riverwalk',
  '301 E North Water St, Chicago, IL 60611',
  41.8883, -87.6207,
  '2026-07-26 16:00:00+00', '2026-07-27 00:00:00+00',
  '$3',
  ARRAY['one_piece','yugioh','mtg']
),

-- ─── LOS ANGELES AREA (4 shows) ──────────────────────────────────────────────

(
  'SoCal Sports Card Convention',
  'Pacific Collectors Guild',
  'West Coast''s largest dedicated sports card show. Vintage packs, PSA/BGS submissions on-site, autograph signers.',
  'Los Angeles Convention Center',
  '1201 S Figueroa St, Los Angeles, CA 90015',
  34.0401, -118.2697,
  '2026-08-08 17:00:00+00', '2026-08-09 01:00:00+00',
  '$10',
  ARRAY['sports']
),

(
  'Pasadena TCG Collectors Expo',
  'Rose City Card Events',
  'Pokémon and MTG focus. Draft pods running all day, graded singles showcase, and a kids'' free-trade corner.',
  'Pasadena Convention Center',
  '300 E Green St, Pasadena, CA 91101',
  34.1468, -118.1527,
  '2026-07-19 18:00:00+00', '2026-07-20 01:00:00+00',
  '$5',
  ARRAY['pokemon','mtg']
),

(
  'Long Beach Card & Collectibles Show',
  'Harbor Hobby Events',
  'Relaxed swap-meet-style show. Mix of sports cards, TCG, and vintage board game rarities.',
  'Long Beach Convention Center',
  '300 E Ocean Blvd, Long Beach, CA 90802',
  33.7676, -118.1897,
  '2026-08-22 17:00:00+00', '2026-08-23 22:00:00+00',
  'Free',
  ARRAY['sports','other']
),

(
  'Burbank Anime Card Fair',
  'SoCal TCG Events',
  'Anime card paradise — One Piece English and Japanese sets, Yu-Gi-Oh, and Dragon Ball Super. Artists'' alley adjacent.',
  'Burbank Marriott Convention Center',
  '2500 N Hollywood Way, Burbank, CA 91505',
  34.1813, -118.3090,
  '2026-08-01 18:00:00+00', '2026-08-02 01:00:00+00',
  '$5',
  ARRAY['one_piece','yugioh','pokemon']
);
