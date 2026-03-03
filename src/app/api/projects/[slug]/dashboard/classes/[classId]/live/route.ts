import { NextResponse } from "next/server";
import {
  getClassStudentsWithSessions,
  IDLE_MINUTES,
  STRUGGLING_SCORE_THRESHOLD,
  STRUGGLING_MIN_ANSWERS,
} from "@/lib/storage/dashboard-store";
import {
  CHAPTER_META,
  TOTAL_QUESTIONS,
  type ChapterId,
} from "@/lib/models/atelier";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; classId: string }> }
) {
  const { slug, classId } = await params;
  const students = await getClassStudentsWithSessions(slug, classId);

  const snapshot = students.map((s) => {
    const session = s.session;
    if (!session) {
      return {
        studentId: s.id,
        displayName: s.displayName,
        avatar: s.avatar,
        status: "not-started" as const,
        currentChapter: null,
        currentChapterLabel: null,
        currentQuestion: null,
        totalAnswered: 0,
        totalQuestions: TOTAL_QUESTIONS,
        totalScore: 0,
        avgScore: 0,
        lastActivity: s.joinedAt,
        streak: 0,
        bestStreak: 0,
        badges: [],
      };
    }

    // Single pass through chapters to compute all stats
    let answeredCount = 0;
    let lastActivity = session.updatedAt;
    let currentChapterId: string | null = null;
    let currentQuestionNum = 0;
    const badges: Array<{ chapter: string; badge: string | null }> = [];

    for (const ch of session.chapters) {
      let chAnswered = 0;
      for (const step of ch.steps) {
        if (step.status === "validated") {
          chAnswered++;
          // Check last activity in one pass
          if (step.answeredAt && step.answeredAt > lastActivity) {
            lastActivity = step.answeredAt;
          }
        }
        // Check exchanges too
        for (const ex of step.exchanges) {
          if (ex.answeredAt && ex.answeredAt > lastActivity) {
            lastActivity = ex.answeredAt;
          }
        }
      }
      answeredCount += chAnswered;

      if (ch.badge) {
        badges.push({ chapter: ch.chapterId, badge: ch.badge });
      }

      // Track current chapter (first in-progress or unlocked)
      if (
        !currentChapterId &&
        (ch.status === "in-progress" || ch.status === "unlocked")
      ) {
        currentChapterId = ch.chapterId;
        currentQuestionNum = chAnswered + 1;
      }
    }

    const avgScore =
      answeredCount > 0 ? session.totalScore / answeredCount : 0;

    // Determine status
    const minutesSinceActivity =
      (Date.now() - new Date(lastActivity).getTime()) / 60000;
    let status: "active" | "struggling" | "idle" | "not-started" = "active";
    if (minutesSinceActivity > IDLE_MINUTES) {
      status = "idle";
    } else if (
      avgScore < STRUGGLING_SCORE_THRESHOLD &&
      answeredCount > STRUGGLING_MIN_ANSWERS
    ) {
      status = "struggling";
    }

    return {
      studentId: s.id,
      displayName: s.displayName,
      avatar: s.avatar,
      status,
      currentChapter: currentChapterId,
      currentChapterLabel: currentChapterId
        ? CHAPTER_META[currentChapterId as ChapterId]?.label ?? null
        : null,
      currentQuestion: currentQuestionNum,
      totalAnswered: answeredCount,
      totalQuestions: TOTAL_QUESTIONS,
      totalScore: session.totalScore,
      avgScore: Math.round(avgScore * 10) / 10,
      lastActivity,
      streak: session.streak || 0,
      bestStreak: session.bestStreak || 0,
      badges,
    };
  });

  // Global class stats
  const activeCount = snapshot.filter((s) => s.status === "active").length;
  const totalAnswered = snapshot.reduce((s, st) => s + st.totalAnswered, 0);
  const avgProgress =
    snapshot.length > 0
      ? Math.round(
          snapshot.reduce(
            (s, st) => s + (st.totalAnswered / st.totalQuestions) * 100,
            0
          ) / snapshot.length
        )
      : 0;

  return NextResponse.json({
    students: snapshot,
    stats: {
      totalStudents: snapshot.length,
      activeCount,
      avgProgress,
      totalAnswered,
    },
  });
}
