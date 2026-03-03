import type { AtelierSession } from "../models/atelier";
import { CHAPTER_IDS, TOTAL_QUESTIONS } from "../models/atelier";
import type { AchievementsData } from "../models/achievements";

/**
 * Pure function: given a session and already-unlocked achievements,
 * returns the list of NEW achievement IDs to unlock.
 */
export function checkAchievements(
  session: AtelierSession,
  existing: AchievementsData
): string[] {
  const unlocked = new Set(existing.achievements.map((a) => a.id));
  const newlyUnlocked: string[] = [];

  function tryUnlock(id: string, condition: boolean) {
    if (!unlocked.has(id) && condition) {
      newlyUnlocked.push(id);
      unlocked.add(id);
    }
  }

  // First Gold — any chapter with badge "gold"
  tryUnlock(
    "first-gold",
    session.chapters.some((ch) => ch.badge === "gold")
  );

  // Perfect Chapter — all questions score 3 in at least one completed chapter
  tryUnlock(
    "perfect-chapter",
    session.chapters.some(
      (ch) =>
        ch.status === "completed" &&
        ch.steps.length > 0 &&
        ch.steps.every((s) => s.score >= 3)
    )
  );

  // Parcours Complet — all 7 chapters completed
  tryUnlock(
    "parcours-complet",
    session.chapters.filter((ch) => ch.status === "completed").length >=
      CHAPTER_IDS.length
  );

  // Streak achievements
  tryUnlock("streak-5", (session.bestStreak || 0) >= 5);
  tryUnlock("streak-10", (session.bestStreak || 0) >= 10);

  // Criteria-based achievements: count across all steps
  let profondeur3Count = 0;
  let creativite3Count = 0;
  let totalValidated = 0;

  for (const ch of session.chapters) {
    for (const step of ch.steps) {
      if (step.status === "validated") {
        totalValidated++;
        const exchanges = step.exchanges || [];
        for (const ex of exchanges) {
          if (ex.criteria?.profondeur === 3) profondeur3Count++;
          if (ex.criteria?.creativite === 3) creativite3Count++;
        }
      }
    }
  }

  tryUnlock("penseur-profond", profondeur3Count >= 10);
  tryUnlock("ame-creative", creativite3Count >= 10);

  // Completiste — all 41 questions answered
  tryUnlock("completiste", totalValidated >= TOTAL_QUESTIONS);

  // La Remontada — a step where initial exchange was score 1 but final score is 3
  tryUnlock(
    "remontada",
    session.chapters.some((ch) =>
      ch.steps.some((step) => {
        const exchanges = step.exchanges || [];
        return (
          step.status === "validated" &&
          step.score >= 3 &&
          exchanges.length > 1 &&
          exchanges[0].score === 1
        );
      })
    )
  );

  // Secret: Night Owl — session updated between midnight and 4am
  try {
    const hour = new Date(session.updatedAt).getHours();
    tryUnlock("secret-night-owl", hour >= 0 && hour < 4);
  } catch {
    // Invalid date — skip
  }

  // Secret: Speed Demon — 10+ questions validated in a single session
  tryUnlock("secret-speed-demon", totalValidated >= 10);

  return newlyUnlocked;
}
