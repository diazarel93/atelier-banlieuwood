-- Add voted_by column for server-side vote deduplication
ALTER TABLE module10_idea_bank ADD COLUMN IF NOT EXISTS voted_by TEXT[] DEFAULT '{}';
