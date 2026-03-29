"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { GlassCardV2 } from "@/components/v2";

interface AdminStats {
  totalUsers: number;
  pendingUsers: number;
  totalSessions: number;
  pendingInvitations: number;
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetch("/api/v2/admin/stats");
      if (!res.ok) throw new Error("Failed to load stats");
      return res.json();
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-display-sm text-bw-heading font-cinema">Administration</h1>
        <p className="text-sm text-bw-muted mt-1">Gestion des utilisateurs et des acces</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Utilisateurs" value={stats?.totalUsers ?? 0} loading={isLoading} />
        <StatCard
          label="En attente"
          value={stats?.pendingUsers ?? 0}
          loading={isLoading}
          highlight={!!stats && stats.pendingUsers > 0}
        />
        <StatCard label="Sessions" value={stats?.totalSessions ?? 0} loading={isLoading} />
        <StatCard label="Invitations" value={stats?.pendingInvitations ?? 0} loading={isLoading} />
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/v2/admin/users">
          <GlassCardV2 className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-bw-primary/10 flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="text-bw-primary"
                >
                  <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-bw-heading">Utilisateurs</p>
                <p className="text-sm text-bw-muted">Gerer les comptes et les roles</p>
              </div>
              {stats && stats.pendingUsers > 0 && (
                <span className="ml-auto inline-flex items-center justify-center h-6 min-w-6 rounded-full bg-bw-primary text-white text-xs font-bold px-2">
                  {stats.pendingUsers}
                </span>
              )}
            </div>
          </GlassCardV2>
        </Link>

        <Link href="/v2/admin/invitations">
          <GlassCardV2 className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-bw-teal/10 flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="text-bw-teal"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-bw-heading">Invitations</p>
                <p className="text-sm text-bw-muted">Inviter des clients et voir les demandes</p>
              </div>
            </div>
          </GlassCardV2>
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  loading,
  highlight,
}: {
  label: string;
  value: number;
  loading: boolean;
  highlight?: boolean;
}) {
  return (
    <GlassCardV2 className="p-4">
      <p className="text-xs text-bw-muted font-medium uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${highlight ? "text-bw-primary" : "text-bw-heading"}`}>
        {loading ? "..." : value}
      </p>
    </GlassCardV2>
  );
}
