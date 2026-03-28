"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Module8Data } from "@/hooks/use-session-polling";

function InitialAvatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className="rounded-full bg-bw-primary/10 text-bw-primary flex items-center justify-center font-bold text-xs mx-auto"
      style={{ width: size, height: size }}
    >
      {initials || "?"}
    </div>
  );
}

interface Module8CockpitProps {
  sessionId: string;
  module8: Module8Data;
  connectedCount: number;
}

// ── Position 1: Quiz metiers ──
function QuizView({ module8, connectedCount }: { module8: Module8Data; connectedCount: number }) {
  const quiz = module8.quiz || [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-bw-heading">Quiz des metiers</h3>
        <span className="text-sm text-bw-muted">{quiz.length} metiers</span>
      </div>
      <p className="text-xs text-bw-muted">
        Les eleves decouvrent les vrais metiers du cinema. Qu'est-ce qu'ils pensent connaitre ?
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {quiz.map((q) => (
          <motion.div
            key={q.metierKey}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 rounded-[18px] border border-black/[0.06] bg-bw-surface text-center"
          >
            <span className="text-2xl">{q.metierEmoji}</span>
            <p className="text-xs font-semibold text-bw-heading mt-1">{q.metierLabel}</p>
          </motion.div>
        ))}
      </div>
      <div className="flex items-center gap-2 text-sm text-bw-muted">
        <div
          className="led led-writing"
          style={{ background: "#F3A765", boxShadow: "0 0 8px rgba(243,167,101,0.4)" }}
        />
        <span>
          {connectedCount} eleve{connectedCount > 1 ? "s" : ""} en train de repondre
        </span>
      </div>
    </div>
  );
}

// ── Quick Tags ──
const QUICK_TAGS = [
  { key: "tres_creatif", label: "Très créatif", emoji: "🎨" },
  { key: "force_de_proposition", label: "Force de proposition", emoji: "💡" },
  { key: "bonne_ecoute", label: "Bonne écoute", emoji: "👂" },
  { key: "tres_investi", label: "Très investi", emoji: "🔥" },
  { key: "bonne_cooperation", label: "Bonne coopération", emoji: "🤝" },
  { key: "leadership", label: "Leadership", emoji: "👑" },
] as const;

function QuickTagBar({
  sessionId,
  ranking,
}: {
  sessionId: string;
  ranking: { studentId: string; displayName: string }[];
}) {
  const [selectedStudent, setSelectedStudent] = useState("");
  const [sending, setSending] = useState<string | null>(null);

  const sendTag = async (tag: string) => {
    if (!selectedStudent) return;
    setSending(tag);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/facilitator-tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: selectedStudent, tag }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur");
      }
      toast.success("Tag ajouté !");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="pt-3 border-t border-black/[0.04]">
      <p className="text-xs font-semibold text-bw-muted uppercase tracking-wider mb-2">Observations rapides</p>
      <select
        value={selectedStudent}
        onChange={(e) => setSelectedStudent(e.target.value)}
        className="w-full text-xs rounded-lg border border-black/[0.08] bg-bw-surface px-2 py-1.5 mb-2"
      >
        <option value="">Sélectionner un élève...</option>
        {ranking.map((r) => (
          <option key={r.studentId} value={r.studentId}>
            {r.displayName}
          </option>
        ))}
      </select>
      <div className="flex flex-wrap gap-1">
        {QUICK_TAGS.map((t) => (
          <button
            key={t.key}
            onClick={() => sendTag(t.key)}
            disabled={!selectedStudent || sending === t.key}
            className="px-2 py-1 rounded-lg text-[10px] font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 transition-colors disabled:opacity-40"
          >
            {sending === t.key ? "..." : `${t.emoji} ${t.label}`}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Position 2: Debrief ──
function DebriefView({ module8, sessionId }: { module8: Module8Data; sessionId: string }) {
  const corrections = module8.corrections || [];
  const classResults = module8.classResults;
  const studentList = module8.studentList || [];
  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-bw-heading">Debrief — Resultats classe</h3>
      <div className="space-y-3">
        {corrections.map((c) => {
          const result = classResults?.[c.metierKey];
          const correct = result?.correct || 0;
          const wrong = result?.wrong || 0;
          const total = correct + wrong;
          const pctCorrect = total > 0 ? Math.round((correct / total) * 100) : 0;
          return (
            <motion.div
              key={c.metierKey}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-[18px] border border-black/[0.06] bg-bw-surface"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{c.metierEmoji}</span>
                <span className="text-sm font-semibold text-bw-heading">{c.metierLabel}</span>
                {total > 0 && (
                  <span
                    className="ml-auto text-sm font-bold tabular-nums"
                    style={{ color: pctCorrect >= 50 ? "#6EC6B0" : "#F3A765" }}
                  >
                    {pctCorrect}%
                  </span>
                )}
              </div>
              {total > 0 && (
                <div className="h-2.5 bg-black/[0.04] rounded-full overflow-hidden flex">
                  <motion.div
                    className="h-full rounded-l-full bg-emerald-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${pctCorrect}%` }}
                    transition={{ duration: 0.5 }}
                  />
                  <motion.div
                    className="h-full rounded-r-full bg-red-300"
                    initial={{ width: 0 }}
                    animate={{ width: `${100 - pctCorrect}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
              {total === 0 && <p className="text-xs text-bw-muted/60">En attente des reponses...</p>}
              <div className="mt-2 text-[10px] text-bw-muted">
                <p>
                  <span className="font-medium text-bw-heading">Idee recue :</span> {c.commonBelief}
                </p>
                <p>
                  <span className="font-medium text-emerald-600">Realite :</span> {c.reality}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick tags — facilitator observations during debrief */}
      {studentList.length > 0 && <QuickTagBar sessionId={sessionId} ranking={studentList} />}
    </div>
  );
}

// ── Position 3: Role choice ──
function RoleChoiceView({
  module8,
  sessionId,
  connectedCount,
}: {
  module8: Module8Data;
  sessionId: string;
  connectedCount: number;
}) {
  const queryClient = useQueryClient();
  const ranking = module8.ranking || [];
  const takenRoles = module8.takenRoles || [];
  const availableRoles = module8.availableRoles || [];
  const chosenCount = takenRoles.length;
  const [vetoStudentId, setVetoStudentId] = useState("");
  const [vetoRoleKey, setVetoRoleKey] = useState("");

  const computePoints = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/equipe-compute`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Scores calcules !");
      queryClient.invalidateQueries({ queryKey: ["session-cockpit", sessionId] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Erreur");
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-bw-heading">Choix des roles</h3>
        <span className="text-sm font-medium tabular-nums text-bw-teal">
          {chosenCount}/{connectedCount}
        </span>
      </div>

      {/* Compute points button */}
      {!module8.pointsComputed && (
        <button
          onClick={() => computePoints.mutate()}
          disabled={computePoints.isPending}
          className="px-3 py-1.5 text-xs bg-teal-500/20 hover:bg-teal-500/40 text-teal-600 rounded-lg transition-colors border border-teal-500/30"
        >
          {computePoints.isPending ? "Calcul en cours..." : "Calculer les scores"}
        </button>
      )}

      {/* Ranking table */}
      {ranking.length > 0 && (
        <div className="space-y-1.5 max-h-[350px] overflow-y-auto">
          {ranking.map((r, i) => {
            const role = takenRoles.find((t) => t.studentId === r.studentId);
            return (
              <motion.div
                key={r.studentId}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-center gap-2 p-2 rounded-xl border transition-colors ${
                  r.hasChosen ? "bg-emerald-50 border-emerald-200" : "bg-bw-surface border-black/[0.06]"
                }`}
              >
                <span className="w-6 text-center text-xs font-bold text-bw-muted">#{r.rank}</span>
                <span className="text-sm text-bw-heading flex-1 truncate">{r.displayName}</span>
                <span className="text-xs tabular-nums text-bw-muted">{r.total} pts</span>
                {role && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-bw-teal/10 text-bw-teal">
                    {role.roleLabel}
                  </span>
                )}
                {!r.hasChosen && <span className="text-xs text-amber-500">...</span>}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Available roles */}
      {availableRoles.length > 0 && (
        <div className="pt-2 border-t border-black/[0.04]">
          <p className="text-xs font-semibold text-bw-muted uppercase tracking-wider mb-2">Roles disponibles</p>
          <div className="flex flex-wrap gap-1.5">
            {availableRoles.map((role) => (
              <span
                key={role.key}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border border-black/[0.06]"
                style={{ background: `${role.color}15`, color: role.color }}
              >
                {role.emoji} {role.label}
                {role.count > 0 && <span className="text-[10px] font-bold tabular-nums opacity-60">×{role.count}</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Veto Banlieuwood — facilitator assigns a role */}
      {module8.pointsComputed && (
        <VetoSection
          ranking={ranking}
          takenRoles={takenRoles}
          availableRoles={availableRoles}
          sessionId={sessionId}
          vetoStudentId={vetoStudentId}
          setVetoStudentId={setVetoStudentId}
          vetoRoleKey={vetoRoleKey}
          setVetoRoleKey={setVetoRoleKey}
        />
      )}
    </div>
  );
}

// ── Veto sub-component ──
function VetoSection({
  ranking,
  takenRoles,
  availableRoles,
  sessionId,
  vetoStudentId,
  setVetoStudentId,
  vetoRoleKey,
  setVetoRoleKey,
}: {
  ranking: NonNullable<Module8Data["ranking"]>;
  takenRoles: NonNullable<Module8Data["takenRoles"]>;
  availableRoles: NonNullable<Module8Data["availableRoles"]>;
  sessionId: string;
  vetoStudentId: string;
  setVetoStudentId: (v: string) => void;
  vetoRoleKey: string;
  setVetoRoleKey: (v: string) => void;
}) {
  const queryClient = useQueryClient();
  const takenStudentIds = new Set(takenRoles.map((r) => r.studentId));
  const unassigned = ranking.filter((r) => !takenStudentIds.has(r.studentId));

  const vetoMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/equipe-compute`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: vetoStudentId, roleKey: vetoRoleKey }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Veto Banlieuwood appliqué !");
      setVetoStudentId("");
      setVetoRoleKey("");
      queryClient.invalidateQueries({ queryKey: ["session-cockpit", sessionId] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Erreur");
    },
  });

  return (
    <div className="pt-3 border-t border-amber-200/60">
      <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">Veto Banlieuwood</p>
      <p className="text-[10px] text-bw-muted mb-2">
        Assigner un rôle à un élève (rare — uniquement si talent repéré).
      </p>
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[120px]">
          <label className="text-[10px] text-bw-muted block mb-0.5">Élève</label>
          <select
            value={vetoStudentId}
            onChange={(e) => setVetoStudentId(e.target.value)}
            className="w-full text-xs rounded-lg border border-black/[0.08] bg-bw-surface px-2 py-1.5"
          >
            <option value="">Choisir...</option>
            {unassigned.map((r) => (
              <option key={r.studentId} value={r.studentId}>
                {r.displayName}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="text-[10px] text-bw-muted block mb-0.5">Rôle</label>
          <select
            value={vetoRoleKey}
            onChange={(e) => setVetoRoleKey(e.target.value)}
            className="w-full text-xs rounded-lg border border-black/[0.08] bg-bw-surface px-2 py-1.5"
          >
            <option value="">Choisir...</option>
            {availableRoles.map((r) => (
              <option key={r.key} value={r.key}>
                {r.emoji} {r.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => vetoMutation.mutate()}
          disabled={!vetoStudentId || !vetoRoleKey || vetoMutation.isPending}
          className="px-3 py-1.5 text-xs bg-amber-500/20 hover:bg-amber-500/40 text-amber-700 rounded-lg transition-colors border border-amber-500/30 disabled:opacity-40"
        >
          {vetoMutation.isPending ? "..." : "Appliquer veto"}
        </button>
      </div>
    </div>
  );
}

// ── Position 4: Team recap ──
function TeamRecapView({ module8 }: { module8: Module8Data }) {
  const team = module8.team || [];
  const formula = module8.formula || "F2";
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-bw-heading">Equipe de tournage</h3>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            formula === "F3" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"
          }`}
        >
          {formula === "F3" ? "Rotation (F3)" : "Rôles fixes (F2)"}
        </span>
      </div>
      {formula === "F3" && (
        <p className="text-[10px] text-violet-600 bg-violet-50 rounded-lg px-3 py-1.5">
          Les eleves changeront de poste à mi-journée pour decouvrir un second role.
        </p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {team.map((member) => (
          <motion.div
            key={member.studentId}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 rounded-[18px] border border-black/[0.06] bg-bw-surface text-center"
          >
            <InitialAvatar name={member.displayName} size={40} />
            <p className="text-xs font-semibold text-bw-heading mt-2 truncate">{member.displayName}</p>
            <span
              className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ background: `${member.roleColor}20`, color: member.roleColor }}
            >
              {member.roleEmoji} {member.roleLabel}
            </span>
            {member.isVeto && <span className="block text-[9px] text-amber-500 mt-0.5">veto</span>}
          </motion.div>
        ))}
      </div>
      {team.length === 0 && (
        <p className="text-sm text-bw-muted text-center py-4">En attente de la constitution de l'equipe.</p>
      )}
    </div>
  );
}

// ── Position 5: Talent card ──
function TalentCardView({ module8, sessionId }: { module8: Module8Data; sessionId: string }) {
  const queryClient = useQueryClient();
  const card = module8.talentCard;

  const generateTalentCards = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/equipe-compute`, {
        method: "PUT",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Cartes talent generees !");
      queryClient.invalidateQueries({ queryKey: ["session-state"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Erreur");
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-bw-heading">Cartes Talent</h3>
        {!card && (
          <button
            onClick={() => generateTalentCards.mutate()}
            disabled={generateTalentCards.isPending}
            className="px-3 py-1.5 text-xs bg-teal-500/20 hover:bg-teal-500/40 text-teal-600 rounded-lg transition-colors border border-teal-500/30"
          >
            {generateTalentCards.isPending ? "Generation..." : "Generer les cartes"}
          </button>
        )}
      </div>
      <p className="text-xs text-bw-muted">Chaque eleve decouvre sa carte talent personnalisee sur son ecran.</p>
      {card ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-[18px] border-2 bg-gradient-to-b from-white to-bw-surface max-w-xs mx-auto"
          style={{ borderColor: card.talentCategoryColor }}
        >
          <div className="text-center">
            <InitialAvatar name={card.displayName} size={48} />
            <p className="text-sm font-bold text-bw-heading mt-2">{card.displayName}</p>
            <span
              className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
              style={{ background: card.talentCategoryColor }}
            >
              {card.roleEmoji} {card.roleLabel}
            </span>
            <p className="text-xs text-bw-muted mt-2">{card.talentCategoryLabel}</p>
            {card.strengths.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                {card.strengths.map((s, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-full text-[10px] bg-bw-primary/10 text-bw-primary font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-16 h-16 rounded-2xl bg-bw-primary/5 flex items-center justify-center">
            <span className="text-3xl">🎴</span>
          </div>
          <p className="text-sm text-bw-muted text-center">
            Les cartes talent sont visibles sur l'ecran de chaque eleve.
          </p>
        </div>
      )}
    </div>
  );
}

export function Module8Cockpit({ sessionId, module8, connectedCount }: Module8CockpitProps) {
  const content = useMemo(() => {
    switch (module8.type) {
      case "quiz":
        return <QuizView module8={module8} connectedCount={connectedCount} />;
      case "debrief":
        return <DebriefView module8={module8} sessionId={sessionId} />;
      case "role-choice":
        return <RoleChoiceView module8={module8} sessionId={sessionId} connectedCount={connectedCount} />;
      case "team-recap":
        return <TeamRecapView module8={module8} />;
      case "talent-card":
        return <TalentCardView module8={module8} sessionId={sessionId} />;
      default:
        return <p className="text-sm text-bw-muted">Type inconnu : {module8.type}</p>;
    }
  }, [module8, connectedCount, sessionId]);

  return <div className="space-y-6">{content}</div>;
}
