-- ============================================================
-- FIX: Tighten RLS policies for module10_*, module5_*,
--       session_reports, course_guides
-- ============================================================

-- ── MODULE 10 ──────────────────────────────────────────────

DROP POLICY IF EXISTS "Students can read etsi" ON module10_etsi;
DROP POLICY IF EXISTS "Students can update own etsi" ON module10_etsi;
DROP POLICY IF EXISTS "Session members can read etsi" ON module10_etsi;

CREATE POLICY "Session members can read etsi" ON module10_etsi FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM sessions WHERE facilitator_id = auth.uid()
      UNION
      SELECT s.session_id FROM students s WHERE s.id = module10_etsi.student_id
    )
  );

DROP POLICY IF EXISTS "Students can update own etsi 2" ON module10_etsi;
CREATE POLICY "Students can update own etsi" ON module10_etsi FOR UPDATE
  USING (
    student_id IN (SELECT id FROM students WHERE session_id = module10_etsi.session_id)
  );

DROP POLICY IF EXISTS "Students can read personnages" ON module10_personnages;
DROP POLICY IF EXISTS "Students can update own personnage" ON module10_personnages;
DROP POLICY IF EXISTS "Session members can read personnages" ON module10_personnages;

CREATE POLICY "Session members can read personnages" ON module10_personnages FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM sessions WHERE facilitator_id = auth.uid()
      UNION
      SELECT s.session_id FROM students s WHERE s.id = module10_personnages.student_id
    )
  );

DROP POLICY IF EXISTS "Students can update own personnage 2" ON module10_personnages;
CREATE POLICY "Students can update own personnage" ON module10_personnages FOR UPDATE
  USING (
    student_id IN (SELECT id FROM students WHERE session_id = module10_personnages.session_id)
  );

DROP POLICY IF EXISTS "Students can read pitchs" ON module10_pitchs;
DROP POLICY IF EXISTS "Students can update own pitch" ON module10_pitchs;
DROP POLICY IF EXISTS "Session members can read pitchs" ON module10_pitchs;

CREATE POLICY "Session members can read pitchs" ON module10_pitchs FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM sessions WHERE facilitator_id = auth.uid()
      UNION
      SELECT s.session_id FROM students s WHERE s.id = module10_pitchs.student_id
    )
  );

DROP POLICY IF EXISTS "Students can update own pitch 2" ON module10_pitchs;
CREATE POLICY "Students can update own pitch" ON module10_pitchs FOR UPDATE
  USING (
    student_id IN (SELECT id FROM students WHERE session_id = module10_pitchs.session_id)
  );

DROP POLICY IF EXISTS "Anyone can read ideas" ON module10_idea_bank;
DROP POLICY IF EXISTS "Anyone can update ideas" ON module10_idea_bank;
DROP POLICY IF EXISTS "Session members can read ideas" ON module10_idea_bank;
DROP POLICY IF EXISTS "Session members can update ideas" ON module10_idea_bank;

CREATE POLICY "Session members can read ideas" ON module10_idea_bank FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM sessions WHERE facilitator_id = auth.uid()
      UNION
      SELECT session_id FROM students WHERE id = module10_idea_bank.student_id
    )
  );

CREATE POLICY "Session members can update ideas" ON module10_idea_bank FOR UPDATE
  USING (
    session_id IN (
      SELECT id FROM sessions WHERE facilitator_id = auth.uid()
      UNION
      SELECT session_id FROM students WHERE id = module10_idea_bank.student_id
    )
  );

DROP POLICY IF EXISTS "Students can read own help requests" ON module10_help_requests;
DROP POLICY IF EXISTS "Session members can read help requests" ON module10_help_requests;

CREATE POLICY "Session members can read help requests" ON module10_help_requests FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM sessions WHERE facilitator_id = auth.uid()
      UNION
      SELECT s.session_id FROM students s WHERE s.id = module10_help_requests.student_id
    )
  );

-- ── MODULE 5 (Émotion Cachée) ─────────────────────────────

DROP POLICY IF EXISTS "Students can read own checklist" ON module5_checklists;
DROP POLICY IF EXISTS "Students can update own checklist" ON module5_checklists;
DROP POLICY IF EXISTS "Session members can read checklists" ON module5_checklists;

CREATE POLICY "Session members can read checklists" ON module5_checklists FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM sessions WHERE facilitator_id = auth.uid()
      UNION
      SELECT s.session_id FROM students s WHERE s.id = module5_checklists.student_id
    )
  );

DROP POLICY IF EXISTS "Students can update own checklist 2" ON module5_checklists;
CREATE POLICY "Students can update own checklist" ON module5_checklists FOR UPDATE
  USING (
    student_id IN (SELECT id FROM students WHERE session_id = module5_checklists.session_id)
  );

DROP POLICY IF EXISTS "Students can read scenes" ON module5_scenes;
DROP POLICY IF EXISTS "Students can update own scene" ON module5_scenes;
DROP POLICY IF EXISTS "Session members can read scenes" ON module5_scenes;

CREATE POLICY "Session members can read scenes" ON module5_scenes FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM sessions WHERE facilitator_id = auth.uid()
      UNION
      SELECT s.session_id FROM students s WHERE s.id = module5_scenes.student_id
    )
  );

DROP POLICY IF EXISTS "Students can update own scene 2" ON module5_scenes;
CREATE POLICY "Students can update own scene" ON module5_scenes FOR UPDATE
  USING (
    student_id IN (SELECT id FROM students WHERE session_id = module5_scenes.session_id)
  );

DROP POLICY IF EXISTS "Anyone can read comparisons" ON module5_comparisons;
DROP POLICY IF EXISTS "Facilitator can manage comparisons" ON module5_comparisons;
DROP POLICY IF EXISTS "Session members can read comparisons" ON module5_comparisons;

CREATE POLICY "Session members can read comparisons" ON module5_comparisons FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM sessions WHERE facilitator_id = auth.uid()
      UNION
      SELECT session_id FROM students WHERE session_id = module5_comparisons.session_id
    )
  );

CREATE POLICY "Facilitator can manage comparisons" ON module5_comparisons FOR ALL
  USING (
    session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid())
  );

-- ── SESSION REPORTS ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS session_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('bilan', 'fiche_cours')),
  content JSONB NOT NULL,
  ai_provider TEXT,
  generated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, report_type)
);
CREATE INDEX IF NOT EXISTS idx_session_reports_session ON session_reports(session_id);

ALTER TABLE session_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Facilitator can manage reports" ON session_reports;
CREATE POLICY "Facilitator can manage reports" ON session_reports FOR ALL
  USING (
    session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid())
  );

-- ── COURSE GUIDES ──────────────────────────────────────────

ALTER TABLE course_guides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read guides" ON course_guides;
CREATE POLICY "Authenticated users can read guides" ON course_guides FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can insert guides" ON course_guides;
CREATE POLICY "Authenticated users can insert guides" ON course_guides FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can delete guides" ON course_guides;
CREATE POLICY "Authenticated users can delete guides" ON course_guides FOR DELETE
  USING (auth.uid() IS NOT NULL);
