-- ====== 010: Relances adaptatives IA ======
-- Adds AI-generated follow-up question + student response to existing responses table

ALTER TABLE responses ADD COLUMN IF NOT EXISTS relance_text TEXT;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS relance_response TEXT;
