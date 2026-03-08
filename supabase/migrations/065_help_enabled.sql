-- Adrian: "L'aide ne doit pas être automatique. Elle doit être activée par l'intervenant."
-- This flag controls whether students can request AI help in Module 3 (Et si...).
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS help_enabled BOOLEAN DEFAULT false;
