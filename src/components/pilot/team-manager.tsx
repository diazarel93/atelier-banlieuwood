"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Team {
  id: string;
  team_name: string;
  team_color: string;
  team_number: number;
  students: { id: string; display_name: string; avatar: string }[];
}

interface Student {
  id: string;
  display_name: string;
  avatar: string;
  is_active: boolean;
}

interface TeamManagerProps {
  sessionId: string;
  teams: Team[];
  students: Student[];
}

export function TeamManager({ sessionId, teams, students }: TeamManagerProps) {
  const queryClient = useQueryClient();
  const [assigning, setAssigning] = useState<string | null>(null);

  const createTeams = useMutation({
    mutationFn: async () => {
      for (let i = 1; i <= 4; i++) {
        await fetch(`/api/sessions/${sessionId}/teams`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teamName: `Equipe ${i}`, teamNumber: i }),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilot-teams", sessionId] });
      toast.success("4 equipes creees !");
    },
  });

  const deleteTeams = useMutation({
    mutationFn: async () => {
      await fetch(`/api/sessions/${sessionId}/teams`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilot-teams", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["pilot-session", sessionId] });
      toast.success("Equipes supprimees");
    },
  });

  const assignStudent = useMutation({
    mutationFn: async ({ studentId, teamId }: { studentId: string; teamId: string | null }) => {
      const res = await fetch(`/api/sessions/${sessionId}/teams/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: [studentId], teamId }),
      });
      if (!res.ok) throw new Error("Erreur");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilot-teams", sessionId] });
      setAssigning(null);
    },
  });

  // Students already assigned to teams
  const assignedIds = new Set(teams.flatMap((t) => t.students.map((s) => s.id)));
  const unassigned = students.filter((s) => !assignedIds.has(s.id));

  if (teams.length === 0) {
    return (
      <div className="glass-card p-4 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-bw-muted">Mode Equipe</h4>
        <button
          onClick={() => createTeams.mutate()}
          disabled={createTeams.isPending}
          className="w-full py-2.5 rounded-xl bg-bw-primary/15 border border-bw-primary/30 text-bw-primary text-sm font-medium cursor-pointer hover:bg-bw-primary/25 transition-colors disabled:opacity-50"
        >
          {createTeams.isPending ? "Creation..." : "Creer 4 equipes"}
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-bw-muted">Equipes</h4>
        <button
          onClick={() => {
            if (confirm("Supprimer toutes les equipes ?")) deleteTeams.mutate();
          }}
          className="text-xs text-bw-danger hover:text-bw-danger/80 cursor-pointer"
        >
          Supprimer
        </button>
      </div>

      <div className="space-y-2">
        {teams.map((team) => (
          <div key={team.id} className="rounded-xl border border-black/[0.04] overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2" style={{ borderLeft: `3px solid ${team.team_color}` }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: team.team_color }} />
              <span className="text-xs font-semibold flex-1">{team.team_name}</span>
              <span className="text-xs text-bw-muted">{team.students.length}</span>
            </div>
            {team.students.length > 0 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1">
                {team.students.map((s) => (
                  <span key={s.id} className="text-xs bg-bw-elevated px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span>{s.avatar}</span>
                    <span className="truncate max-w-[60px]">{s.display_name}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Unassigned students */}
      {unassigned.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-bw-muted font-semibold uppercase">Non assignes ({unassigned.length})</p>
          <div className="flex flex-wrap gap-1">
            {unassigned.map((s) => (
              <div key={s.id} className="relative">
                <button
                  onClick={() => setAssigning(assigning === s.id ? null : s.id)}
                  className="text-xs bg-bw-elevated px-2 py-1 rounded-full flex items-center gap-1 cursor-pointer hover:bg-bw-elevated/80 transition-colors border border-black/[0.04]"
                >
                  <span>{s.avatar}</span>
                  <span className="truncate max-w-[60px]">{s.display_name}</span>
                </button>
                <AnimatePresence>
                  {assigning === s.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute top-full left-0 mt-1 z-10 bg-bw-bg border border-bw-border rounded-xl p-1 shadow-xl min-w-[120px]"
                    >
                      {teams.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => assignStudent.mutate({ studentId: s.id, teamId: t.id })}
                          className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-bw-elevated cursor-pointer flex items-center gap-1.5 transition-colors"
                        >
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.team_color }} />
                          {t.team_name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
