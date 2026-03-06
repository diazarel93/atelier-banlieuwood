-- ═══════════════════════════════════════════════════════════════
-- V2 RPC Functions
-- ═══════════════════════════════════════════════════════════════

-- Increment student profile XP
CREATE OR REPLACE FUNCTION increment_profile_xp(p_profile_id UUID, p_xp INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE student_profiles
  SET total_xp = total_xp + p_xp,
      updated_at = now()
  WHERE id = p_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment festival entry vote count
CREATE OR REPLACE FUNCTION increment_vote_count(p_entry_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE festival_entries
  SET vote_count = vote_count + 1
  WHERE id = p_entry_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update student streak (call daily)
CREATE OR REPLACE FUNCTION update_student_streak(p_profile_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_profile student_profiles%ROWTYPE;
  v_today DATE := CURRENT_DATE;
  v_new_streak INTEGER;
BEGIN
  SELECT * INTO v_profile FROM student_profiles WHERE id = p_profile_id;

  IF v_profile.streak_updated_date = v_today THEN
    -- Already updated today
    RETURN jsonb_build_object('streak', v_profile.current_streak, 'updated', false);
  ELSIF v_profile.streak_updated_date = v_today - 1 THEN
    -- Consecutive day
    v_new_streak := v_profile.current_streak + 1;
  ELSE
    -- Streak broken
    v_new_streak := 1;
  END IF;

  UPDATE student_profiles
  SET current_streak = v_new_streak,
      best_streak = GREATEST(best_streak, v_new_streak),
      streak_updated_date = v_today,
      last_active_at = now(),
      updated_at = now()
  WHERE id = p_profile_id;

  RETURN jsonb_build_object('streak', v_new_streak, 'updated', true, 'isNew', v_new_streak > v_profile.best_streak);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
