-- ═══════════════════════════════════════════════════════════════
-- BANLIEUWOOD V2 — Student Profiles, Achievements, Missions, Festival
-- ═══════════════════════════════════════════════════════════════

-- ────────────────────────────────────────
-- 1. STUDENT PROFILES (persistent, linked to auth)
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  display_name TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT '🎬',
  avatar_accessories JSONB DEFAULT '[]'::jsonb,
  avatar_frame TEXT,
  custom_title TEXT,
  email TEXT,
  level INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_active_at TIMESTAMPTZ,
  streak_updated_date DATE,
  sessions_played INTEGER DEFAULT 0,
  total_responses INTEGER DEFAULT 0,
  total_votes INTEGER DEFAULT 0,
  retained_count INTEGER DEFAULT 0,
  particle_effect TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_profiles_auth ON student_profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_email ON student_profiles(email);

-- Link existing students table to profiles
ALTER TABLE students ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES student_profiles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_students_profile ON students(profile_id);

-- ────────────────────────────────────────
-- 2. ACHIEVEMENTS (badge definitions + unlocks)
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS achievement_definitions (
  id TEXT PRIMARY KEY, -- e.g. 'narrateur', 'electeur', 'tribun'
  category TEXT NOT NULL, -- narration, vote, expression, streak, social, special
  name_fr TEXT NOT NULL,
  description_fr TEXT NOT NULL,
  icon TEXT NOT NULL, -- emoji
  tiers JSONB NOT NULL DEFAULT '[
    {"tier": "bronze", "threshold": 1, "label": "Bronze"},
    {"tier": "silver", "threshold": 10, "label": "Argent"},
    {"tier": "gold", "threshold": 25, "label": "Or"}
  ]'::jsonb,
  reward_type TEXT, -- 'accessory', 'frame', 'title', 'effect'
  reward_value TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS student_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES achievement_definitions(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'bronze', -- bronze, silver, gold
  progress INTEGER DEFAULT 0,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  seen BOOLEAN DEFAULT false,
  UNIQUE(profile_id, achievement_id, tier)
);

CREATE INDEX IF NOT EXISTS idx_student_achievements_profile ON student_achievements(profile_id);

-- ────────────────────────────────────────
-- 3. SOLO MISSIONS
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  mission_type TEXT NOT NULL, -- 'writing_prompt', 'character_analysis', 'scene_critique', 'dialogue_challenge'
  difficulty TEXT NOT NULL DEFAULT 'medium', -- easy, medium, hard
  xp_reward INTEGER NOT NULL DEFAULT 50,
  time_limit_minutes INTEGER DEFAULT 10,
  prompt_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_daily BOOLEAN DEFAULT false,
  available_from TIMESTAMPTZ,
  available_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mission_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  score INTEGER, -- 0-100
  ai_feedback JSONB,
  xp_earned INTEGER DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(mission_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_mission_submissions_profile ON mission_submissions(profile_id);

-- ────────────────────────────────────────
-- 4. FESTIVAL (gallery, votes, awards)
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS festival_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  entry_type TEXT NOT NULL, -- 'response', 'pitch', 'scene', 'collective'
  category TEXT, -- module category
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_festival_entries_profile ON festival_entries(profile_id);
CREATE INDEX IF NOT EXISTS idx_festival_entries_published ON festival_entries(is_published, created_at DESC);

CREATE TABLE IF NOT EXISTS festival_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES festival_entries(id) ON DELETE CASCADE,
  voter_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(entry_id, voter_profile_id)
);

CREATE TABLE IF NOT EXISTS festival_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES festival_entries(id) ON DELETE CASCADE,
  award_type TEXT NOT NULL, -- 'best_narrative', 'best_pitch', 'most_voted', 'teacher_pick', 'monthly_star'
  award_month DATE, -- first of month
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────
-- 5. TEAM MESSAGES (moderated chat)
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- 'text', 'sticker', 'reaction'
  is_moderated BOOLEAN DEFAULT false,
  flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_team_messages_session ON team_messages(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_team_messages_team ON team_messages(team_id, created_at DESC);

-- ────────────────────────────────────────
-- 6. STUDENT NOTES (teacher persistent annotations)
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facilitator_id UUID NOT NULL REFERENCES facilitators(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  note_type TEXT NOT NULL DEFAULT 'observation', -- 'observation', 'strength', 'concern', 'goal'
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_notes_profile ON student_notes(profile_id);
CREATE INDEX IF NOT EXISTS idx_student_notes_facilitator ON student_notes(facilitator_id);

-- ────────────────────────────────────────
-- 7. ANALYTICS EVENTS
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'session_join', 'response_submit', 'vote_cast', 'achievement_unlock', 'mission_complete', 'streak_update'
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  profile_id UUID REFERENCES student_profiles(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_profile ON analytics_events(profile_id, created_at DESC);

-- ────────────────────────────────────────
-- 8. POWER-UPS
-- ────────────────────────────────────────
ALTER TABLE students ADD COLUMN IF NOT EXISTS power_ups JSONB DEFAULT '{"double_temps": 1, "indice": 2, "coup_de_pouce": 1, "bouclier": 1}'::jsonb;
ALTER TABLE students ADD COLUMN IF NOT EXISTS power_ups_used JSONB DEFAULT '[]'::jsonb;

-- ────────────────────────────────────────
-- 9. SEED ACHIEVEMENT DEFINITIONS
-- ────────────────────────────────────────
INSERT INTO achievement_definitions (id, category, name_fr, description_fr, icon, tiers, reward_type, reward_value) VALUES
-- Narration
('narrateur', 'narration', 'Narrateur', 'Ecrire des reponses', '✍️', '[{"tier":"bronze","threshold":5,"label":"Bronze"},{"tier":"silver","threshold":25,"label":"Argent"},{"tier":"gold","threshold":100,"label":"Or"}]', 'title', 'Conteur'),
('plume_or', 'narration', 'Plume d''Or', 'Reponses retenues par le vote', '🖊️', '[{"tier":"bronze","threshold":3,"label":"Bronze"},{"tier":"silver","threshold":15,"label":"Argent"},{"tier":"gold","threshold":50,"label":"Or"}]', 'frame', 'gold_quill'),
('scenariste', 'narration', 'Scenariste', 'Completer des modules', '🎬', '[{"tier":"bronze","threshold":2,"label":"Bronze"},{"tier":"silver","threshold":5,"label":"Argent"},{"tier":"gold","threshold":8,"label":"Or"}]', 'accessory', 'beret'),
('poete', 'narration', 'Poete', 'Utiliser des figures de style', '📜', '[{"tier":"bronze","threshold":5,"label":"Bronze"},{"tier":"silver","threshold":20,"label":"Argent"},{"tier":"gold","threshold":50,"label":"Or"}]', 'title', 'Poete'),
('dialoguiste', 'narration', 'Dialoguiste', 'Reponses longues et detaillees', '💬', '[{"tier":"bronze","threshold":10,"label":"Bronze"},{"tier":"silver","threshold":30,"label":"Argent"},{"tier":"gold","threshold":75,"label":"Or"}]', 'accessory', 'megaphone'),

-- Vote
('electeur', 'vote', 'Electeur', 'Voter pour des reponses', '🗳️', '[{"tier":"bronze","threshold":10,"label":"Bronze"},{"tier":"silver","threshold":50,"label":"Argent"},{"tier":"gold","threshold":150,"label":"Or"}]', 'title', 'Critique'),
('kingmaker', 'vote', 'Faiseur de Roi', 'Voter pour la reponse gagnante', '👑', '[{"tier":"bronze","threshold":5,"label":"Bronze"},{"tier":"silver","threshold":20,"label":"Argent"},{"tier":"gold","threshold":50,"label":"Or"}]', 'frame', 'crown'),
('curateur', 'vote', 'Curateur', 'Voter dans toutes les situations d''une session', '🎯', '[{"tier":"bronze","threshold":3,"label":"Bronze"},{"tier":"silver","threshold":10,"label":"Argent"},{"tier":"gold","threshold":25,"label":"Or"}]', 'accessory', 'monocle'),

-- Expression
('tribun', 'expression', 'Tribun', 'Reponses avec score IA eleve', '🎤', '[{"tier":"bronze","threshold":5,"label":"Bronze"},{"tier":"silver","threshold":20,"label":"Argent"},{"tier":"gold","threshold":50,"label":"Or"}]', 'title', 'Orateur'),
('pitcheur', 'expression', 'Pitcheur', 'Completer des pitchs', '🎯', '[{"tier":"bronze","threshold":3,"label":"Bronze"},{"tier":"silver","threshold":10,"label":"Argent"},{"tier":"gold","threshold":25,"label":"Or"}]', 'effect', 'spotlight'),
('debatteur', 'expression', 'Debatteur', 'Participer aux debats', '⚔️', '[{"tier":"bronze","threshold":5,"label":"Bronze"},{"tier":"silver","threshold":15,"label":"Argent"},{"tier":"gold","threshold":40,"label":"Or"}]', 'accessory', 'shield'),
('improvisateur', 'expression', 'Improvisateur', 'Reponses rapides (< 30s)', '⚡', '[{"tier":"bronze","threshold":5,"label":"Bronze"},{"tier":"silver","threshold":25,"label":"Argent"},{"tier":"gold","threshold":75,"label":"Or"}]', 'effect', 'lightning'),

-- Streak
('flamme', 'streak', 'Flamme', 'Jours consecutifs actifs', '🔥', '[{"tier":"bronze","threshold":3,"label":"Bronze"},{"tier":"silver","threshold":7,"label":"Argent"},{"tier":"gold","threshold":30,"label":"Or"}]', 'effect', 'flame_aura'),
('marathonien', 'streak', 'Marathonien', 'Sessions jouees', '🏃', '[{"tier":"bronze","threshold":5,"label":"Bronze"},{"tier":"silver","threshold":20,"label":"Argent"},{"tier":"gold","threshold":50,"label":"Or"}]', 'frame', 'marathon'),
('regulier', 'streak', 'Regulier', 'Semaines avec au moins 1 session', '📅', '[{"tier":"bronze","threshold":4,"label":"Bronze"},{"tier":"silver","threshold":12,"label":"Argent"},{"tier":"gold","threshold":30,"label":"Or"}]', 'title', 'Fidele'),

-- Social
('collaborateur', 'social', 'Collaborateur', 'Jouer en equipe', '🤝', '[{"tier":"bronze","threshold":5,"label":"Bronze"},{"tier":"silver","threshold":20,"label":"Argent"},{"tier":"gold","threshold":50,"label":"Or"}]', 'accessory', 'handshake_badge'),
('mentor', 'social', 'Mentor', 'Aider des coequipiers (main levee)', '🧑‍🏫', '[{"tier":"bronze","threshold":3,"label":"Bronze"},{"tier":"silver","threshold":10,"label":"Argent"},{"tier":"gold","threshold":25,"label":"Or"}]', 'title', 'Mentor'),
('star', 'social', 'Star', 'Recevoir des reactions sur ses reponses', '⭐', '[{"tier":"bronze","threshold":10,"label":"Bronze"},{"tier":"silver","threshold":50,"label":"Argent"},{"tier":"gold","threshold":200,"label":"Or"}]', 'effect', 'sparkle'),
('public', 'social', 'Public', 'Reagir aux reponses des autres', '👏', '[{"tier":"bronze","threshold":20,"label":"Bronze"},{"tier":"silver","threshold":100,"label":"Argent"},{"tier":"gold","threshold":300,"label":"Or"}]', 'accessory', 'clap_badge'),
('festival_star', 'social', 'Star du Festival', 'Recolter des votes au Festival', '🏆', '[{"tier":"bronze","threshold":5,"label":"Bronze"},{"tier":"silver","threshold":25,"label":"Argent"},{"tier":"gold","threshold":100,"label":"Or"}]', 'frame', 'festival_laurel'),

-- Special
('premier_pas', 'special', 'Premier Pas', 'Completer sa premiere session', '👣', '[{"tier":"bronze","threshold":1,"label":"Unique"}]', 'accessory', 'first_step_badge'),
('explorateur', 'special', 'Explorateur', 'Essayer tous les types de modules', '🧭', '[{"tier":"bronze","threshold":3,"label":"Bronze"},{"tier":"silver","threshold":6,"label":"Argent"},{"tier":"gold","threshold":8,"label":"Or"}]', 'frame', 'compass'),
('perfectionniste', 'special', 'Perfectionniste', 'Score IA max (5/5) sur une reponse', '💎', '[{"tier":"bronze","threshold":1,"label":"Bronze"},{"tier":"silver","threshold":5,"label":"Argent"},{"tier":"gold","threshold":20,"label":"Or"}]', 'effect', 'diamond_sparkle'),
('noctambule', 'special', 'Noctambule', 'Jouer apres 20h', '🌙', '[{"tier":"bronze","threshold":1,"label":"Bronze"},{"tier":"silver","threshold":5,"label":"Argent"},{"tier":"gold","threshold":15,"label":"Or"}]', 'accessory', 'moon_badge'),
('speed_runner', 'special', 'Speed Runner', 'Finir un module en moins de 10 min', '⏱️', '[{"tier":"bronze","threshold":1,"label":"Bronze"},{"tier":"silver","threshold":3,"label":"Argent"},{"tier":"gold","threshold":10,"label":"Or"}]', 'title', 'Eclair'),
('combo_master', 'special', 'Combo Master', 'Combo de 5+ reponses correctes', '🎮', '[{"tier":"bronze","threshold":1,"label":"Bronze"},{"tier":"silver","threshold":5,"label":"Argent"},{"tier":"gold","threshold":15,"label":"Or"}]', 'effect', 'combo_fire'),
('mission_hero', 'special', 'Heros des Missions', 'Completer des missions solo', '🦸', '[{"tier":"bronze","threshold":5,"label":"Bronze"},{"tier":"silver","threshold":20,"label":"Argent"},{"tier":"gold","threshold":50,"label":"Or"}]', 'frame', 'hero_shield'),
('cinephile', 'special', 'Cinephile', 'Repondre a des questions cinema', '🎞️', '[{"tier":"bronze","threshold":10,"label":"Bronze"},{"tier":"silver","threshold":30,"label":"Argent"},{"tier":"gold","threshold":75,"label":"Or"}]', 'accessory', 'film_reel_badge'),
('critique', 'special', 'Critique', 'Soumettre des entrees au Festival', '📽️', '[{"tier":"bronze","threshold":3,"label":"Bronze"},{"tier":"silver","threshold":10,"label":"Argent"},{"tier":"gold","threshold":25,"label":"Or"}]', 'title', 'Critique'),
('legende', 'special', 'Legende', 'Atteindre le niveau Oscar', '🏅', '[{"tier":"gold","threshold":1,"label":"Legendaire"}]', 'effect', 'golden_aura')
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────
-- 10. RLS POLICIES
-- ────────────────────────────────────────
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE festival_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE festival_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE festival_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Student profiles: users can read/update their own
CREATE POLICY "student_profiles_own" ON student_profiles
  FOR ALL USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Public read for profiles (for festival/leaderboard)
CREATE POLICY "student_profiles_public_read" ON student_profiles
  FOR SELECT USING (true);

-- Achievements: public read, system insert
CREATE POLICY "achievements_public_read" ON student_achievements
  FOR SELECT USING (true);

-- Missions: public read
CREATE POLICY "missions_public_read" ON missions
  FOR SELECT USING (true);

-- Mission submissions: own profile
CREATE POLICY "mission_submissions_own" ON mission_submissions
  FOR ALL USING (profile_id IN (SELECT id FROM student_profiles WHERE auth_user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM student_profiles WHERE auth_user_id = auth.uid()));

-- Festival entries: public read, own insert/update
CREATE POLICY "festival_entries_public_read" ON festival_entries
  FOR SELECT USING (is_published = true);

CREATE POLICY "festival_entries_own" ON festival_entries
  FOR ALL USING (profile_id IN (SELECT id FROM student_profiles WHERE auth_user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM student_profiles WHERE auth_user_id = auth.uid()));

-- Festival votes: own
CREATE POLICY "festival_votes_own" ON festival_votes
  FOR ALL USING (voter_profile_id IN (SELECT id FROM student_profiles WHERE auth_user_id = auth.uid()))
  WITH CHECK (voter_profile_id IN (SELECT id FROM student_profiles WHERE auth_user_id = auth.uid()));

-- Team messages: session members
CREATE POLICY "team_messages_session" ON team_messages
  FOR SELECT USING (
    session_id IN (SELECT session_id FROM students WHERE id = student_id)
  );

CREATE POLICY "team_messages_insert" ON team_messages
  FOR INSERT WITH CHECK (
    student_id IN (SELECT id FROM students WHERE is_active = true)
  );

-- Student notes: facilitator only
CREATE POLICY "student_notes_facilitator" ON student_notes
  FOR ALL USING (facilitator_id IN (SELECT id FROM facilitators WHERE id = auth.uid()))
  WITH CHECK (facilitator_id IN (SELECT id FROM facilitators WHERE id = auth.uid()));

-- Analytics: service role only (no direct user access)
CREATE POLICY "analytics_service_only" ON analytics_events
  FOR ALL USING (false);
