"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { GlassCardV2 } from "@/components/v2/glass-card";
import { BreadcrumbV2 } from "@/components/v2/breadcrumb";
import { useSessionDetail } from "@/hooks/use-session-detail";
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

export default function SessionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [projectionMode, setProjectionMode] = useState(false);
  const [checklistDismissed, setChecklistDismissed] = useState(false);

  const {
    session,
    isLoading,
    isError,
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
  } = useSessionDetail(id);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-8">
        <BreadcrumbV2 items={[{ label: "Séances", href: "/v2/seances" }]} />
        <div className="space-y-4 mt-4">
          <div className="h-48 rounded-2xl bg-white shimmer" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
              <div className="h-40 rounded-2xl bg-white shimmer" />
              <div className="h-64 rounded-2xl bg-white shimmer" />
            </div>
            <div className="lg:col-span-4 space-y-4">
              <div className="h-40 rounded-2xl bg-white shimmer" />
              <div className="h-48 rounded-2xl bg-white shimmer" />
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
        <BreadcrumbV2 items={[{ label: "Séances", href: "/v2/seances" }]} />
        <GlassCardV2 className="p-8 text-center mt-4">
          <p className="text-bw-muted text-sm mb-4">
            Session introuvable ou erreur de chargement
          </p>
          <Link
            href="/v2/seances"
            className="rounded-lg border border-[var(--color-bw-border)] px-4 py-2 text-sm font-medium text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors"
          >
            Retour aux séances
          </Link>
        </GlassCardV2>
      </div>
    );
  }

  // Projection overlay (fullscreen dark for vidéoprojecteur)
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
          { label: "Séances", href: "/v2/seances" },
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
        />

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column — pedagogical content */}
          <div className="lg:col-span-8 space-y-6">
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

          {/* Right column — sidebar */}
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

            {/* Thématique */}
            {session.thematique && (
              <GlassCardV2 variant="flat" className="p-4">
                <p className="text-xs text-bw-muted font-medium mb-1">
                  Thématique
                </p>
                <p className="text-sm text-bw-heading">{session.thematique}</p>
              </GlassCardV2>
            )}
          </div>
        </div>
      </div>

      {/* Pre-session checklist — floating, appears when waiting */}
      {sessionState.phase === "waiting" && !checklistDismissed && (
        <PreSessionChecklistV2
          connectedCount={activeStudents.length}
          moduleSelected={!!currentModule}
          moduleName={currentModule?.title}
          joinCode={session.join_code}
          onDismiss={() => setChecklistDismissed(true)}
        />
      )}
    </div>
  );
}
