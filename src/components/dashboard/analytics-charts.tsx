"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  CHAPTER_IDS,
  CHAPTER_META,
  TOTAL_QUESTIONS,
  type ChapterId,
} from "@/lib/models/atelier";
import type { StudentWithSession } from "@/lib/storage/dashboard-store";
import { TrendingDown, TrendingUp, AlertTriangle, Star, Flame, Trophy } from "lucide-react";

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <Card className="p-4 flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}
      >
        {icon}
      </div>
      <div>
        <div className="text-2xl font-black">{value}</div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        {sub && (
          <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
        )}
      </div>
    </Card>
  );
}

function Bar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span>{label}</span>
        <span className="font-medium">{value.toFixed(1)}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function AnalyticsCharts({
  students,
}: {
  students: StudentWithSession[];
}) {
  // ── Compute analytics (memoized — expensive iteration) ──────
  const analytics = useMemo(() => {
    const withSessions = students.filter((s) => s.session);

    // Chapter difficulty (avg score per chapter)
    const chapterStats: Record<
      string,
      { totalScore: number; count: number; followUps: number }
    > = {};
    for (const id of CHAPTER_IDS) {
      chapterStats[id] = { totalScore: 0, count: 0, followUps: 0 };
    }
    for (const s of withSessions) {
      if (!s.session) continue;
      for (const ch of s.session.chapters) {
        for (const step of ch.steps) {
          if (step.status === "validated") {
            chapterStats[ch.chapterId].totalScore += step.score;
            chapterStats[ch.chapterId].count += 1;
            chapterStats[ch.chapterId].followUps += step.exchanges.length;
          }
        }
      }
    }

    const chapterAvgs = CHAPTER_IDS.map((id) => ({
      id,
      label: CHAPTER_META[id].label,
      icon: CHAPTER_META[id].icon,
      avg:
        chapterStats[id].count > 0
          ? chapterStats[id].totalScore / chapterStats[id].count
          : 0,
      followUps: chapterStats[id].followUps,
    }));

    const hardestChapter = [...chapterAvgs]
      .filter((c) => c.avg > 0)
      .sort((a, b) => a.avg - b.avg)[0];

    // Students struggling (avg < 1.5)
    const struggling = withSessions.filter((s) => {
      if (!s.session) return false;
      let total = 0;
      let count = 0;
      for (const ch of s.session.chapters) {
        for (const step of ch.steps) {
          if (step.status === "validated") {
            total += step.score;
            count++;
          }
        }
      }
      return count > 2 && total / count < 1.5;
    });

    // Stars (best avg score, min 5 answers)
    const starStudents = withSessions
      .map((s) => {
        if (!s.session) return { ...s, avg: 0, count: 0 };
        let total = 0;
        let count = 0;
        for (const ch of s.session.chapters) {
          for (const step of ch.steps) {
            if (step.status === "validated") {
              total += step.score;
              count++;
            }
          }
        }
        return { ...s, avg: count > 0 ? total / count : 0, count };
      })
      .filter((s) => s.count >= 5)
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 3);

    // Badge distribution per chapter
    const badgeDist: Record<string, { gold: number; silver: number; bronze: number }> = {};
    for (const id of CHAPTER_IDS) {
      badgeDist[id] = { gold: 0, silver: 0, bronze: 0 };
    }
    for (const s of withSessions) {
      if (!s.session) continue;
      for (const ch of s.session.chapters) {
        if (ch.badge) {
          badgeDist[ch.chapterId][ch.badge]++;
        }
      }
    }

    // Global stats
    const totalAnswered = withSessions.reduce((sum, s) => {
      if (!s.session) return sum;
      return (
        sum +
        s.session.chapters.reduce(
          (s2, ch) =>
            s2 + ch.steps.filter((st) => st.status === "validated").length,
          0
        )
      );
    }, 0);

    const bestStreak = withSessions.reduce((max, s) => {
      if (!s.session) return max;
      return Math.max(max, s.session.bestStreak || 0);
    }, 0);

    const maxBadgeStat = Math.max(
      ...CHAPTER_IDS.map(
        (id) => badgeDist[id].gold + badgeDist[id].silver + badgeDist[id].bronze
      ),
      1
    );

    return {
      chapterAvgs,
      hardestChapter,
      struggling,
      starStudents,
      badgeDist,
      totalAnswered,
      bestStreak,
      maxBadgeStat,
    };
  }, [students]);

  const {
    chapterAvgs,
    hardestChapter,
    struggling,
    starStudents,
    badgeDist,
    totalAnswered,
    bestStreak,
    maxBadgeStat,
  } = analytics;

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <StatCard
          icon={<Star className="h-5 w-5 text-accent" />}
          label="R\u00e9ponses totales"
          value={totalAnswered}
          color="bg-accent/10"
        />
        <StatCard
          icon={<Flame className="h-5 w-5 text-primary" />}
          label="Meilleure s\u00e9rie"
          value={bestStreak}
          color="bg-primary/10"
        />
        <StatCard
          icon={<TrendingDown className="h-5 w-5 text-destructive" />}
          label="En difficult\u00e9"
          value={struggling.length}
          sub={struggling.map((s) => s.displayName).join(", ") || "-"}
          color="bg-destructive/10"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-accent" />}
          label="Chapitre le + dur"
          value={hardestChapter?.icon || "-"}
          sub={hardestChapter?.label || "-"}
          color="bg-accent/10"
        />
      </div>

      {/* Score moyen par chapitre */}
      <Card className="p-5 space-y-3">
        <h3 className="font-semibold text-sm">Score moyen par chapitre</h3>
        {chapterAvgs.map((c) => (
          <Bar
            key={c.id}
            label={`${c.icon} ${c.label}`}
            value={c.avg}
            max={3}
            color={
              c.avg >= 2.5
                ? "bg-accent"
                : c.avg >= 1.5
                  ? "bg-primary"
                  : "bg-destructive"
            }
          />
        ))}
      </Card>

      {/* Badges par chapitre */}
      <Card className="p-5 space-y-3">
        <h3 className="font-semibold text-sm">Badges par chapitre</h3>
        {CHAPTER_IDS.map((id) => {
          const meta = CHAPTER_META[id];
          const d = badgeDist[id];
          const total = d.gold + d.silver + d.bronze;
          if (total === 0) return null;
          return (
            <div key={id} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>
                  {meta.icon} {meta.label}
                </span>
                <span>{total} badge{total > 1 ? "s" : ""}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden flex">
                {d.gold > 0 && (
                  <div
                    className="h-full bg-yellow-500"
                    style={{
                      width: `${(d.gold / maxBadgeStat) * 100}%`,
                    }}
                  />
                )}
                {d.silver > 0 && (
                  <div
                    className="h-full bg-gray-400"
                    style={{
                      width: `${(d.silver / maxBadgeStat) * 100}%`,
                    }}
                  />
                )}
                {d.bronze > 0 && (
                  <div
                    className="h-full bg-orange-600"
                    style={{
                      width: `${(d.bronze / maxBadgeStat) * 100}%`,
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-yellow-500" /> Or
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-gray-400" /> Argent
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-orange-600" /> Bronze
          </span>
        </div>
      </Card>

      {/* \u00c9l\u00e8ves stars */}
      {starStudents.length > 0 && (
        <Card className="p-5 space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            \u00c9l\u00e8ves stars
          </h3>
          <div className="space-y-2">
            {starStudents.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 text-sm">
                <span className="text-lg font-bold text-muted-foreground w-6">
                  {i + 1}.
                </span>
                <span className="text-lg">{s.avatar}</span>
                <span className="font-medium">{s.displayName}</span>
                <span className="text-muted-foreground ml-auto">
                  {s.avg.toFixed(1)}/3 ({s.count} rep.)
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
