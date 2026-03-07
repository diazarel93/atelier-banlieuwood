"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { SessionPrepSidebar } from "@/components/v2/session-prep-sidebar";
import { ModuleSequenceEditor } from "@/components/v2/module-sequence-editor";
import { GlassCardV2 } from "@/components/v2/glass-card";
import { BreadcrumbV2 } from "@/components/v2/breadcrumb";
import { getSessionState } from "@/lib/session-state";
import { MODULES, PHASES } from "@/lib/modules-data";

interface SessionDetail {
  id: string;
  title: string;
  status: string;
  level: string;
  join_code: string;
  template: string | null;
  scheduled_at: string | null;
  class_label: string | null;
  completed_modules: string[];
  current_module: number;
  current_seance: number;
}

export default function SessionPreparePage() {
  const params = useParams();
  const id = params.id as string;

  const { data: session, isLoading, isError } = useQuery<SessionDetail>({
    queryKey: ["session", id],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${id}`);
      if (!res.ok) throw new Error("Session introuvable");
      return res.json();
    },
  });

  const baseCrumbs = [{ label: "Séances", href: "/v2/seances" }];

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-8">
        <BreadcrumbV2 items={baseCrumbs} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
          <div className="lg:col-span-3 h-64 rounded-2xl bg-white shimmer" />
          <div className="lg:col-span-9 h-96 rounded-2xl bg-white shimmer" />
        </div>
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-8">
        <BreadcrumbV2 items={baseCrumbs} />
        <GlassCardV2 className="p-8 text-center mt-4">
          <p className="text-bw-muted text-sm mb-4">Session introuvable ou erreur de chargement</p>
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

  // Main parcours modules
  const mainPhaseIds = ["idea", "emotion", "imagination", "collectif", "scenario"];
  const mainModuleIds = PHASES.filter((p) => mainPhaseIds.includes(p.id))
    .flatMap((p) => p.moduleIds);
  const mainModules = mainModuleIds
    .map((id) => MODULES.find((m) => m.id === id))
    .filter((m): m is (typeof MODULES)[number] => m !== undefined);

  const ss = getSessionState(session.status);

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-8">
      <BreadcrumbV2 items={[
        { label: "Séances", href: "/v2/seances" },
        { label: session.title, href: `/v2/seances/${session.id}` },
        { label: "Préparation" },
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
        {/* Sidebar */}
        <div className="lg:col-span-3">
          <div className="sticky top-20 flex flex-col gap-4">
            <SessionPrepSidebar
              title={session.title}
              classLabel={session.class_label}
              level={session.level}
              joinCode={session.join_code}
              scheduledAt={session.scheduled_at}
              status={session.status}
            />

            {/* Primary CTA */}
            {ss.canPilot && (
              <Link
                href={`/session/${session.id}/pilot`}
                className="flex items-center justify-center gap-2 rounded-xl bg-bw-primary py-3 text-sm font-semibold text-white hover:bg-bw-primary-500 transition-colors btn-glow"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 2l10 6-10 6V2z" fill="currentColor" />
                </svg>
                {ss.ctaLabel}
              </Link>
            )}
            {ss.canViewResults && (
              <Link
                href={`/v2/seances/${session.id}/results`}
                className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-bw-border)] py-3 text-sm font-semibold text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors"
              >
                {ss.ctaLabel}
              </Link>
            )}
          </div>
        </div>

        {/* Main: module sequence */}
        <div className="lg:col-span-9">
          <h2 className="text-lg font-bold text-bw-heading mb-1">
            Structure narrative
          </h2>
          <p className="text-sm text-bw-muted mb-4">
            {mainModules.length} modules — parcours principal
          </p>

          <ModuleSequenceEditor
            modules={mainModules}
            completedModuleIds={session.completed_modules || []}
          />
        </div>
      </div>
    </div>
  );
}

