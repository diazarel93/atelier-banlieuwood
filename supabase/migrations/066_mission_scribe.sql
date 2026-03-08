-- Adrian: "un seul élève par mission qui saisit le résultat final" (scribe)
ALTER TABLE module6_missions ADD COLUMN IF NOT EXISTS is_scribe BOOLEAN DEFAULT false;
