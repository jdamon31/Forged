-- Forged database schema
-- Run this in the Supabase SQL editor after creating your project.

-- Feature requests
CREATE TABLE IF NOT EXISTS feature_requests (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title                TEXT        NOT NULL,
  description          TEXT,
  status               TEXT        NOT NULL DEFAULT 'pending'
                                   CHECK (status IN ('pending', 'building', 'shipped', 'rejected')),
  vote_count           INT         NOT NULL DEFAULT 0,
  submitter_fingerprint TEXT,
  github_pr_url        TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Votes (unique per request + fingerprint prevents duplicate voting)
CREATE TABLE IF NOT EXISTS votes (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id        UUID        NOT NULL REFERENCES feature_requests(id) ON DELETE CASCADE,
  voter_fingerprint TEXT        NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (request_id, voter_fingerprint)
);

-- Bug reports
CREATE TABLE IF NOT EXISTS bug_reports (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title                TEXT        NOT NULL,
  description          TEXT,
  steps_to_reproduce   TEXT,
  status               TEXT        NOT NULL DEFAULT 'open'
                                   CHECK (status IN ('open', 'in-progress', 'fixed')),
  github_issue_url     TEXT,
  github_pr_url        TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Changelog
CREATE TABLE IF NOT EXISTS changelog_entries (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title                TEXT        NOT NULL,
  description          TEXT,
  feature_request_id   UUID        REFERENCES feature_requests(id) ON DELETE SET NULL,
  bug_report_id        UUID        REFERENCES bug_reports(id) ON DELETE SET NULL,
  github_pr_url        TEXT,
  deployed_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Atomic vote count sync — called after inserting a vote
CREATE OR REPLACE FUNCTION sync_vote_count(p_request_id UUID)
RETURNS INT AS $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM votes WHERE request_id = p_request_id;
  UPDATE feature_requests SET vote_count = v_count WHERE id = p_request_id;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security
ALTER TABLE feature_requests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_reports        ENABLE ROW LEVEL SECURITY;
ALTER TABLE changelog_entries  ENABLE ROW LEVEL SECURITY;

-- Public read on feature_requests and changelog
CREATE POLICY "public_read_requests"   ON feature_requests  FOR SELECT USING (true);
CREATE POLICY "public_read_changelog"  ON changelog_entries FOR SELECT USING (true);
CREATE POLICY "public_read_votes"      ON votes             FOR SELECT USING (true);

-- All writes go through API routes using the service role key (bypasses RLS).
-- No anon insert/update policies needed.

-- Seed data — 8 example requests to populate the board at launch.
-- These look like community requests but are written by you.
INSERT INTO feature_requests (title, description, vote_count) VALUES
  ('Add comment threads to feature requests',
   'Let people discuss ideas before voting. Would help surface context around why something is valuable.',
   12),
  ('Show a live count of active users on the board',
   'A small number in the corner showing how many people are here right now.',
   9),
  ('Let me track which feature requests I submitted',
   'A simple "your submissions" view so I can see what I put out there and how it''s doing.',
   7),
  ('Add dark/light mode toggle',
   'Some people prefer light mode. Let them choose.',
   6),
  ('Weekly email digest of top-voted features',
   'A simple email every Monday showing the top 3 ideas up for selection this week.',
   5),
  ('Push notification when a feature I voted for ships',
   'Notify me when something I cared about actually gets built.',
   4),
  ('Public leaderboard of top contributors',
   'Show who''s submitted the most voted-on ideas. Rewards engaged community members.',
   3),
  ('Show how long each feature took Claude to build',
   'Transparency into the build time. Makes for good content too.',
   3)
ON CONFLICT DO NOTHING;
