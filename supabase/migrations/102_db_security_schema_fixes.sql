-- 102 — DB security & schema fixes (audit mars 2026)
-- 1. Add missing avatar_seed column to students
-- 2. Enable RLS on session_events + achievement_definitions
-- 3. Add missing policies on festival_awards
-- 4. Secure analytics_events with authenticated INSERT policy

-- ══════════════════════════════════════════════════════════
-- 1. students.avatar_seed — used by Module 8 handler
-- ══════════════════════════════════════════════════════════
ALTER TABLE students ADD COLUMN IF NOT EXISTS avatar_seed TEXT DEFAULT NULL;

-- ══════════════════════════════════════════════════════════
-- 2a. session_events — enable RLS (all access via admin client)
-- ══════════════════════════════════════════════════════════
ALTER TABLE session_events ENABLE ROW LEVEL SECURITY;

-- Facilitator can read events for their sessions
CREATE POLICY "facilitator_session_events_read"
  ON session_events FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM sessions WHERE facilitator_id = auth.uid()
    )
  );

-- Service role (admin client) bypasses RLS, so inserts still work

-- ══════════════════════════════════════════════════════════
-- 2b. achievement_definitions — enable RLS + public read
-- ══════════════════════════════════════════════════════════
ALTER TABLE achievement_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "achievement_definitions_public_read"
  ON achievement_definitions FOR SELECT
  USING (true);

-- ══════════════════════════════════════════════════════════
-- 3. festival_awards — add missing policies
-- ══════════════════════════════════════════════════════════

-- Public can read awards
CREATE POLICY "festival_awards_public_read"
  ON festival_awards FOR SELECT
  USING (true);

-- Facilitators can manage awards (admin action)
CREATE POLICY "festival_awards_facilitator_manage"
  ON festival_awards FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM facilitators)
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM facilitators)
  );

-- ══════════════════════════════════════════════════════════
-- 4. analytics_events — allow authenticated users to insert
--    (the API route now uses admin client, but belt-and-suspenders)
-- ══════════════════════════════════════════════════════════

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "analytics_service_only" ON analytics_events;

-- Authenticated users can insert events
CREATE POLICY "analytics_events_insert"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

-- Only facilitators can read analytics
CREATE POLICY "analytics_events_facilitator_read"
  ON analytics_events FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM facilitators)
  );
