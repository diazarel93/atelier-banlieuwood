-- Add summary column to module2_budgets for auto-generated budget text
ALTER TABLE module2_budgets ADD COLUMN IF NOT EXISTS summary TEXT;
