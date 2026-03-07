-- 047: Session events log for replay + O-I-E signal enrichment

CREATE TABLE session_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  situation_id UUID REFERENCES situations(id) ON DELETE SET NULL,
  payload JSONB DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  seq SERIAL
);

CREATE INDEX idx_session_events_session ON session_events(session_id, seq);
