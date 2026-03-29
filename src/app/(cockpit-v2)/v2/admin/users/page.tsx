"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GlassCardV2, BreadcrumbV2 } from "@/components/v2";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  institution: string | null;
  created_at: string;
  validated_at: string | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "Actif", color: "bg-bw-teal-50 text-bw-teal-700" },
  pending: { label: "En attente", color: "bg-bw-amber-100 text-bw-amber-500" },
  rejected: { label: "Refusé", color: "bg-bw-danger-100 text-bw-danger" },
  deactivated: { label: "Desactive", color: "bg-[var(--color-bw-surface-dim)] text-bw-muted" },
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  intervenant: "Intervenant",
  client: "Client",
};

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [filterRole, setFilterRole] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data, isLoading } = useQuery<{ users: User[] }>({
    queryKey: ["admin-users", filterRole, filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterRole) params.set("role", filterRole);
      if (filterStatus) params.set("status", filterStatus);
      const res = await fetch(`/api/v2/admin/users?${params}`);
      if (!res.ok) throw new Error("Failed to load users");
      return res.json();
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: string }) => {
      const res = await fetch(`/api/v2/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Action failed");
      return res.json();
    },
    onSuccess: (_data, vars) => {
      toast.success(
        `Utilisateur ${vars.action === "validate" ? "valide" : vars.action === "reject" ? "refuse" : "mis a jour"}`,
      );
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: () => {
      toast.error("Erreur lors de la mise a jour");
    },
  });

  const allUsers = data?.users ?? [];
  const users = searchQuery.trim()
    ? allUsers.filter((u) => {
        const q = searchQuery.trim().toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.institution || "").toLowerCase().includes(q)
        );
      })
    : allUsers;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      <BreadcrumbV2 items={[{ label: "Admin", href: "/v2/admin" }, { label: "Utilisateurs" }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-heading-lg text-bw-heading">Utilisateurs</h1>
        <p className="text-sm text-bw-muted">
          {searchQuery && users.length !== allUsers.length
            ? `${users.length} / ${allUsers.length} utilisateur${allUsers.length > 1 ? "s" : ""}`
            : `${users.length} utilisateur${users.length > 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-bw-muted pointer-events-none"
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
            placeholder="Rechercher par nom ou email..."
            aria-label="Rechercher un utilisateur"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-64 rounded-xl border border-bw-border bg-card pl-9 pr-8 text-sm text-bw-heading placeholder:text-bw-placeholder focus:outline-none focus:ring-2 focus:ring-bw-primary/30 focus:border-bw-primary transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Effacer la recherche"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-bw-muted hover:text-bw-heading transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="rounded-xl border border-bw-border bg-card px-3 py-2 text-sm"
          aria-label="Filtrer par role"
        >
          <option value="">Tous les roles</option>
          <option value="admin">Admin</option>
          <option value="intervenant">Intervenant</option>
          <option value="client">Client</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-xl border border-bw-border bg-card px-3 py-2 text-sm"
          aria-label="Filtrer par statut"
        >
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="active">Actif</option>
          <option value="rejected">Refuse</option>
          <option value="deactivated">Desactive</option>
        </select>
      </div>

      {/* Users table */}
      <GlassCardV2 className="overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-bw-border/50">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <div className="h-4 w-24 rounded bg-bw-surface shimmer" />
                <div className="h-4 w-40 rounded bg-bw-surface shimmer" />
                <div className="h-4 w-16 rounded bg-bw-surface shimmer" />
                <div className="h-5 w-16 rounded-full bg-bw-surface shimmer" />
                <div className="flex-1" />
                <div className="h-7 w-16 rounded-lg bg-bw-surface shimmer" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-bw-muted text-sm">Aucun utilisateur trouve</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bw-border bg-bw-bg/50">
                  <th className="text-left px-4 py-3 font-medium text-bw-muted">Nom</th>
                  <th className="text-left px-4 py-3 font-medium text-bw-muted">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-bw-muted">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-bw-muted">Statut</th>
                  <th className="text-left px-4 py-3 font-medium text-bw-muted">Institution</th>
                  <th className="text-right px-4 py-3 font-medium text-bw-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const statusInfo = STATUS_LABELS[user.status] ?? {
                    label: user.status,
                    color: "bg-[var(--color-bw-surface-dim)]",
                  };
                  return (
                    <tr key={user.id} className="border-b border-bw-border/50 last:border-0">
                      <td className="px-4 py-3 font-medium text-bw-heading">{user.name}</td>
                      <td className="px-4 py-3 text-bw-muted">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium">{ROLE_LABELS[user.role] ?? user.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-bw-muted text-xs">{user.institution ?? "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-1 justify-end">
                          {user.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs rounded-lg text-bw-teal-600 border-bw-teal-200 hover:bg-bw-teal-50"
                                onClick={() => actionMutation.mutate({ userId: user.id, action: "validate" })}
                                disabled={actionMutation.isPending}
                              >
                                Valider
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs rounded-lg text-bw-danger border-bw-danger/20 hover:bg-bw-danger-100"
                                onClick={() => actionMutation.mutate({ userId: user.id, action: "reject" })}
                                disabled={actionMutation.isPending}
                              >
                                Refuser
                              </Button>
                            </>
                          )}
                          {user.status === "active" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs rounded-lg text-bw-amber-500 border-bw-amber/20 hover:bg-bw-amber-100"
                              onClick={() => actionMutation.mutate({ userId: user.id, action: "deactivate" })}
                              disabled={actionMutation.isPending}
                            >
                              Desactiver
                            </Button>
                          )}
                          {(user.status === "rejected" || user.status === "deactivated") && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs rounded-lg text-bw-teal-600 border-bw-teal-200 hover:bg-bw-teal-50"
                              onClick={() => actionMutation.mutate({ userId: user.id, action: "reactivate" })}
                              disabled={actionMutation.isPending}
                            >
                              Reactiver
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCardV2>
    </div>
  );
}
