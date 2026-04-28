-- Sports engine schema (Postgres / Supabase)
-- Run via Supabase SQL editor or CLI.

CREATE TABLE IF NOT EXISTS sports (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS fixtures (
  id BIGSERIAL PRIMARY KEY,
  sport_id INTEGER NOT NULL REFERENCES sports (id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (sport_id, external_id)
);

CREATE TABLE IF NOT EXISTS fixture_stats (
  id BIGSERIAL PRIMARY KEY,
  fixture_id BIGINT NOT NULL REFERENCES fixtures (id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  feature_value DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS predictions (
  id BIGSERIAL PRIMARY KEY,
  fixture_id BIGINT NOT NULL REFERENCES fixtures (id) ON DELETE CASCADE,
  model_version TEXT NOT NULL,
  probability DOUBLE PRECISION NOT NULL,
  confidence TEXT NOT NULL,
  decision_category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS outcomes (
  id BIGSERIAL PRIMARY KEY,
  fixture_id BIGINT NOT NULL REFERENCES fixtures (id) ON DELETE CASCADE,
  result_label TEXT NOT NULL,
  resolved_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO sports (slug, name)
VALUES
  ('football', 'Football'),
  ('cricket', 'Cricket')
ON CONFLICT (slug) DO NOTHING;
