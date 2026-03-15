"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { GlassCardV2 } from "@/components/v2/glass-card";
import { BreadcrumbV2 } from "@/components/v2/breadcrumb";
import { useSessionDetail } from "@/hooks/use-session-detail";
import { useConfirmAction } from "@/hooks/use-confirm-action";
import { SessionHeroStrip } from "@/components/v2/session-detail/session-hero-strip";
import { SessionActionBar } from "@/components/v2/session-detail/session-action-bar";
import { QrJoinCard } from "@/components/v2/session-detail/qr-join-card";
import { StudentListCard } from "@/components/v2/session-detail/student-list-card";
import { ModuleProgressionCard } from "@/components/v2/session-detail/module-progression-card";
import { PedagogicalObjectivesCard } from "@/components/v2/session-detail/pedagogical-objectives-card";
import { FacilitatorTipsCard } from "@/components/v2/session-detail/facilitator-tips-card";
import { CinemaReferencesCard } from "@/components/v2/session-detail/cinema-references-card";
import { PreSessionChecklistV2 } from "@/components/v2/session-detail/pre-session-checklist-v2";
import { ProjectionOverlay } from "@/components/v2/session-detail/projection-overlay";
import { InterSessionCard } from "@/components/v2/session-detail/inter-session-card";
import { LiveParticipationCard } from "@/components/v2/session-detail/live-participation-card";
import { SessionAxesPreview } from "@/components/v2/session-detail/session-axes-preview";
import { SessionEditDialog } from "@/components/v2/session-detail/session-edit-dialog";
import { TeacherNotesCard } from "@/components/v2/session-detail/teacher-notes-card";
import { ConfirmModal } from "@/components/confirm-modal";

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [projectionMode, setProjectionMode] = useState(false);
  const [checklistDismissed, setChecklistDismissed] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const {
    session,
    isLoading,
    isError,
    error,
    currentModule,
    currentPhase,
    guide,
    sessionState,
    joinUrl,
    activeStudents,
    demoStudents,
    realStudents,
    hasDemoStudents,
    activateDemo,
    deactivateDemo,
    duplicateSession,
    updateSession,
    archiveSession,
    updateNotes,
  } = useSessionDetail(id);

  const archiveConfirm = useConfirmAction();

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-8">
        <BreadcrumbV2 items={[{ label: "Séances", href: ROUTES.seances }]} />
        <div className="space-y-4 mt-4">
          <div className="h-48 rounded-2xl bg-card shimmer" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
              <div className="h-40 rounded-2xl bg-card shimmer" />
              <div className="h-64 rounded-2xl bg-card shimmer" />
            </div>
            <div className="lg:col-span-4 space-y-4">
              <div className="h-40 rounded-2xl bg-card shimmer" />
              <div className="h-48 rounded-2xl bg-card shimmer" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !session || !sessionState) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-8">
        <BreadcrumbV2 items={[{ label: "Séances", href: ROUTES.seances }]} />
        <GlassCardV2 className="p-8 text-center mt-4">
          <p className="text-bw-muted text-sm mb-4">
            Session introuvable ou erreur de chargement
          </p>
          {error && (
            <p className="text-xs text-red-400 mb-4 font-mono">
              {error.message}
            </p>
          )}
          <Link
            href={ROUTES.seances}
            className="rounded-lg border border-[var(--color-bw-border)] px-4 py-2 text-sm font-medium text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors"
          >
            Retour aux seances
          </Link>
        </GlassCardV2>
      </div>
    );
  }

  // Projection overlay (fullscreen dark for videoprojecteur)
  if (projectionMode) {
    return (
      <ProjectionOverlay
        joinCode={session.join_code}
        joinUrl={joinUrl}
        activeStudents={activeStudents}
        onClose={() => setProjectionMode(false)}
      />
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-8">
      <BreadcrumbV2
        items={[
          { label: "Séances", href: ROUTES.seances },
          { label: session.title },
        ]}
      />

      <div className="space-y-6 mt-4">
        {/* Hero strip */}
        <SessionHeroStrip
          title={session.title}
          level={session.level}
          activeStudentCount={activeStudents.length}
          currentModule={currentModule}
          currentPhase={currentPhase}
        />

        {/* Action bar */}
        <SessionActionBar
          sessionId={session.id}
          sessionState={sessionState}
          onProjection={() => setProjectionMode(true)}
          onDuplicate={() =>
            duplicateSession.mutateAsync()
              .then((newSession) => router.push(ROUTES.seanceDetail(newSession.id)))
              .catch(() => {})
          }
          isDuplicating={duplicateSession.isPending}
          onEdit={() => setEditOpen(true)}
          onArchive={() =>
            archiveConfirm.requestConfirm({
              title: "Archiver cette seance ?",
              description:
                "La seance sera archivee et n'apparaitra plus dans vos seances actives. Vous pourrez la retrouver dans l'onglet Archives.",
              confirmLabel: "Archiver",
              confirmVariant: "danger",
              action: async () => {
                await archiveSession.mutateAsync();
                router.push(ROUTES.seances);
              },
            })
          }
        />

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column -- pedagogical content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Inter-session actions (M6 scene generation, M8 points computation) */}
            {session.current_module && (
              <InterSessionCard sessionId={session.id} currentModule={session.current_module} />
            )}

            {/* Live participation -- visible only during live sessions */}
            {sessionState.phase === "live" && (
              <LiveParticipationCard
                respondedCount={
                  activeStudents.filter((s) =>
                    // rough heuristic: students with recent activity
                    s.is_active
                  ).length
                }
                totalStudents={activeStudents.length}
              />
            )}

            {/* Axes preview -- visible when session is done or has scores */}
            {(sessionState.phase === "done" || sessionState.phase === "paused") && (
              <SessionAxesPreview sessionId={session.id} />
            )}

            {/* Pedagogical objectives */}
            {guide && <PedagogicalObjectivesCard guide={guide} />}

            {/* Module progression */}
            <ModuleProgressionCard
              completedModules={session.completed_modules || []}
              currentModule={currentModule}
            />

            {/* Facilitator tips */}
            {guide && <FacilitatorTipsCard guide={guide} />}

            {/* Cinema references */}
            <CinemaReferencesCard />
          </div>

          {/* Right column -- sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Student list */}
            <StudentListCard
              activeStudents={activeStudents}
              demoStudents={demoStudents}
              realStudents={realStudents}
              hasDemoStudents={hasDemoStudents}
              activateDemo={activateDemo}
              deactivateDemo={deactivateDemo}
            />

            {/* QR Code join */}
            <QrJoinCard joinCode={session.join_code} joinUrl={joinUrl} />

            {/* Thematique */}
            {session.thematique && (
              <GlassCardV2 variant="flat" className="p-4">
                <p className="text-xs text-bw-muted font-medium mb-1">
                  Thematique
                </p>
                <p className="text-sm text-bw-heading">{session.thematique}</p>
              </GlassCardV2>
            )}

            {/* Teacher notes */}
            <TeacherNotesCard
              notes={session.teacher_notes ?? null}
              onSave={(notes) => updateNotes.mutate(notes)}
              isSaving={updateNotes.isPending}
            />
          </div>
        </div>
      </div>

      {/* Pre-session checklist -- floating, appears when waiting */}
      {sessionState.phase === "waiting" && !checklistDismissed && (
        <PreSessionChecklistV2
          connectedCount={activeStudents.length}
          moduleSelected={!!currentModule}
          moduleName={currentModule?.title}
          joinCode={session.join_code}
          onDismiss={() => setChecklistDismissed(true)}
        />
      )}

      {/* Edit session dialog */}
      <SessionEditDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={(payload) => {
          updateSession.mutateAsync(payload)
            .then(() => setEditOpen(false))
            .catch(() => {});
        }}
        isPending={updateSession.isPending}
        initial={{
          title: session.title,
          class_label: session.class_label,
          level: session.level,
          scheduled_at: session.scheduled_at,
          thematique: session.thematique,
        }}
      />

      {/* Archive confirmation modal */}
      <ConfirmModal {...archiveConfirm} />
    </div>
  );
}
