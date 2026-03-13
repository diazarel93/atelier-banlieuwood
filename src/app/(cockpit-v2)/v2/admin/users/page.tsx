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
  active: { label: "Actif", color: "bg-green-100 text-green-700" },
  pending: { label: "En attente", color: "bg-amber-100 text-amber-700" },
  rejected: { label: "Refuse", color: "bg-red-100 text-red-700" },
  deactivated: { label: "Desactive", color: "bg-gray-100 text-gray-600" },
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
      toast.success(`Utilisateur ${vars.action === "validate" ? "valide" : vars.action === "reject" ? "refuse" : "mis a jour"}`);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: () => {
      toast.error("Erreur lors de la mise a jour");
    },
  });

  const users = data?.users ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      <BreadcrumbV2
        items={[
          { label: "Admin", href: "/v2/admin" },
          { label: "Utilisateurs" },
        ]}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-heading-lg text-bw-heading">Utilisateurs</h1>
        <p className="text-sm text-bw-muted">{users.length} utilisateur{users.length > 1 ? "s" : ""}</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="rounded-xl border border-bw-border bg-white px-3 py-2 text-sm"
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
          className="rounded-xl border border-bw-border bg-white px-3 py-2 text-sm"
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
          <div className="p-8 text-center text-bw-muted text-sm">Chargement...</div>
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
                  const statusInfo = STATUS_LABELS[user.status] ?? { label: user.status, color: "bg-gray-100" };
                  return (
                    <tr key={user.id} className="border-b border-bw-border/50 last:border-0">
                      <td className="px-4 py-3 font-medium text-bw-heading">{user.name}</td>
                      <td className="px-4 py-3 text-bw-muted">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium">{ROLE_LABELS[user.role] ?? user.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
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
                                className="text-xs rounded-lg text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => actionMutation.mutate({ userId: user.id, action: "validate" })}
                                disabled={actionMutation.isPending}
                              >
                                Valider
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs rounded-lg text-red-600 border-red-200 hover:bg-red-50"
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
                              className="text-xs rounded-lg text-amber-600 border-amber-200 hover:bg-amber-50"
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
                              className="text-xs rounded-lg text-green-600 border-green-200 hover:bg-green-50"
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
