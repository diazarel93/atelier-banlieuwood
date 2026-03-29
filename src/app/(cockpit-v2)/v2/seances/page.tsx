"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ROUTES } from "@/lib/routes";
import { SeanceTabs, type SeanceTab } from "@/components/v2/seance-tabs";
import { SeanceDayGroup } from "@/components/v2/seance-day-group";
import { SeanceCalendarSidebar } from "@/components/v2/seance-calendar-sidebar";
import { EmptyState } from "@/components/v2/empty-state";
import { getModuleById } from "@/lib/modules-data";
import { useConfirmAction } from "@/hooks/use-confirm-action";
import { ConfirmModal } from "@/components/confirm-modal";
import { toast } from "sonner";
import Link from "next/link";

interface Session {
  id: string;
  title: string;
  status: string;
  level: string;
  template: string | null;
  created_at: string;
  scheduled_at: string | null;
  class_label: string | null;
  studentCount: number;
  deleted_at: string | null;
}

async function fetchSessions(): Promise<Session[]> {
  const res = await fetch("/api/sessions");
  if (!res.ok) throw new Error("Erreur chargement séances");
  return res.json();
}

async function fetchArchivedSessions(): Promise<Session[]> {
  const res = await fetch("/api/sessions?archived=true");
  if (!res.ok) throw new Error("Erreur chargement archives");
  return res.json();
}

const ACTIVE_STATUSES = ["waiting", "responding", "reviewing", "voting", "paused"];

function getDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);
  const dStr = d.toISOString().slice(0, 10);

  if (dStr === today) return "Aujourd'hui";
  if (dStr === tomorrowStr) return "Demain";
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });
}

export default function SeancesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<SeanceTab>("upcoming");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const confirm = useConfirmAction();

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelected(new Set()), []);

  const handleBulkArchive = useCallback(() => {
    const count = selected.size;
    if (count === 0) return;
    confirm.requestConfirm({
      title: `Archiver ${count} séance${count > 1 ? "s" : ""} ?`,
      description: `${count} séance${count > 1 ? "s seront archivées" : " sera archivée"}. Vous pourrez les retrouver dans l'onglet Archives.`,
      confirmLabel: "Archiver",
      confirmVariant: "danger",
      action: async () => {
        const ids = [...selected];
        const results = await Promise.allSettled(ids.map((id) => fetch(`/api/sessions/${id}`, { method: "DELETE" })));
        const succeeded = results.filter((r) => r.status === "fulfilled" && (r.value as Response).ok).length;
        if (succeeded === ids.length) {
          toast.success(`${succeeded} séance${succeeded > 1 ? "s archivées" : " archivée"}`);
        } else {
          toast.error(`${succeeded}/${ids.length} archivées. Certaines ont échoué.`);
        }
        clearSelection();
        queryClient.invalidateQueries({ queryKey: ["sessions"] });
      },
    });
  }, [selected, confirm, clearSelection, queryClient]);

  // Active sessions (deleted_at IS NULL, enforced by RLS)
  const {
    data: sessions = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["sessions"],
    queryFn: fetchSessions,
    refetchInterval: 15_000,
  });

  // Archived (soft-deleted) sessions -- only fetched when tab is "archived"
  const { data: archivedSessions = [], isLoading: isLoadingArchived } = useQuery({
    queryKey: ["sessions", "archived"],
    queryFn: fetchArchivedSessions,
    enabled: tab === "archived",
  });

  // Auto-switch to "active" tab if there are active sessions on first load
  const autoSwitched = useRef(false);
  useEffect(() => {
    if (autoSwitched.current || isLoading) return;
    const activeCount = sessions.filter(
      (s) => s.status === "responding" || s.status === "voting" || s.status === "waiting",
    ).length;
    if (activeCount > 0 && tab === "upcoming") {
      setTab("active");
    }
    autoSwitched.current = true;
  }, [sessions, isLoading, tab]);

  const filtered = useMemo(() => {
    // For the archived tab, use the separate archived query
    if (tab === "archived") {
      let list = archivedSessions;
      if (search.trim()) {
        const q = search.toLowerCase();
        list = list.filter((s) => s.title.toLowerCase().includes(q) || s.class_label?.toLowerCase().includes(q));
      }
      return list;
    }

    let list = sessions;

    // Filter by tab -- exclusive logic, no overlap
    switch (tab) {
      case "upcoming":
        // Scheduled in the future OR waiting with a schedule date
        list = list.filter((s) => s.status !== "done" && s.scheduled_at && new Date(s.scheduled_at) > new Date());
        break;
      case "active":
        // Currently running (not waiting, not done)
        list = list.filter((s) => ACTIVE_STATUSES.includes(s.status) && s.status !== "waiting");
        break;
      case "draft":
        // Waiting sessions without a future schedule
        list = list.filter(
          (s) => s.status === "waiting" && (!s.scheduled_at || new Date(s.scheduled_at) <= new Date()),
        );
        break;
      case "done":
        list = list.filter((s) => s.status === "done");
        break;
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.title.toLowerCase().includes(q) || s.class_label?.toLowerCase().includes(q));
    }

    return list;
  }, [sessions, archivedSessions, tab, search]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, Session[]> = {};
    for (const s of filtered) {
      const dateKey = getDateLabel(s.scheduled_at || s.created_at);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(s);
    }
    return Object.entries(groups);
  }, [filtered]);

  // Tab counts -- must match filter logic above
  const counts = useMemo(() => {
    const now = new Date();
    const upcoming = sessions.filter(
      (s) => s.status !== "done" && s.scheduled_at && new Date(s.scheduled_at) > now,
    ).length;
    const active = sessions.filter((s) => ACTIVE_STATUSES.includes(s.status) && s.status !== "waiting").length;
    const draft = sessions.filter(
      (s) => s.status === "waiting" && (!s.scheduled_at || new Date(s.scheduled_at) <= now),
    ).length;
    const done = sessions.filter((s) => s.status === "done").length;
    const archived = archivedSessions.length;
    return { upcoming, active, draft, done, archived };
  }, [sessions, archivedSessions]);

  // Calendar dates
  const sessionDates = sessions.map((s) => new Date(s.scheduled_at || s.created_at)).filter(Boolean);

  const currentlyLoading = isLoading || (tab === "archived" && isLoadingArchived);

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 pt-16 lg:pt-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-heading-lg text-bw-heading font-extrabold">Séances</h1>
          <p className="text-sm text-bw-text mt-0.5">Gérez et préparez vos séances</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-bw-muted"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
            >
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher..."
              aria-label="Rechercher une seance"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
          <Link
            href={ROUTES.seanceNew}
            className="inline-flex items-center gap-1.5 rounded-xl bg-bw-primary px-4 py-2 text-sm font-bold text-white hover:bg-bw-primary-500 transition-all btn-hover"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            + Nouvelle séance
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <SeanceTabs active={tab} counts={counts} onChange={setTab} className="mb-6" />

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main list */}
        <div className="lg:col-span-8 xl:col-span-9">
          {isError ? (
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
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
              }
              title="Erreur de chargement"
              description="Impossible de charger les séances."
              accent="amber"
              action={{ label: "Reessayer", onClick: () => refetch() }}
            />
          ) : currentlyLoading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-2xl bg-card shimmer" />
              ))}
            </div>
          ) : grouped.length === 0 ? (
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
                  aria-hidden="true"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              }
              title={tab === "archived" ? "Aucune séance archivée" : "Aucune séance dans cette catégorie"}
              description={
                tab === "archived"
                  ? "Les séances archivées apparaîtront ici."
                  : "Créez une nouvelle séance pour commencer."
              }
              action={tab !== "archived" ? { label: "Créer une séance", href: ROUTES.seanceNew } : undefined}
            />
          ) : (
            <div className="flex flex-col gap-6">
              {grouped.map(([label, items]) => (
                <SeanceDayGroup
                  key={label}
                  label={label}
                  sessions={items.map((s) => {
                    const mod = s.template ? getModuleById(s.template) : undefined;
                    return {
                      id: s.id,
                      title: s.title,
                      classLabel: s.class_label,
                      moduleLabel: mod?.title,
                      moduleColor: mod?.color,
                      status: s.status as "draft" | "waiting" | "responding" | "paused" | "done",
                      studentCount: s.studentCount,
                      scheduledAt: s.scheduled_at,
                    };
                  })}
                  onSessionClick={(id) => router.push(ROUTES.seanceDetail(id))}
                  selectedIds={selected}
                  onToggleSelect={toggleSelect}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-4 xl:col-span-3 hidden lg:block">
          <SeanceCalendarSidebar sessionDates={sessionDates} />
        </div>
      </div>

      {/* Bulk action floating toolbar */}
      {selected.size > 0 && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-2xl bg-card border border-[var(--color-bw-border)] shadow-xl px-4 py-2.5 animate-in slide-in-from-bottom-4 duration-200">
          <span className="text-sm font-medium text-bw-heading tabular-nums">
            {selected.size} sélectionnée{selected.size > 1 ? "s" : ""}
          </span>
          <button
            type="button"
            onClick={handleBulkArchive}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
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
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
            Archiver ({selected.size})
          </button>
          <button
            type="button"
            onClick={clearSelection}
            className="rounded-lg border border-[var(--color-bw-border)] px-3 py-1.5 text-sm font-medium text-bw-muted hover:text-bw-heading transition-colors"
          >
            Annuler
          </button>
        </div>
      )}

      {/* Confirm modal */}
      <ConfirmModal
        open={confirm.open}
        onClose={confirm.onClose}
        onConfirm={confirm.onConfirm}
        title={confirm.title}
        description={confirm.description}
        confirmLabel={confirm.confirmLabel}
        confirmVariant={confirm.confirmVariant}
        isPending={confirm.isPending}
      />
    </div>
  );
}
