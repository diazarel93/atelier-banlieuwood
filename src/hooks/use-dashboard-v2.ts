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
  stats: DashboardStats;
  sessionDates: string[];
  completedModuleIds: string[];
}

async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const res = await fetch("/api/v2/dashboard-summary");
  if (!res.ok) throw new Error("Erreur chargement dashboard");
  return res.json();
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["v2", "dashboard-summary"],
    queryFn: fetchDashboardSummary,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}

export type { SessionSummary, DashboardStats, DashboardSummary };
