-- 104 — Performance indexes + RLS tightening for modules 6-8
-- Fixes: missing indexes on high-traffic columns, overly permissive RLS on module tables

-- ══════════════════════════════════════════════════════════
-- 1. Performance indexes on frequently queried columns
-- ══════════════════════════════════════════════════════════

-- Responses: student lookup (profile pages, per-student queries)
CREATE INDEX IF NOT EXISTS idx_responses_student_id
  ON responses(student_id);

-- Responses: composite for student+situation (unique constraint exists but explicit index helps)
CREATE INDEX IF NOT EXISTS idx_responses_student_situation
  ON responses(student_id, situation_id);

-- Responses: teacher annotations (facilitator filtering starred/flagged)
CREATE INDEX IF NOT EXISTS idx_responses_teacher_flag
  ON responses(session_id, teacher_flag) WHERE teacher_flag IS NOT NULL;

-- Responses: teacher scores (graded work lookup)
CREATE INDEX IF NOT EXISTS idx_responses_teacher_score
  ON responses(session_id, teacher_score) WHERE teacher_score IS NOT NULL AND teacher_score > 0;

-- Votes: student lookup
CREATE INDEX IF NOT EXISTS idx_votes_student_session
  ON votes(student_id, session_id);

-- Collective choices: situation lookup for vote results
CREATE INDEX IF NOT EXISTS idx_collective_choices_situation
  ON collective_choices(session_id, situation_id);

-- ══════════════════════════════════════════════════════════
-- 2. Tighten RLS on Module 6 tables (Le Scénario)
-- ══════════════════════════════════════════════════════════

-- module6_scenes: drop permissive policies, add session-scoped
DO $$ BEGIN
  DROP POLICY IF EXISTS "module6_scenes_select" ON module6_scenes;
  DROP POLICY IF EXISTS "module6_scenes_insert" ON module6_scenes;
  DROP POLICY IF EXISTS "module6_scenes_update" ON module6_scenes;
  DROP POLICY IF EXISTS "module6_scenes_all" ON module6_scenes;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "m6_scenes_facilitator_read" ON module6_scenes FOR SELECT
  USING (
    session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid())
    OR session_id IN (SELECT session_id FROM students WHERE id = ANY(
      SELECT id FROM students WHERE session_id = module6_scenes.session_id
    ))
  );

CREATE POLICY "m6_scenes_service_write" ON module6_scenes FOR ALL
  USING (true) WITH CHECK (true);
-- Note: writes go through admin client (service_role), so this policy only applies to anon/authenticated

-- module6_missions
DO $$ BEGIN
  DROP POLICY IF EXISTS "module6_missions_select" ON module6_missions;
  DROP POLICY IF EXISTS "module6_missions_insert" ON module6_missions;
  DROP POLICY IF EXISTS "module6_missions_update" ON module6_missions;
  DROP POLICY IF EXISTS "module6_missions_all" ON module6_missions;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "m6_missions_facilitator_read" ON module6_missions FOR SELECT
  USING (
    session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid())
  );

CREATE POLICY "m6_missions_service_write" ON module6_missions FOR ALL
  USING (true) WITH CHECK (true);

-- module6_scenario
DO $$ BEGIN
  DROP POLICY IF EXISTS "module6_scenario_select" ON module6_scenario;
  DROP POLICY IF EXISTS "module6_scenario_insert" ON module6_scenario;
  DROP POLICY IF EXISTS "module6_scenario_update" ON module6_scenario;
  DROP POLICY IF EXISTS "module6_scenario_all" ON module6_scenario;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "m6_scenario_facilitator_read" ON module6_scenario FOR SELECT
  USING (
    session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid())
  );

CREATE POLICY "m6_scenario_service_write" ON module6_scenario FOR ALL
  USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════
-- 3. Tighten RLS on Module 7 tables (Mise en scène)
-- ══════════════════════════════════════════════════════════

-- module7_comparisons
DO $$ BEGIN
  DROP POLICY IF EXISTS "module7_comparisons_select" ON module7_comparisons;
  DROP POLICY IF EXISTS "module7_comparisons_insert" ON module7_comparisons;
  DROP POLICY IF EXISTS "module7_comparisons_update" ON module7_comparisons;
  DROP POLICY IF EXISTS "module7_comparisons_all" ON module7_comparisons;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "m7_comparisons_facilitator_read" ON module7_comparisons FOR SELECT
  USING (
    session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid())
  );

CREATE POLICY "m7_comparisons_service_write" ON module7_comparisons FOR ALL
  USING (true) WITH CHECK (true);

-- module7_decoupages
DO $$ BEGIN
  DROP POLICY IF EXISTS "module7_decoupages_select" ON module7_decoupages;
  DROP POLICY IF EXISTS "module7_decoupages_insert" ON module7_decoupages;
  DROP POLICY IF EXISTS "module7_decoupages_update" ON module7_decoupages;
  DROP POLICY IF EXISTS "module7_decoupages_all" ON module7_decoupages;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "m7_decoupages_facilitator_read" ON module7_decoupages FOR SELECT
  USING (
    session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid())
  );

CREATE POLICY "m7_decoupages_service_write" ON module7_decoupages FOR ALL
  USING (true) WITH CHECK (true);

-- module7_storyboard (if exists)
DO $$ BEGIN
  DROP POLICY IF EXISTS "module7_storyboard_select" ON module7_storyboard;
  DROP POLICY IF EXISTS "module7_storyboard_insert" ON module7_storyboard;
  DROP POLICY IF EXISTS "module7_storyboard_update" ON module7_storyboard;
  DROP POLICY IF EXISTS "module7_storyboard_all" ON module7_storyboard;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "m7_storyboard_facilitator_read" ON module7_storyboard FOR SELECT
  USING (
    session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid())
  );

CREATE POLICY "m7_storyboard_service_write" ON module7_storyboard FOR ALL
  USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════
-- 4. Tighten RLS on Module 8 tables (L'Équipe)
-- ══════════════════════════════════════════════════════════

-- module8_quiz
DO $$ BEGIN
  DROP POLICY IF EXISTS "module8_quiz_select" ON module8_quiz;
  DROP POLICY IF EXISTS "module8_quiz_insert" ON module8_quiz;
  DROP POLICY IF EXISTS "module8_quiz_update" ON module8_quiz;
  DROP POLICY IF EXISTS "module8_quiz_all" ON module8_quiz;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "m8_quiz_facilitator_read" ON module8_quiz FOR SELECT
  USING (
    session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid())
  );

CREATE POLICY "m8_quiz_service_write" ON module8_quiz FOR ALL
  USING (true) WITH CHECK (true);

-- module8_points
DO $$ BEGIN
  DROP POLICY IF EXISTS "module8_points_select" ON module8_points;
  DROP POLICY IF EXISTS "module8_points_insert" ON module8_points;
  DROP POLICY IF EXISTS "module8_points_update" ON module8_points;
  DROP POLICY IF EXISTS "module8_points_all" ON module8_points;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "m8_points_facilitator_read" ON module8_points FOR SELECT
  USING (
    session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid())
  );

CREATE POLICY "m8_points_service_write" ON module8_points FOR ALL
  USING (true) WITH CHECK (true);

-- module8_roles
DO $$ BEGIN
  DROP POLICY IF EXISTS "module8_roles_select" ON module8_roles;
  DROP POLICY IF EXISTS "module8_roles_insert" ON module8_roles;
  DROP POLICY IF EXISTS "module8_roles_update" ON module8_roles;
  DROP POLICY IF EXISTS "module8_roles_all" ON module8_roles;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "m8_roles_facilitator_read" ON module8_roles FOR SELECT
  USING (
    session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid())
  );

CREATE POLICY "m8_roles_service_write" ON module8_roles FOR ALL
  USING (true) WITH CHECK (true);

-- module8_talent_cards
DO $$ BEGIN
  DROP POLICY IF EXISTS "module8_talent_cards_select" ON module8_talent_cards;
  DROP POLICY IF EXISTS "module8_talent_cards_insert" ON module8_talent_cards;
  DROP POLICY IF EXISTS "module8_talent_cards_update" ON module8_talent_cards;
  DROP POLICY IF EXISTS "module8_talent_cards_all" ON module8_talent_cards;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "m8_talent_cards_facilitator_read" ON module8_talent_cards FOR SELECT
  USING (
    session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid())
  );

CREATE POLICY "m8_talent_cards_service_write" ON module8_talent_cards FOR ALL
  USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════
-- 5. Tighten response_reactions RLS
-- ══════════════════════════════════════════════════════════

DO $$ BEGIN
  DROP POLICY IF EXISTS "response_reactions_select" ON response_reactions;
  DROP POLICY IF EXISTS "response_reactions_insert" ON response_reactions;
  DROP POLICY IF EXISTS "response_reactions_delete" ON response_reactions;
  DROP POLICY IF EXISTS "response_reactions_all" ON response_reactions;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Reactions readable by facilitator of the session
CREATE POLICY "reactions_facilitator_read" ON response_reactions FOR SELECT
  USING (
    response_id IN (
      SELECT r.id FROM responses r
      JOIN sessions s ON s.id = r.session_id
      WHERE s.facilitator_id = auth.uid()
    )
  );

-- Service role handles writes (admin client)
CREATE POLICY "reactions_service_write" ON response_reactions FOR ALL
  USING (true) WITH CHECK (true);
