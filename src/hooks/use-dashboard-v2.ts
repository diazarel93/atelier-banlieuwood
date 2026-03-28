"use client";

import { useQuery } from "@tanstack/react-query";

interface SessionSummary {
  id: string;
  title: string;
  status: string;
  level: string;
  template: string | null;
  scheduledAt: string;
  classLabel: string | null;
  studentCount: number;
}

interface DashboardStats {
  totalSessions: number;
  doneSessions: number;
  activeSessions: number;
  totalStudents: number;
}

interface DashboardSummary {
  todaySessions: SessionSummary[];
  tomorrowSessions: SessionSummary[];
  recentSessions: SessionSummary[];
  stats: DashboardStats;
  sessionDates: string[];
  completedModuleIds: string[];
  classLabels: string[];
  trends?: Record<string, { value: number; label?: string }>;
}

async function fetchDashboardSummary(classLabel?: string | null): Promise<DashboardSummary> {
  const params = new URLSearchParams();
  if (classLabel) params.set("classLabel", classLabel);
  const qs = params.toString();
  const res = await fetch(`/api/v2/dashboard-summary${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Erreur chargement dashboard");
  return res.json();
}

export function useDashboardSummary(classLabel?: string | null, userRole?: string | null) {
  return useQuery({
    queryKey: ["v2", "dashboard-summary", classLabel ?? null, userRole ?? "unknown"],
    queryFn: () => fetchDashboardSummary(classLabel),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}

export type { SessionSummary, DashboardStats, DashboardSummary };
