"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BreadcrumbV2 } from "@/components/v2/breadcrumb";
import { StudentClassTable } from "@/components/v2/student-class-table";
import { EmptyState } from "@/components/v2/empty-state";
import { useStudentProfiles } from "@/hooks/use-student-profiles";
import { useDashboardSummary } from "@/hooks/use-dashboard-v2";

function getActivityStatus(lastActiveAt: string) {
  const diffDays =
    (Date.now() - new Date(lastActiveAt).getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays < 7) return "Actif";
  if (diffDays < 30) return "Récent";
  return "Inactif";
}

export default function ElevesPage() {
  const [classLabel, setClassLabel] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data: dashData } = useDashboardSummary();
  const classLabels = dashData?.classLabels || [];

  const { data, isLoading, isError } = useStudentProfiles(classLabel);
  const profiles = data?.profiles || [];

  const filtered = search
    ? profiles.filter((p) =>
        p.displayName.toLowerCase().includes(search.toLowerCase())
      )
    : profiles;

  function handleExportCsv() {
    if (filtered.length === 0) return;
    const header = [
      "Élève",
      "Classe",
      "Séances",
      "Réponses",
      "Dernière activité",
      "Statut",
    ];
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
          <h1 className="text-xl font-bold text-bw-heading">Mes élèves</h1>
          <p className="text-sm text-bw-muted mt-0.5">
            {profiles.length} élève{profiles.length !== 1 ? "s" : ""} au total
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un élève..."
            className="rounded-lg border border-[var(--color-bw-border)] bg-white px-3 py-1.5 text-sm text-bw-heading placeholder:text-bw-muted focus:outline-none focus:ring-2 focus:ring-bw-primary/30 w-48"
          />
          {classLabels.length > 0 && (
            <select
              value={classLabel ?? ""}
              onChange={(e) => setClassLabel(e.target.value || null)}
              className="rounded-lg border border-[var(--color-bw-border)] bg-white px-3 py-1.5 text-sm text-bw-heading focus:outline-none focus:ring-2 focus:ring-bw-primary/30"
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
              className="rounded-lg border border-[var(--color-bw-border)] px-3 py-1.5 text-xs font-medium text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors cursor-pointer"
            >
              Exporter CSV
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-12 rounded-2xl bg-white shimmer" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 rounded-xl bg-white shimmer" />
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
            onClick: () => window.location.reload(),
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
          action={{ label: "Créer une séance", href: "/v2/seances/new" }}
        />
      ) : (
        <StudentClassTable students={filtered} />
      )}
    </div>
  );
}
