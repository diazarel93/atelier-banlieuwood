"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { SessionPrepSidebar } from "@/components/v2/session-prep-sidebar";
import { GlassCardV2 } from "@/components/v2/glass-card";
import { BreadcrumbV2 } from "@/components/v2/breadcrumb";
import { getSessionState } from "@/lib/session-state";

interface SessionDetail {
  id: string;
  title: string;
  status: string;
  level: string;
  join_code: string;
  template: string | null;
  thematique: string | null;
  scheduled_at: string | null;
  class_label: string | null;
  created_at: string;
  studentCount: number;
}

export default function SessionDetailPage() {
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

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-8">
        <BreadcrumbV2 items={[{ label: "Séances", href: "/v2/seances" }]} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
          <div className="lg:col-span-4 h-64 rounded-2xl bg-white shimmer" />
          <div className="lg:col-span-8 h-48 rounded-2xl bg-white shimmer" />
        </div>
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-8">
        <BreadcrumbV2 items={[{ label: "Séances", href: "/v2/seances" }]} />
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

  const ss = getSessionState(session.status);

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-8">
      <BreadcrumbV2 items={[
        { label: "Séances", href: "/v2/seances" },
        { label: session.title },
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
        {/* Sidebar */}
        <div className="lg:col-span-4">
          <SessionPrepSidebar
            title={session.title}
            classLabel={session.class_label}
            level={session.level}
            joinCode={session.join_code}
            scheduledAt={session.scheduled_at}
            status={session.status}
          />
        </div>

        {/* Main */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <GlassCardV2 className="p-6">
            <h2 className="text-lg font-bold text-bw-heading mb-1">
              {session.title}
            </h2>
            <p className="text-sm text-bw-muted mb-4">
              {session.studentCount} élève{session.studentCount !== 1 ? "s" : ""} inscrit
              {session.studentCount !== 1 ? "s" : ""}
              {session.template && (
                <span className="ml-2 inline-flex items-center rounded-md bg-[var(--color-bw-surface-dim)] px-1.5 py-0.5 text-[11px] font-medium text-bw-muted">
                  {session.template}
                </span>
              )}
            </p>

            {/* Join code prominent display */}
            <div className="mb-6 rounded-xl bg-[var(--color-bw-surface-dim)] p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-bw-muted font-medium mb-0.5">Code d'accès élèves</p>
                <p className="text-2xl font-mono font-bold text-bw-primary tracking-[0.15em]">
                  {session.join_code}
                </p>
              </div>
              <div className="text-xs text-bw-muted text-right">
                <p>banlieuwood.fr/join</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {ss.canPilot && (
                <Link
                  href={`/session/${session.id}/pilot`}
                  className="rounded-lg bg-bw-primary px-4 py-2 text-sm font-semibold text-white hover:bg-bw-primary-500 transition-colors btn-glow"
                >
                  {ss.ctaLabel}
                </Link>
              )}
              {ss.canPrepare && (
                <Link
                  href={`/v2/seances/${session.id}/prepare`}
                  className="rounded-lg border border-[var(--color-bw-border)] px-4 py-2 text-sm font-medium text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors"
                >
                  Préparer
                </Link>
              )}
              {ss.canViewResults && (
                <>
                  <Link
                    href={`/v2/seances/${session.id}/prepare`}
                    className="rounded-lg border border-[var(--color-bw-border)] px-4 py-2 text-sm font-medium text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors"
                  >
                    Revoir la structure
                  </Link>
                  <Link
                    href={`/session/${session.id}/results`}
                    className="rounded-lg border border-[var(--color-bw-border)] px-4 py-2 text-sm font-medium text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors"
                  >
                    {ss.ctaLabel}
                  </Link>
                </>
              )}
            </div>
          </GlassCardV2>

          {/* Thématique if set */}
          {session.thematique && (
            <GlassCardV2 variant="flat" className="p-4">
              <p className="text-xs text-bw-muted font-medium mb-1">Thématique</p>
              <p className="text-sm text-bw-heading">{session.thematique}</p>
            </GlassCardV2>
          )}
        </div>
      </div>
    </div>
  );
}

