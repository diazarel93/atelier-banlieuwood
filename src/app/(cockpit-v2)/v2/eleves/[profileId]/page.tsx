"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { BreadcrumbV2 } from "@/components/v2/breadcrumb";
import { GlassCardV2 } from "@/components/v2/glass-card";
import { StatRing } from "@/components/v2/stat-ring";
import { ProfileHero } from "@/components/v2/student-profile/profile-hero";
import { ScoreEvolutionChart } from "@/components/v2/student-profile/score-evolution-chart";
import { ResponseHistoryList } from "@/components/v2/student-profile/response-history-list";
import { AchievementGrid } from "@/components/v2/student-profile/achievement-grid";
import { NotesPanel } from "@/components/v2/student-profile/notes-panel";
import {
  useStudentProfile,
  useCreateNote,
  useDeleteNote,
} from "@/hooks/use-student-profiles";
import { AXES } from "@/lib/axes-mapping";

export default function EleveDetailPage() {
  const params = useParams();
  const profileId = params.profileId as string;

  const { data: profile, isLoading, isError } = useStudentProfile(profileId);
  const createNote = useCreateNote(profileId);
  const deleteNote = useDeleteNote(profileId);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-8">
        <BreadcrumbV2
          items={[
            { label: "Élèves", href: "/v2/eleves" },
            { label: "Chargement..." },
          ]}
        />
        <div className="space-y-4 mt-4">
          <div className="h-24 rounded-2xl bg-white shimmer" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
              <div className="h-48 rounded-2xl bg-white shimmer" />
              <div className="h-64 rounded-2xl bg-white shimmer" />
            </div>
            <div className="lg:col-span-4 space-y-4">
              <div className="h-40 rounded-2xl bg-white shimmer" />
              <div className="h-32 rounded-2xl bg-white shimmer" />
              <div className="h-48 rounded-2xl bg-white shimmer" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-8">
        <BreadcrumbV2
          items={[
            { label: "Élèves", href: "/v2/eleves" },
            { label: "Erreur" },
          ]}
        />
        <GlassCardV2 className="p-8 text-center mt-4">
          <p className="text-bw-muted text-sm mb-4">
            Élève introuvable ou erreur de chargement
          </p>
          <Link
            href="/v2/eleves"
            className="rounded-lg border border-[var(--color-bw-border)] px-4 py-2 text-sm font-medium text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors"
          >
            Retour aux élèves
          </Link>
        </GlassCardV2>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-8">
      <BreadcrumbV2
        items={[
          { label: "Élèves", href: "/v2/eleves" },
          { label: profile.displayName },
        ]}
      />

      <div className="space-y-6 mt-4">
        {/* Hero */}
        <ProfileHero
          displayName={profile.displayName}
          avatar={profile.avatar}
          sessionCount={profile.sessionCount}
          totalResponses={profile.totalResponses}
        />

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left — graphs and history */}
          <div className="lg:col-span-8 space-y-6">
            <ScoreEvolutionChart
              sessions={profile.sessionHistory.map((sh) => ({
                date: sh.date,
                sessionTitle: sh.sessionTitle,
                scores: sh.scores,
              }))}
            />
            <ResponseHistoryList responses={profile.recentResponses} />
          </div>

          {/* Right — scores, badges, notes */}
          <div className="lg:col-span-4 space-y-6">
            {/* Current scores */}
            <GlassCardV2 className="p-4">
              <h3 className="text-xs font-semibold text-bw-heading uppercase tracking-wide mb-3">
                Scores actuels
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {AXES.map((axis) => (
                  <StatRing
                    key={axis.key}
                    value={profile.scores[axis.key]}
                    label={axis.label}
                    color={axis.color}
                    size={72}
                    strokeWidth={5}
                  />
                ))}
              </div>
            </GlassCardV2>

            {/* Achievements */}
            <AchievementGrid achievements={profile.achievements} />

            {/* Teacher notes */}
            <NotesPanel
              notes={profile.notes}
              onAdd={(noteType, content) =>
                createNote.mutate({ noteType, content })
              }
              onDelete={(noteId) => deleteNote.mutate(noteId)}
              isAdding={createNote.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
