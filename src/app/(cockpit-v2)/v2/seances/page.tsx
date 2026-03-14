"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ROUTES } from "@/lib/routes";
import { SeanceTabs, type SeanceTab } from "@/components/v2/seance-tabs";
import { SeanceDayGroup } from "@/components/v2/seance-day-group";
import { SeanceCalendarSidebar } from "@/components/v2/seance-calendar-sidebar";
import { getModuleById } from "@/lib/modules-data";
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
}

async function fetchSessions(): Promise<Session[]> {
  const res = await fetch("/api/sessions");
  if (!res.ok) throw new Error("Erreur chargement séances");
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
  const [tab, setTab] = useState<SeanceTab>("upcoming");
  const [search, setSearch] = useState("");

  const { data: sessions = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["sessions"],
    queryFn: fetchSessions,
    refetchInterval: 15_000,
  });

  const filtered = useMemo(() => {
    let list = sessions;

    // Filter by tab — exclusive logic, no overlap
    switch (tab) {
      case "upcoming":
        // Scheduled in the future OR waiting with a schedule date
        list = list.filter(
          (s) =>
            s.status !== "done" &&
            s.scheduled_at &&
            new Date(s.scheduled_at) > new Date()
        );
        break;
      case "active":
        // Currently running (not waiting, not done)
        list = list.filter(
          (s) => ACTIVE_STATUSES.includes(s.status) && s.status !== "waiting"
        );
        break;
      case "draft":
        // Waiting sessions without a future schedule
        list = list.filter(
          (s) =>
            s.status === "waiting" &&
            (!s.scheduled_at || new Date(s.scheduled_at) <= new Date())
        );
        break;
      case "archived":
        list = list.filter((s) => s.status === "done");
        break;
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.class_label?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [sessions, tab, search]);

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

  // Tab counts — must match filter logic above
  const counts = useMemo(() => {
    const now = new Date();
    const upcoming = sessions.filter(
      (s) => s.status !== "done" && s.scheduled_at && new Date(s.scheduled_at) > now
    ).length;
    const active = sessions.filter(
      (s) => ACTIVE_STATUSES.includes(s.status) && s.status !== "waiting"
    ).length;
    const draft = sessions.filter(
      (s) => s.status === "waiting" && (!s.scheduled_at || new Date(s.scheduled_at) <= now)
    ).length;
    const archived = sessions.filter((s) => s.status === "done").length;
    return { upcoming, active, draft, archived };
  }, [sessions]);

  // Calendar dates
  const sessionDates = sessions
    .map((s) => new Date(s.scheduled_at || s.created_at))
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-bw-heading">Séances</h1>
          <p className="text-sm text-bw-muted mt-0.5">
            Gérez et préparez vos séances
          </p>
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
              aria-label="Rechercher une séance"
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
            className="inline-flex items-center gap-1.5 rounded-lg bg-bw-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-bw-primary-500 transition-colors btn-glow"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Nouvelle séance
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
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-bw-muted text-sm mb-4">
                Impossible de charger les séances
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="rounded-lg border border-[var(--color-bw-border)] px-4 py-2 text-sm font-medium text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors"
              >
                Réessayer
              </button>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-2xl bg-card shimmer" />
              ))}
            </div>
          ) : grouped.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-bw-muted text-sm mb-4">
                Aucune séance dans cette catégorie
              </p>
              <Link
                href={ROUTES.seanceNew}
                className="inline-flex items-center gap-1.5 rounded-lg bg-bw-primary px-4 py-2 text-sm font-semibold text-white hover:bg-bw-primary-500 transition-colors"
              >
                Créer une séance
              </Link>
            </div>
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
    </div>
  );
}
