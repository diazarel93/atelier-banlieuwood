-- Module 10 "Et si..." — QCM answers integrated into workspace
-- QCMs (tone, character, trigger, ending) are now part of the single etsi screen
ALTER TABLE module10_etsi ADD COLUMN IF NOT EXISTS qcm_answers JSONB DEFAULT '{}';
