-- 103 — Auto-increment student_profiles counters via triggers
-- Fixes: sessions_played, total_responses, total_votes, retained_count were never updated

-- ══════════════════════════════════════════════════════════
-- 1. Increment sessions_played when a student joins a session
-- ══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION increment_profile_sessions()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.profile_id IS NOT NULL THEN
    UPDATE student_profiles
    SET sessions_played = sessions_played + 1,
        last_active_at = now()
    WHERE id = NEW.profile_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_student_profile_session
  AFTER INSERT ON students
  FOR EACH ROW
  EXECUTE FUNCTION increment_profile_sessions();

-- ══════════════════════════════════════════════════════════
-- 2. Increment total_responses when a response is submitted
-- ══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION increment_profile_responses()
RETURNS TRIGGER AS $$
DECLARE
  v_profile_id UUID;
BEGIN
  SELECT profile_id INTO v_profile_id
  FROM students WHERE id = NEW.student_id;

  IF v_profile_id IS NOT NULL THEN
    UPDATE student_profiles
    SET total_responses = total_responses + 1,
        last_active_at = now()
    WHERE id = v_profile_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_student_profile_response
  AFTER INSERT ON responses
  FOR EACH ROW
  EXECUTE FUNCTION increment_profile_responses();

-- ══════════════════════════════════════════════════════════
-- 3. Increment total_votes when a vote is cast
-- ══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION increment_profile_votes()
RETURNS TRIGGER AS $$
DECLARE
  v_profile_id UUID;
BEGIN
  SELECT profile_id INTO v_profile_id
  FROM students WHERE id = NEW.student_id;

  IF v_profile_id IS NOT NULL THEN
    UPDATE student_profiles
    SET total_votes = total_votes + 1
    WHERE id = v_profile_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_student_profile_vote
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION increment_profile_votes();

-- ══════════════════════════════════════════════════════════
-- 4. Increment retained_count when a collective choice uses a student's response
-- ══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION increment_profile_retained()
RETURNS TRIGGER AS $$
DECLARE
  v_student_id UUID;
  v_profile_id UUID;
BEGIN
  IF NEW.source_response_id IS NOT NULL THEN
    SELECT student_id INTO v_student_id
    FROM responses WHERE id = NEW.source_response_id;

    IF v_student_id IS NOT NULL THEN
      SELECT profile_id INTO v_profile_id
      FROM students WHERE id = v_student_id;

      IF v_profile_id IS NOT NULL THEN
        UPDATE student_profiles
        SET retained_count = retained_count + 1
        WHERE id = v_profile_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_student_profile_retained
  AFTER INSERT ON collective_choices
  FOR EACH ROW
  EXECUTE FUNCTION increment_profile_retained();
