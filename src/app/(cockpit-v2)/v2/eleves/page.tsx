"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BreadcrumbV2 } from "@/components/v2/breadcrumb";
import { StudentClassTable } from "@/components/v2/student-class-table";
import { EmptyState } from "@/components/v2/empty-state";
import { ROUTES } from "@/lib/routes";
import { useStudentProfiles } from "@/hooks/use-student-profiles";
import { useDashboardSummary } from "@/hooks/use-dashboard-v2";

function getActivityStatus(lastActiveAt: string) {
  const diffDays = (Date.now() - new Date(lastActiveAt).getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays < 7) return "Actif";
  if (diffDays < 30) return "Récent";
  return "Inactif";
}

export default function ElevesPage() {
  const [classLabel, setClassLabel] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data: dashData } = useDashboardSummary();
  const classLabels = dashData?.classLabels || [];

  const { data, isLoading, isError, refetch } = useStudentProfiles(classLabel);
  const profiles = data?.profiles || [];

  const filtered = search
    ? profiles.filter((p) => p.displayName.toLowerCase().includes(search.toLowerCase()))
    : profiles;

  function handleExportCsv() {
    if (filtered.length === 0) return;
    const header = ["Élève", "Classe", "Séances", "Réponses", "Dernière activité", "Statut"];
    const rows = filtered.map((p) => [
      p.displayName,
      p.classLabel || "Sans classe",
      p.sessionCount,
      p.totalResponses,
      new Date(p.lastActiveAt).toLocaleDateString("fr-FR"),
      getActivityStatus(p.lastActiveAt),
    ]);
    const csv = [header, ...rows].map((r) => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "eleves-banlieuwood.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé");
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-6">
      <BreadcrumbV2 items={[{ label: "Élèves" }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 mt-4">
        <div>
          <h1 className="text-heading-lg text-bw-heading">Mes élèves</h1>
          <p className="text-sm text-bw-muted mt-0.5">
            {profiles.length} élève{profiles.length !== 1 ? "s" : ""} au total
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-bw-muted"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un élève..."
              aria-label="Rechercher un élève"
              className="h-9 w-48 rounded-lg border border-[var(--color-bw-border)] bg-card pl-9 pr-8 text-sm text-bw-heading placeholder:text-bw-placeholder focus:outline-none focus:ring-2 focus:ring-bw-primary/30 focus:border-bw-primary transition-colors"
            />
            {search && (
              <button
                type="button"
                aria-label="Effacer la recherche"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-bw-muted hover:text-bw-heading transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
          {classLabels.length > 0 && (
            <select
              value={classLabel ?? ""}
              onChange={(e) => setClassLabel(e.target.value || null)}
              className="rounded-lg border border-[var(--color-bw-border)] bg-card px-3 py-1.5 text-sm text-bw-heading focus:outline-none focus:ring-2 focus:ring-bw-primary/30"
            >
              <option value="">Toutes les classes</option>
              {classLabels.map((cl) => (
                <option key={cl} value={cl}>
                  {cl}
                </option>
              ))}
            </select>
          )}
          {filtered.length > 0 && (
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-bw-border)] px-3 py-1.5 text-xs font-medium text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors cursor-pointer"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Exporter CSV
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-12 rounded-2xl bg-card shimmer" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 rounded-xl bg-card shimmer" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          }
          title="Erreur de chargement"
          description="Impossible de charger la liste des élèves."
          action={{
            label: "Réessayer",
            onClick: () => refetch(),
          }}
        />
      ) : profiles.length === 0 ? (
        <EmptyState
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          }
          title="Aucun élève"
          description="Les élèves apparaîtront ici après avoir rejoint une de vos séances."
          action={{ label: "Créer une séance", href: ROUTES.seanceNew }}
        />
      ) : (
        <StudentClassTable students={filtered} />
      )}
    </div>
  );
}
