import { NextResponse } from "next/server";
import {
  getAtelierSession,
  updateAtelierSession,
} from "@/lib/storage/atelier-store";
import { generateText } from "@/lib/ai/claude-provider";
import {
  atelierMentorSystemPrompt,
  getChapterQuestions,
} from "@/lib/ai/prompts";
import {
  EvaluateRequestSchema,
  AiEvalResultSchema,
  computeBadge,
  CHAPTER_IDS,
  CHAPTER_META,
  MAX_FOLLOWUPS,
  MIN_ANSWER_LENGTH,
  type ChapterId,
  type StepProgress,
  type Exchange,
  type AtelierSession,
} from "@/lib/models/atelier";
import { checkAchievements } from "@/lib/atelier/achievement-checker";
import { getAchievements, unlockAchievement } from "@/lib/storage/atelier-store";

type Params = { params: Promise<{ slug: string; id: string }> };

// Rate limit: 1 eval per session per 2 seconds (auto-cleanup after 10s)
const lastEvalMap = new Map<string, number>();
function setRateLimit(key: string) {
  lastEvalMap.set(key, Date.now());
  setTimeout(() => lastEvalMap.delete(key), 10_000);
}

function cleanJsonString(s: string): string {
  return s
    // Smart quotes → regular quotes
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'")
    // Trailing commas before } or ]
    .replace(/,\s*([}\]])/g, "$1")
    // Unquoted keys: word: → "word":
    .replace(/(?<=[\{,]\s*)(\w+)\s*:/g, '"$1":')
    // Single-quoted strings → double-quoted (simple cases)
    .replace(/'([^']{1,500})'/g, '"$1"');
}

function parseAiJson(raw: string): Record<string, unknown> | null {
  // 1. Direct parse
  try {
    return JSON.parse(raw);
  } catch {
    /* noop */
  }

  // 2. Extract from ```json ... ``` code block
  const codeBlock = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) {
    try {
      return JSON.parse(codeBlock[1]);
    } catch {
      /* noop */
    }
    // Try with cleanup
    try {
      return JSON.parse(cleanJsonString(codeBlock[1]));
    } catch {
      /* noop */
    }
  }

  // 3. Find outermost { ... } and parse
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      /* noop */
    }
    // Try with cleanup
    try {
      return JSON.parse(cleanJsonString(jsonMatch[0]));
    } catch {
      /* noop */
    }
  }

  return null;
}

/** When JSON parsing completely fails, extract usable content from raw AI text */
function extractFallbackFromRaw(raw: string): {
  feedback: string;
  score: 1 | 2 | 3;
} | null {
  // If the AI returned substantial text (not just garbage), use it as feedback
  const cleaned = raw
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\{[\s\S]*\}/g, "")
    .replace(/^[#*\->\s]+/gm, "")
    .trim();

  // Need at least one real sentence
  if (cleaned.length < 20) return null;

  // Take first 2-3 sentences as feedback
  const sentences = cleaned.match(/[^.!?]+[.!?]+/g);
  if (!sentences || sentences.length === 0) return null;

  const feedback = sentences.slice(0, 3).join(" ").trim().slice(0, 600);

  // Try to guess score from tone
  const positiveWords = /excellent|bravo|super|genial|parfait|tres bien|impressionnant/i;
  const negativeWords = /insuffisant|trop court|vague|developpe|manque|superficiel/i;
  let score: 1 | 2 | 3 = 2;
  if (positiveWords.test(feedback)) score = 3;
  if (negativeWords.test(feedback)) score = 1;

  return { feedback, score };
}

function sanitizeForPrompt(text: string): string {
  // Don't escape quotes here — JSON.stringify handles that
  return text.replace(/\n/g, " ").slice(0, 2000);
}

function clampScore(n: number): 1 | 2 | 3 {
  return Math.max(1, Math.min(3, Math.round(n))) as 1 | 2 | 3;
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { slug, id } = await params;

    // Rate limit
    const rateKey = `${slug}:${id}`;
    const now = Date.now();
    const lastEval = lastEvalMap.get(rateKey) || 0;
    if (now - lastEval < 2000) {
      return NextResponse.json(
        { error: "Trop rapide. Attends quelques secondes." },
        { status: 429 }
      );
    }
    setRateLimit(rateKey);

    const session = await getAtelierSession(slug, id);
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { chapterId, stepId, answer } = EvaluateRequestSchema.parse(body);

    const chapterIndex = session.chapters.findIndex(
      (ch) => ch.chapterId === chapterId
    );
    if (chapterIndex === -1) {
      return NextResponse.json(
        { error: "Chapter not found" },
        { status: 400 }
      );
    }

    const chapter = session.chapters[chapterIndex];
    if (chapter.status === "locked") {
      return NextResponse.json(
        { error: "Chapter is locked" },
        { status: 400 }
      );
    }

    const stepIndex = chapter.steps.findIndex((s) => s.stepId === stepId);
    if (stepIndex === -1) {
      return NextResponse.json({ error: "Step not found" }, { status: 400 });
    }

    const currentStep = chapter.steps[stepIndex];
    if (currentStep.status === "validated") {
      return NextResponse.json(
        { error: "Step already validated" },
        { status: 400 }
      );
    }

    const meta = CHAPTER_META[chapterId as ChapterId];
    const previousAnswers = chapter.steps
      .filter((s) => s.status === "validated")
      .map((s) => ({ question: s.question, answer: s.answer }));
    const answeredSoFar = previousAnswers.length;
    const isLastQuestion = answeredSoFar + 1 >= meta.questionCount;

    // Determine if this is a follow-up answer or main answer
    const isFollowUp = !!currentStep.currentFollowUp;
    const exchangesSoFar = currentStep.exchanges || [];
    const followUpCount = exchangesSoFar.length;

    // Detect lazy/short answers
    const trimmedAnswer = answer.trim();
    const wordCount = trimmedAnswer.split(/\s+/).filter(Boolean).length;
    const isLazyAnswer =
      trimmedAnswer.length < MIN_ANSWER_LENGTH ||
      wordCount < 5 ||
      /^(jsp|idk|sais pas|je sais pas|j'?en sais rien|aucune idee|bof|oui|non|ok|rien|un truc|quelque chose|je sais pas trop|pas d'?idee|c'?est bien|c'?est cool|voila|genre|comme ca)$/i.test(trimmedAnswer);

    // Build project memory: all validated answers across ALL chapters
    const allProjectAnswers: { chapterId: string; question: string; answer: string }[] = [];
    for (const ch of session.chapters) {
      for (const step of ch.steps) {
        if (step.status === "validated" && step.answer) {
          allProjectAnswers.push({
            chapterId: ch.chapterId,
            question: step.question,
            answer: step.answer,
          });
        }
      }
    }

    // Build AI prompt
    const systemPrompt = atelierMentorSystemPrompt(
      session.level,
      chapterId as ChapterId,
      previousAnswers,
      isFollowUp ? "followup" : "evaluate",
      isFollowUp
        ? {
            exchanges: exchangesSoFar.map((e) => ({
              answer: e.answer,
              feedback: e.feedback,
            })),
            followUpQuestion: currentStep.currentFollowUp!,
          }
        : undefined,
      {
        gameConfig: session.gameConfig,
        allProjectAnswers,
        isLazyAnswer,
        followUpCount,
      }
    );

    const questionText = isFollowUp
      ? currentStep.currentFollowUp!
      : currentStep.question;

    const userPrompt = `Question posee: ${JSON.stringify(questionText)}

Reponse de l'eleve: ${JSON.stringify(sanitizeForPrompt(answer))}

C'est la question principale ${answeredSoFar + 1} sur ${meta.questionCount}.${isLastQuestion ? " C'est la DERNIERE question du chapitre." : ""}
${isFollowUp ? `C'est la sous-question ${followUpCount + 1} (max ${MAX_FOLLOWUPS} sous-questions par question principale).` : ""}
${followUpCount >= MAX_FOLLOWUPS && isFollowUp ? "C'est la DERNIERE sous-question possible. Tu DOIS valider apres celle-ci et passer a nextQuestion." : ""}

Reponds UNIQUEMENT en JSON valide. Pas de texte, pas de markdown, juste {"feedback":"...","score":N,"criteria":{"pertinence":N,"profondeur":N,"creativite":N},"followUp":...,"nextQuestion":...,"isChapterComplete":...}`;

    let feedback: string;
    let score: 1 | 2 | 3;
    let criteria: { pertinence: 1 | 2 | 3; profondeur: 1 | 2 | 3; creativite: 1 | 2 | 3 } | undefined;
    let followUp: string | null = null;
    let nextQuestion: string | null = null;

    try {
      const raw = await generateText(systemPrompt, userPrompt, {
        maxTokens: 800,
        temperature: 0.5,
      });

      const parsed = parseAiJson(raw);
      if (!parsed) {
        console.error("[atelier] AI JSON parse failed:", raw.slice(0, 500));
        // Try to salvage useful feedback from the raw text
        const fallback = extractFallbackFromRaw(raw);
        if (fallback) {
          feedback = fallback.feedback;
          score = fallback.score;
        } else {
          feedback =
            "Le mentor reflechit... Ta reponse est enregistree ! Continue comme ca et developpe tes idees.";
          score = 2;
        }
        // Don't force a follow-up on parse failure — let the student move forward
        followUp = null;
      } else {
        const result = AiEvalResultSchema.safeParse(parsed);
        if (!result.success) {
          console.error(
            "[atelier] AI response validation failed:",
            result.error.message
          );
          feedback = (parsed.feedback as string) || "Merci pour ta reponse !";
          score = 2;
        } else {
          feedback = result.data.feedback;
          score = clampScore(result.data.score);
          if (result.data.criteria) {
            criteria = {
              pertinence: clampScore(result.data.criteria.pertinence),
              profondeur: clampScore(result.data.criteria.profondeur),
              creativite: clampScore(result.data.criteria.creativite),
            };
          }
          followUp = result.data.followUp || null;
          nextQuestion = result.data.nextQuestion || null;
        }
      }
    } catch (aiError) {
      console.error("[atelier] AI call failed:", aiError);
      feedback = "Un probleme technique est survenu, mais ta reponse est enregistree. Essaie de developper encore plus ta pensee.";
      score = 1;
      followUp = "Peux-tu reprendre et developper ta reponse ? Le mentor a besoin de plus de details pour t'aider.";
    }

    // Decide: follow-up or validate?
    const canFollowUp = followUpCount < MAX_FOLLOWUPS;

    // Force score 1 for lazy answers regardless of AI opinion
    if (isLazyAnswer && score > 1) {
      score = 1;
      if (criteria) {
        criteria.profondeur = 1;
      }
    }

    const shouldFollowUp =
      canFollowUp && score === 1 && followUp;
    // Also follow-up if score=2 but one criterion is 1
    const shouldSoftFollowUp =
      canFollowUp &&
      score === 2 &&
      followUp &&
      criteria &&
      (criteria.pertinence === 1 ||
        criteria.profondeur === 1 ||
        criteria.creativite === 1);

    const needsFollowUp = !!(shouldFollowUp || shouldSoftFollowUp);

    // Force validation only after MAX_FOLLOWUPS attempts
    const forceValidate =
      isFollowUp && followUpCount >= MAX_FOLLOWUPS;

    const willFollowUp = needsFollowUp && !forceValidate;

    // Record this exchange
    const newExchange: Exchange = {
      answer,
      feedback,
      score,
      criteria,
      followUp: willFollowUp ? followUp : null,
      answeredAt: new Date().toISOString(),
    };

    const updatedExchanges = [...exchangesSoFar, newExchange];

    // Update step
    const updatedSteps = [...chapter.steps];

    if (willFollowUp) {
      // Don't validate yet — set the follow-up question
      updatedSteps[stepIndex] = {
        ...currentStep,
        answer: isFollowUp ? currentStep.answer : answer, // keep original main answer
        feedback,
        score,
        status: "pending",
        exchanges: updatedExchanges,
        currentFollowUp: followUp,
      };

      // Save and return — don't add next question yet
      const updatedChapters = [...session.chapters];
      updatedChapters[chapterIndex] = {
        ...chapter,
        steps: updatedSteps,
        status: "in-progress",
      };

      await updateAtelierSession(slug, id, {
        chapters: updatedChapters,
        currentChapter: chapterId,
      });

      return NextResponse.json({
        feedback,
        score,
        criteria,
        needsFollowUp: true,
        followUp,
        nextQuestion: null,
        isChapterComplete: false,
      });
    }

    // ── Validate the step ────────────────────────────────────────

    // Final score = best score across all exchanges
    const allScores = updatedExchanges.map((e) => e.score);
    const bestScore = Math.max(...allScores) as 1 | 2 | 3;

    updatedSteps[stepIndex] = {
      ...currentStep,
      answer: currentStep.answer || answer, // original answer
      feedback,
      score: bestScore,
      status: "validated",
      answeredAt: new Date().toISOString(),
      exchanges: updatedExchanges,
      currentFollowUp: null,
    };

    const validatedCount = updatedSteps.filter(
      (s) => s.status === "validated"
    ).length;

    const isComplete = validatedCount >= meta.questionCount;

    // Deduplicate nextQuestion
    if (nextQuestion) {
      const askedQuestions = new Set(
        chapter.steps.map((s) => s.question.toLowerCase().trim())
      );
      if (askedQuestions.has(nextQuestion.toLowerCase().trim())) {
        const allQuestions = getChapterQuestions(chapterId as ChapterId);
        nextQuestion =
          allQuestions.find(
            (q) => !askedQuestions.has(q.toLowerCase().trim())
          ) || null;
      }
    }

    // Add next question if not complete
    if (!isComplete && nextQuestion) {
      updatedSteps.push({
        stepId: `${chapterId}_q${validatedCount + 1}`,
        question: nextQuestion,
        answer: "",
        feedback: "",
        score: 0,
        status: "pending",
        answeredAt: null,
        exchanges: [],
        currentFollowUp: null,
      });
    } else if (!isComplete && !nextQuestion) {
      const askedQuestions = new Set(
        updatedSteps.map((s) => s.question.toLowerCase().trim())
      );
      const allQuestions = getChapterQuestions(chapterId as ChapterId);
      const fallbackQ = allQuestions.find(
        (q) => !askedQuestions.has(q.toLowerCase().trim())
      );
      if (fallbackQ) {
        updatedSteps.push({
          stepId: `${chapterId}_q${validatedCount + 1}`,
          question: fallbackQ,
          answer: "",
          feedback: "",
          score: 0,
          status: "pending",
          answeredAt: null,
          exchanges: [],
          currentFollowUp: null,
        });
      }
    }

    // Scores
    const chapterTotalScore = updatedSteps
      .filter((s) => s.status === "validated")
      .reduce((sum, s) => sum + s.score, 0);
    const badge = isComplete
      ? computeBadge(chapterTotalScore, chapter.maxScore)
      : null;

    // Update chapters array
    const updatedChapters = [...session.chapters];
    updatedChapters[chapterIndex] = {
      ...chapter,
      steps: updatedSteps,
      totalScore: chapterTotalScore,
      status: isComplete ? "completed" : "in-progress",
      badge,
    };

    // Unlock next chapter
    if (isComplete) {
      const nextChapterId =
        CHAPTER_IDS[CHAPTER_IDS.indexOf(chapterId as ChapterId) + 1];
      if (nextChapterId) {
        const nextIdx = updatedChapters.findIndex(
          (ch) => ch.chapterId === nextChapterId
        );
        if (nextIdx >= 0 && updatedChapters[nextIdx].status === "locked") {
          updatedChapters[nextIdx] = {
            ...updatedChapters[nextIdx],
            status: "unlocked",
          };
        }
      }
    }

    // Session totals
    const sessionTotalScore = updatedChapters.reduce(
      (sum, ch) => sum + ch.totalScore,
      0
    );
    const sessionMaxScore = updatedChapters.reduce(
      (sum, ch) => sum + ch.maxScore,
      0
    );

    const currentChapter = isComplete
      ? CHAPTER_IDS[
          Math.min(
            CHAPTER_IDS.indexOf(chapterId as ChapterId) + 1,
            CHAPTER_IDS.length - 1
          )
        ]
      : chapterId;

    // ── Streak logic ──────────────────────────────────────────────
    const previousStreak = session.streak || 0;
    let newStreak: number;
    if (bestScore >= 3) {
      newStreak = previousStreak + 1;
    } else {
      newStreak = 0;
    }
    const newBestStreak = Math.max(session.bestStreak || 0, newStreak);

    await updateAtelierSession(slug, id, {
      chapters: updatedChapters,
      totalScore: sessionTotalScore,
      maxScore: sessionMaxScore,
      currentChapter,
      streak: newStreak,
      bestStreak: newBestStreak,
    });

    // ── Achievement check ─────────────────────────────────────────
    let newAchievements: string[] = [];
    try {
      const updatedSession = await getAtelierSession(slug, id);
      if (updatedSession) {
        const existing = await getAchievements(slug);
        const unlocked = checkAchievements(updatedSession, existing);
        for (const achId of unlocked) {
          await unlockAchievement(slug, achId);
        }
        newAchievements = unlocked;
      }
    } catch (achErr) {
      console.error("[atelier] Achievement check error:", achErr);
    }

    return NextResponse.json({
      feedback,
      score: bestScore,
      criteria,
      needsFollowUp: false,
      followUp: null,
      nextQuestion,
      isChapterComplete: isComplete,
      badge,
      streak: newStreak,
      previousStreak,
      newAchievements,
    });
  } catch (error) {
    console.error("[atelier] Evaluate error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Evaluation failed" },
      { status: 500 }
    );
  }
}
