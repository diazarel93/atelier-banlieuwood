"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GlassCardV2, BreadcrumbV2 } from "@/components/v2";

interface Invitation {
  id: string;
  email: string;
  role: string;
  type: string;
  status: string;
  institution: string | null;
  message: string | null;
  created_at: string;
  invited_by: string | null;
}

export default function AdminInvitationsPage() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("client");
  const [institution, setInstitution] = useState("");

  const { data, isLoading } = useQuery<{ invitations: Invitation[] }>({
    queryKey: ["admin-invitations"],
    queryFn: async () => {
      const res = await fetch("/api/v2/admin/invitations");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v2/admin/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, type: "invite", institution: institution || undefined }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => {
      const token = data.invitation?.token;
      const inviteUrl = `${window.location.origin}/login?token=${token}`;
      toast.success("Invitation creee");
      navigator.clipboard.writeText(inviteUrl).then(() => {
        toast.info("Lien copie dans le presse-papier");
      });
      setEmail("");
      setInstitution("");
      queryClient.invalidateQueries({ queryKey: ["admin-invitations"] });
    },
    onError: () => {
      toast.error("Erreur lors de la creation");
    },
  });

  const invitations = data?.invitations ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      <BreadcrumbV2 items={[{ label: "Admin", href: "/v2/admin" }, { label: "Invitations" }]} />

      <h1 className="text-heading-lg text-bw-heading">Invitations</h1>

      {/* Create invitation form */}
      <GlassCardV2 className="p-6 space-y-4">
        <h2 className="font-semibold text-bw-heading">Inviter un utilisateur</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-xl border border-bw-border bg-card px-3 py-2 text-sm"
            aria-label="Role"
          >
            <option value="client">Client</option>
            <option value="intervenant">Intervenant</option>
            <option value="admin">Admin</option>
          </select>
          <Input
            type="text"
            placeholder="Institution (optionnel)"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!email || createMutation.isPending}
            className="rounded-xl bg-bw-primary text-white hover:bg-bw-primary-500"
          >
            {createMutation.isPending ? "..." : "Inviter"}
          </Button>
        </div>
      </GlassCardV2>

      {/* Invitations list */}
      <GlassCardV2 className="overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-bw-border/50">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <div className="h-4 w-40 rounded bg-bw-surface shimmer" />
                <div className="h-4 w-16 rounded bg-bw-surface shimmer" />
                <div className="h-5 w-20 rounded-full bg-bw-surface shimmer" />
                <div className="h-5 w-16 rounded-full bg-bw-surface shimmer" />
                <div className="h-4 w-20 rounded bg-bw-surface shimmer" />
              </div>
            ))}
          </div>
        ) : invitations.length === 0 ? (
          <div className="p-8 text-center text-bw-muted text-sm">Aucune invitation</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bw-border bg-bw-bg/50">
                  <th className="text-left px-4 py-3 font-medium text-bw-muted">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-bw-muted">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-bw-muted">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-bw-muted">Statut</th>
                  <th className="text-left px-4 py-3 font-medium text-bw-muted">Date</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((inv) => (
                  <tr key={inv.id} className="border-b border-bw-border/50 last:border-0">
                    <td className="px-4 py-3 font-medium text-bw-heading">{inv.email}</td>
                    <td className="px-4 py-3 text-xs">{inv.role}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          inv.type === "invite" ? "bg-bw-teal-50 text-bw-teal-700" : "bg-bw-violet-100 text-bw-violet"
                        }`}
                      >
                        {inv.type === "invite" ? "Invitation" : "Demande"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          inv.status === "pending"
                            ? "bg-bw-amber-100 text-bw-amber-500"
                            : inv.status === "accepted"
                              ? "bg-bw-teal-50 text-bw-teal-700"
                              : "bg-[var(--color-bw-surface-dim)] text-bw-muted"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-bw-muted">
                      {new Date(inv.created_at).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCardV2>
    </div>
  );
}
