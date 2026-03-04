-- Add missing tables to Supabase Realtime publication
-- Use DO block to skip if already added

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE collective_choices;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE module2_budgets;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
