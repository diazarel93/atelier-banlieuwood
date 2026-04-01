"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { BreadcrumbV2 } from "@/components/v2/breadcrumb";
import { GlassCardV2 } from "@/components/v2/glass-card";
import { ProfileHero } from "@/components/v2/student-profile/profile-hero";
import { ScoreEvolutionChart } from "@/components/v2/student-profile/score-evolution-chart";
import { ResponseHistoryList } from "@/components/v2/student-profile/response-history-list";
import { AchievementGrid } from "@/components/v2/student-profile/achievement-grid";
import { NotesPanel } from "@/components/v2/student-profile/notes-panel";
import { PortfolioSection } from "@/components/v2/student-profile/portfolio-section";
import { useStudentProfile, useCreateNote, useDeleteNote, useUpdateStudentName } from "@/hooks/use-student-profiles";
import { ProgressionChart } from "@/components/v2/student-profile/progression-chart";

export default function EleveDetailPage() {
  const params = useParams();
  const profileId = params.profileId as string;

  const { data: profile, isLoading, isError } = useStudentProfile(profileId);
  const createNote = useCreateNote(profileId);
  const deleteNote = useDeleteNote(profileId);
  const updateName = useUpdateStudentName(profileId);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-6">
        <BreadcrumbV2 items={[{ label: "Élèves", href: ROUTES.eleves }, { label: "Chargement..." }]} />
        <div className="space-y-4 mt-4">
          <div className="h-20 rounded-2xl bg-card shimmer" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-48 rounded-2xl bg-card shimmer" />
              <div className="h-56 rounded-2xl bg-card shimmer" />
            </div>
            <div className="space-y-4">
              <div className="h-32 rounded-2xl bg-card shimmer" />
              <div className="h-48 rounded-2xl bg-card shimmer" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-6">
        <BreadcrumbV2 items={[{ label: "Élèves", href: ROUTES.eleves }, { label: "Erreur" }]} />
        <GlassCardV2 className="p-8 text-center mt-4">
          <p className="text-bw-muted text-sm mb-4">Élève introuvable ou erreur de chargement</p>
          <Link
            href={ROUTES.eleves}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-bw-border)] px-4 py-2 text-sm font-medium text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors"
          >
            Retour aux élèves
          </Link>
        </GlassCardV2>
      </div>
    );
  }

  const hasData = profile.sessionHistory.length > 0 || profile.recentResponses.length > 0;

  const hasPortfolio =
    profile.portfolio.personnage ||
    profile.portfolio.pitch ||
    profile.portfolio.talentCard ||
    profile.portfolio.filmRole;

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-6">
      <BreadcrumbV2 items={[{ label: "Élèves", href: ROUTES.eleves }, { label: profile.displayName }]} />

      <div className="space-y-5 mt-4">
        {/* Hero — with creative profile, tags, deltas */}
        <ProfileHero
          displayName={profile.displayName}
          avatar={profile.avatar}
          sessionCount={profile.sessionCount}
          totalResponses={profile.totalResponses}
          scores={profile.scores}
          deltas={profile.deltas}
          creativeProfile={profile.creativeProfile}
          avgAiScore={profile.avgAiScore}
          avgResponseTimeMs={profile.avgResponseTimeMs}
          facilitatorTags={profile.facilitatorTags}
          lastActiveAt={
            profile.sessionHistory.length > 0
              ? profile.sessionHistory[profile.sessionHistory.length - 1].date
              : undefined
          }
          onRename={(newName) => updateName.mutate(newName)}
          isRenaming={updateName.isPending}
        />

        {/* Standalone progression chart — self-fetches data */}
        <ProgressionChart studentId={profileId} />

        {!hasData ? (
          /* ── Empty state — single card when no data at all ── */
          <GlassCardV2 className="p-8">
            <div className="flex flex-col items-center text-center max-w-sm mx-auto">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-bw-surface-dim)] mb-4">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="text-bw-muted"
                >
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <h3 className="text-heading-xs text-bw-heading mb-1">Profil en attente</h3>
              <p className="text-body-sm text-bw-muted mb-4">
                Les scores, réponses et badges de {profile.displayName} apparaîtront après sa première participation à
                une séance.
              </p>
              <Link
                href={ROUTES.seanceNew}
                className="inline-flex items-center gap-1.5 rounded-xl bg-bw-primary px-4 py-2 text-sm font-semibold text-white hover:bg-bw-primary-500 active:scale-[0.97] transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Lancer une séance
              </Link>
            </div>

            {/* Notes still available even when no data */}
            <div className="mt-6 pt-5 border-t border-[var(--color-bw-border-subtle)]">
              <NotesPanel
                notes={profile.notes}
                onAdd={(noteType, content) => createNote.mutate({ noteType, content })}
                onDelete={(noteId) => deleteNote.mutate(noteId)}
                isAdding={createNote.isPending}
              />
            </div>
          </GlassCardV2>
        ) : (
          /* ── Two-column layout when there is data ── */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left — graphs and history */}
            <div className="lg:col-span-2 space-y-5">
              <ScoreEvolutionChart
                sessions={profile.sessionHistory.map((sh) => ({
                  date: sh.date,
                  sessionTitle: sh.sessionTitle,
                  scores: sh.scores,
                }))}
              />
              <ResponseHistoryList responses={profile.recentResponses} />

              {/* Attendance history */}
              {profile.sessionHistory.length > 0 && (
                <GlassCardV2 className="p-5">
                  <h2 className="label-caps mb-3">Historique de présence</h2>
                  <div className="flex flex-col gap-2">
                    {profile.sessionHistory.map((sh) => (
                      <div
                        key={sh.sessionId}
                        className="flex items-center justify-between rounded-lg border border-[var(--color-bw-border-subtle)] px-3 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-heading-xs text-bw-heading truncate">{sh.sessionTitle}</p>
                          <p className="text-body-xs text-bw-muted tabular-nums">
                            {new Date(sh.date).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                            {sh.classLabel && <span className="ml-2 text-bw-muted">· {sh.classLabel}</span>}
                          </p>
                        </div>
                        <span className="shrink-0 ml-3 inline-flex items-center gap-1 rounded-full bg-bw-teal-50 px-2.5 py-0.5 text-xs font-semibold text-bw-teal-700">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                            <path
                              d="M2 5l2 2 4-4"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Présent
                        </span>
                      </div>
                    ))}
                  </div>
                </GlassCardV2>
              )}
            </div>

            {/* Right — portfolio + badges + notes */}
            <div className="space-y-5">
              {hasPortfolio && <PortfolioSection portfolio={profile.portfolio} />}
              <AchievementGrid achievements={profile.achievements} />
              <NotesPanel
                notes={profile.notes}
                onAdd={(noteType, content) => createNote.mutate({ noteType, content })}
                onDelete={(noteId) => deleteNote.mutate(noteId)}
                isAdding={createNote.isPending}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
