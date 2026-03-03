-- Renumber modules to match Adrien's spec:
-- Module 2 (Émotion Cachée, was Module 8) → Module 2
-- Old Module 2 (Le Cinéma) → Module 9

-- Step 1: Move old Module 2 to Module 9 (temporary safe zone)
UPDATE situations SET module = 9 WHERE module = 2;

-- Step 2: Move Module 8 (Émotion Cachée) to Module 2
UPDATE situations SET module = 2 WHERE module = 8;
