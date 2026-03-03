-- Add vote selection flag: facilitator picks which responses go to vote
ALTER TABLE responses ADD COLUMN IF NOT EXISTS is_vote_option BOOLEAN DEFAULT false;
