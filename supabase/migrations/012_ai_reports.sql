-- AI-generated reports: bilan de session + fiche de cours

CREATE TABLE session_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('bilan', 'fiche_cours')),
  content JSONB NOT NULL,
  ai_provider TEXT,
  generated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, report_type)
);
CREATE INDEX idx_session_reports_session ON session_reports(session_id);

CREATE TABLE course_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL CHECK (level IN ('primaire', 'college', 'lycee')),
  template TEXT,
  content JSONB NOT NULL,
  ai_provider TEXT,
  generated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(level, COALESCE(template, '__none__'))
);
