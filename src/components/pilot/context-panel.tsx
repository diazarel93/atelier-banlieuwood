"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { ModuleGuide, QuestionGuide } from "@/lib/guide-data";

interface Student {
  id: string;
  display_name: string;
  avatar: string;
  is_active: boolean;
  warnings: number;
}

interface Response {
  id: string;
  student_id: string;
  text: string;
  submitted_at: string;
  is_hidden: boolean;
  is_highlighted: boolean;
}

type StudentStateValue = "active" | "responded" | "stuck" | "disconnected";

interface ContextPanelProps {
  moduleGuide: ModuleGuide | undefined;
  questionGuide: QuestionGuide | undefined;
  responsesCount: number;
  totalStudents: number;
  hiddenCount: number;
  voteOptionCount: number;
  sessionStatus: string;
  selectedStudent: Student | null;
  studentResponses: Response[];
  onSelectStudent: (student: Student | null) => void;
  onClose: () => void;
  // New props
  students?: Student[];
  studentStates?: { id: string; state: StudentStateValue }[];
  onNudge?: (studentId: string, text: string) => void;
  onWarn?: (studentId: string) => void;
}

type TabId = "guide" | "students" | "stats";

const STATE_COLORS: Record<StudentStateValue, string> = {
  responded: "#4ECDC4",
  active: "#FF6B35",
  stuck: "#F59E0B",
  disconnected: "#444",
};

const STATE_LABELS: Record<StudentStateValue, string> = {
  responded: "Répondu",
  active: "En attente",
  stuck: "Bloqué",
  disconnected: "Déconnecté",
};

export function ContextPanel({
  moduleGuide,
  questionGuide,
  responsesCount,
  totalStudents,
  hiddenCount,
  voteOptionCount,
  sessionStatus,
  selectedStudent,
  studentResponses,
  onSelectStudent,
  onClose,
  students = [],
  studentStates = [],
  onNudge,
  onWarn,
}: ContextPanelProps) {
  const [alertsExpanded, setAlertsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("guide");
  const [nudgeStudentId, setNudgeStudentId] = useState<string | null>(null);
  const [nudgeText, setNudgeText] = useState("");
  const pct = totalStudents > 0 ? Math.round((responsesCount / totalStudents) * 100) : 0;
  const highlightedCount = studentResponses.filter((r) => r.is_highlighted).length || 0;

  // Helper: get state for a student
  function getState(studentId: string): StudentStateValue {
    return studentStates.find((s) => s.id === studentId)?.state || "disconnected";
  }

  // Sort students: waiting first, then stuck, then responded, then disconnected
  const sortedStudents = [...students].sort((a, b) => {
    const order: Record<StudentStateValue, number> = { active: 0, stuck: 1, responded: 2, disconnected: 3 };
    return (order[getState(a.id)] ?? 4) - (order[getState(b.id)] ?? 4);
  });

  const respondedStudentCount = studentStates.filter((s) => s.state === "responded").length;

  // ── Student detail view ──
  if (selectedStudent) {
    const studentState = getState(selectedStudent.id);
    return (
      <aside className="w-[280px] glass-card border-l border-white/[0.06] flex flex-col h-full flex-shrink-0 rounded-none">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.06] flex-shrink-0">
          <button
            onClick={() => onSelectStudent(null)}
            className="text-[10px] text-bw-muted hover:text-white cursor-pointer transition-colors"
          >
            ← Retour
          </button>
          <button
            onClick={onClose}
            className="text-[10px] text-bw-muted hover:text-white cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {/* Student header */}
          <div className="flex items-center gap-2">
            <span className="text-xl">{selectedStudent.avatar}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{selectedStudent.display_name}</p>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATE_COLORS[studentState] }} />
                  {STATE_LABELS[studentState]}
                </span>
                {selectedStudent.warnings > 0 && (
                  <span className="text-bw-amber">⚠️ {selectedStudent.warnings} avert.</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex gap-2">
            {onNudge && (
              <button
                onClick={() => {
                  if (nudgeStudentId === selectedStudent.id) {
                    if (nudgeText.trim()) {
                      onNudge(selectedStudent.id, nudgeText.trim());
                      setNudgeStudentId(null);
                      setNudgeText("");
                      toast.success("Message envoyé");
                    }
                  } else {
                    setNudgeStudentId(selectedStudent.id);
                    setNudgeText("");
                  }
                }}
                className="flex-1 py-1.5 px-2 rounded-xl text-[10px] font-medium bg-bw-teal/10 text-bw-teal border border-bw-teal/20 cursor-pointer hover:border-bw-teal/40 transition-colors duration-200"
              >
                Envoyer un message
              </button>
            )}
            {onWarn && (
              <button
                onClick={() => {
                  onWarn(selectedStudent.id);
                }}
                className="py-1.5 px-2 rounded-xl text-[10px] font-medium bg-bw-amber/10 text-bw-amber border border-bw-amber/20 cursor-pointer hover:border-bw-amber/40 transition-colors duration-200"
              >
                Avertir
              </button>
            )}
          </div>

          {/* Nudge input */}
          {nudgeStudentId === selectedStudent.id && onNudge && (
            <div className="space-y-1.5">
              <input
                type="text"
                value={nudgeText}
                onChange={(e) => setNudgeText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && nudgeText.trim()) {
                    onNudge(selectedStudent.id, nudgeText.trim());
                    setNudgeStudentId(null);
                    setNudgeText("");
                    toast.success("Message envoyé");
                  }
                }}
                placeholder="Ton message..."
                autoFocus
                className="w-full px-2.5 py-1.5 rounded-xl bg-bw-surface border border-white/[0.06] text-xs text-white placeholder:text-bw-muted outline-none focus:border-bw-teal/40"
              />
              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    if (nudgeText.trim()) {
                      onNudge(selectedStudent.id, nudgeText.trim());
                      setNudgeStudentId(null);
                      setNudgeText("");
                      toast.success("Message envoyé");
                    }
                  }}
                  disabled={!nudgeText.trim()}
                  className="text-[10px] px-2 py-1 rounded bg-bw-teal text-black font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Envoyer
                </button>
                <button
                  onClick={() => { setNudgeStudentId(null); setNudgeText(""); }}
                  className="text-[10px] px-2 py-1 rounded text-bw-muted hover:text-white cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Student responses */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-bw-muted font-semibold">
              Réponses ({studentResponses.length})
            </p>
            {studentResponses.length === 0 ? (
              <p className="text-xs text-bw-muted">Aucune réponse pour ce module</p>
            ) : (
              <div className="space-y-1.5">
                {studentResponses.map((r) => (
                  <div
                    key={r.id}
                    className={`bg-bw-surface rounded-xl p-2.5 border text-xs leading-relaxed ${
                      r.is_hidden
                        ? "border-bw-amber/20 opacity-60"
                        : r.is_highlighted
                          ? "border-bw-teal/30"
                          : "border-white/[0.06]"
                    }`}
                  >
                    <p className="text-bw-text">{r.text}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-bw-muted">
                        {new Date(r.submitted_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {r.is_hidden && <span className="text-[10px] text-bw-amber">Masquée</span>}
                      {r.is_highlighted && <span className="text-[10px] text-bw-teal">Mise en avant</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    );
  }

  // ── Tab header + content ──
  return (
    <aside className="w-[280px] glass-card border-l border-white/[0.06] flex flex-col h-full flex-shrink-0 rounded-none">
      {/* Header with close + tabs */}
      <div className="border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-0.5">
            {([
              { id: "guide" as TabId, label: "Guide", icon: "📖", activeColor: "#FF6B35" },
              { id: "students" as TabId, label: "Élèves", icon: "👥", activeColor: "#4ECDC4" },
              { id: "stats" as TabId, label: "Stats", icon: "📊", activeColor: "#8B5CF6" },
            ]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1.5 rounded-xl text-[10px] font-medium cursor-pointer transition-all duration-200 ${
                  activeTab === tab.id
                    ? "text-white"
                    : "text-bw-muted hover:text-bw-text hover:bg-white/[0.04]"
                }`}
                style={activeTab === tab.id ? { background: `${tab.activeColor}15`, color: tab.activeColor } : undefined}
              >
                <span className="mr-0.5">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="text-[10px] text-bw-muted hover:text-white cursor-pointer transition-colors ml-1"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {/* ═══ TAB: Guide ═══ */}
        {activeTab === "guide" && (
          <>
            {/* Question Guide */}
            {questionGuide && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-bw-primary/15 text-bw-primary">
                    Q{questionGuide.position}
                  </span>
                  <span className="text-xs font-semibold truncate">{questionGuide.label}</span>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-bw-muted mb-0.5">Ce qu&apos;on attend</p>
                  <p className="text-xs text-bw-text leading-relaxed">{questionGuide.whatToExpect}</p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-bw-muted mb-0.5">Pièges fréquents</p>
                  <p className="text-xs text-bw-amber leading-relaxed">{questionGuide.commonPitfalls}</p>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(questionGuide.relancePhrase);
                    toast.success("Copié !");
                  }}
                  className="w-full text-left bg-bw-teal/5 border border-bw-teal/20 rounded-xl px-2.5 py-2 cursor-pointer hover:border-bw-teal/40 transition-colors duration-200 group"
                >
                  <span className="text-[10px] text-bw-teal font-semibold">Relancer</span>
                  <p className="text-xs text-bw-text italic leading-relaxed mt-0.5">
                    &ldquo;{questionGuide.relancePhrase}&rdquo;
                  </p>
                  <span className="text-[9px] text-bw-muted group-hover:text-bw-teal transition-colors">clic = copier</span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(questionGuide.challengePhrase);
                    toast.success("Copié !");
                  }}
                  className="w-full text-left bg-bw-violet/5 border border-bw-violet/20 rounded-xl px-2.5 py-2 cursor-pointer hover:border-bw-violet/40 transition-colors duration-200 group"
                >
                  <span className="text-[10px] text-bw-violet font-semibold">Challenger</span>
                  <p className="text-xs text-bw-text italic leading-relaxed mt-0.5">
                    &ldquo;{questionGuide.challengePhrase}&rdquo;
                  </p>
                  <span className="text-[9px] text-bw-muted group-hover:text-bw-violet transition-colors">clic = copier</span>
                </button>
              </div>
            )}

            {/* Alertes */}
            {moduleGuide && moduleGuide.aQuoiEtreAttentif?.length > 0 && (
              <div className="space-y-1.5">
                <button
                  onClick={() => setAlertsExpanded(!alertsExpanded)}
                  className="flex items-center gap-1.5 w-full text-left cursor-pointer group"
                >
                  <span className="text-[10px] uppercase tracking-wider text-bw-amber font-semibold">
                    Signaux
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-bw-amber/10 text-bw-amber">
                    {moduleGuide.aQuoiEtreAttentif.length}
                  </span>
                  <svg
                    width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#F59E0B"
                    strokeWidth="2" strokeLinecap="round"
                    className={`ml-auto transition-transform ${alertsExpanded ? "rotate-180" : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {alertsExpanded && (
                  <ul className="space-y-1">
                    {moduleGuide.aQuoiEtreAttentif.map((signal, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[11px] text-bw-text leading-relaxed">
                        <span className="text-bw-amber flex-shrink-0 mt-0.5">!</span>
                        {signal}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Empty state when no guide */}
            {!questionGuide && (!moduleGuide || !moduleGuide.aQuoiEtreAttentif?.length) && (
              <p className="text-xs text-bw-muted text-center py-4">Aucun guide pour ce module</p>
            )}
          </>
        )}

        {/* ═══ TAB: Students ═══ */}
        {activeTab === "students" && (
          <>
            {/* Counter */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-bw-muted font-semibold">Élèves</span>
              <span className="text-xs text-bw-teal font-medium tabular-nums">
                {respondedStudentCount}/{students.length} ont répondu
              </span>
            </div>

            {/* Student list */}
            {sortedStudents.length > 0 ? (
              <div className="space-y-0.5">
                {sortedStudents.map((s) => {
                  const state = getState(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => onSelectStudent(s)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl cursor-pointer transition-colors duration-200 hover:bg-white/[0.04] text-left"
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: STATE_COLORS[state] }}
                      />
                      <span className="text-sm flex-shrink-0">{s.avatar}</span>
                      <span className="text-[11px] text-bw-text truncate flex-1">{s.display_name}</span>
                      {state === "responded" && (
                        <span className="text-[9px] text-bw-teal font-medium flex-shrink-0">OK</span>
                      )}
                      {state === "stuck" && (
                        <span className="text-[9px] text-bw-amber flex-shrink-0">...</span>
                      )}
                      {s.warnings > 0 && (
                        <span className="text-[9px] text-bw-amber flex-shrink-0">⚠️{s.warnings}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-bw-muted text-center py-4">Aucun élève connecté</p>
            )}
          </>
        )}

        {/* ═══ TAB: Stats ═══ */}
        {activeTab === "stats" && (
          <>
            <p className="text-[10px] uppercase tracking-wider text-bw-muted font-semibold">Stats live</p>

            {/* Progress ring */}
            <div className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: "linear-gradient(135deg, rgba(78,205,196,0.06), transparent)" }}>
              <div className="relative w-14 h-14 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(78,205,196,0.1)" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.5" fill="none" strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${pct * 0.974} 100`}
                    className="transition-all duration-500"
                    style={{ stroke: pct === 100 ? "#10B981" : "#4ECDC4" }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold tabular-nums" style={{ color: pct === 100 ? "#10B981" : "#4ECDC4" }}>
                  {pct}%
                </span>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-bw-text">{responsesCount}/{totalStudents} réponses</p>
                <p className="text-[10px] text-bw-muted">
                  {totalStudents - responsesCount} en attente
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="h-1.5 bg-bw-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-bw-teal rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5">
              {hiddenCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-bw-amber/10 text-bw-amber">
                  {hiddenCount} masquée{hiddenCount !== 1 ? "s" : ""}
                </span>
              )}
              {sessionStatus === "responding" && voteOptionCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-bw-primary/10 text-bw-primary">
                  {voteOptionCount} sélectionnée{voteOptionCount !== 1 ? "s" : ""}
                </span>
              )}
              {highlightedCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-bw-teal/10 text-bw-teal">
                  {highlightedCount} mise{highlightedCount !== 1 ? "s" : ""} en avant
                </span>
              )}
            </div>

            {/* Mini response rhythm — simple text-based bars */}
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase tracking-wider text-bw-muted font-semibold">Rythme d&apos;arrivée</p>
              <ResponseRhythm responses={studentResponses} />
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

/** Mini bar chart showing response arrival rhythm over last 2 minutes */
function ResponseRhythm({ responses }: { responses: Response[] }) {
  const now = Date.now();
  const twoMinsAgo = now - 120_000;
  // 4 buckets of 30s each
  const buckets = [0, 0, 0, 0];
  for (const r of responses) {
    const t = new Date(r.submitted_at).getTime();
    if (t < twoMinsAgo) continue;
    const bucket = Math.min(3, Math.floor((now - t) / 30000));
    buckets[3 - bucket]++;
  }
  const max = Math.max(1, ...buckets);
  const labels = ["-2m", "-1m30", "-1m", "-30s"];

  return (
    <div className="flex items-end gap-1 h-8">
      {buckets.map((count, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
          <div
            className="w-full rounded-sm bg-bw-teal/40 transition-all duration-300"
            style={{ height: `${Math.max(2, (count / max) * 24)}px` }}
          />
          <span className="text-[7px] text-bw-muted">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}
