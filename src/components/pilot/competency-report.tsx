"use client";

import { memo } from "react";
import { motion } from "motion/react";

// ═══════════════════════════════════════════════════════════════
// COMPETENCY REPORT — LSU (Livret Scolaire Unique) mapping
// French national curriculum competency framework
// ═══════════════════════════════════════════════════════════════

interface StudentCompetency {
  studentId: string;
  studentName: string;
  studentAvatar: string;
  competencies: CompetencyScore[];
  overallLevel: "non_atteint" | "partiellement" | "atteint" | "depasse";
}

interface CompetencyScore {
  id: string;
  name: string;
  domain: string;
  level: "non_atteint" | "partiellement" | "atteint" | "depasse";
  evidence: string[];
}

// LSU Competency domains mapped to Banlieuwood modules
const LSU_DOMAINS = [
  {
    id: "d1_langue",
    name: "D1 — Langue francaise",
    icon: "📝",
    competencies: [
      { id: "c1_ecrire", name: "S'exprimer a l'ecrit", moduleLink: "Tous les modules (reponses ecrites)" },
      { id: "c1_argumenter", name: "Argumenter et justifier", moduleLink: "M4 Vis ma vie, M11 Cine-Debat" },
      { id: "c1_vocabulaire", name: "Enrichir son vocabulaire", moduleLink: "M1 Positionnement, M3 Le Heros" },
    ],
  },
  {
    id: "d2_methodes",
    name: "D2 — Methodes et outils",
    icon: "🧰",
    competencies: [
      { id: "c2_collaborer", name: "Cooperer et realiser des projets", moduleLink: "M12 Construction Collective" },
      { id: "c2_organiser", name: "Organiser son travail", moduleLink: "M9 Cinema (budget), M10 Pitch" },
      { id: "c2_numerique", name: "Utiliser les outils numeriques", moduleLink: "Tous les modules" },
    ],
  },
  {
    id: "d3_citoyen",
    name: "D3 — Formation du citoyen",
    icon: "🏛️",
    competencies: [
      { id: "c3_sensibilite", name: "Sensibilite et expression", moduleLink: "M2 Emotion Cachee, M5" },
      { id: "c3_jugement", name: "Jugement et esprit critique", moduleLink: "M11 Cine-Debat, M4 Vis ma vie" },
      { id: "c3_engagement", name: "Engagement et initiative", moduleLink: "M10 Pitch, M12 Collectif" },
    ],
  },
  {
    id: "d5_culture",
    name: "D5 — Representations du monde",
    icon: "🌍",
    competencies: [
      { id: "c5_culture", name: "Culture et creation artistique", moduleLink: "M3 Le Heros, M9 Cinema" },
      { id: "c5_imagination", name: "Imagination et creativite", moduleLink: "M10 Et si..., M1 Positionnement" },
    ],
  },
];

const LEVEL_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  non_atteint: { label: "Non atteint", color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
  partiellement: { label: "Partiellement", color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  atteint: { label: "Atteint", color: "#4ECDC4", bg: "rgba(78,205,196,0.1)" },
  depasse: { label: "Depasse", color: "#10B981", bg: "rgba(16,185,129,0.1)" },
};

interface CompetencyReportProps {
  students: StudentCompetency[];
  sessionTitle?: string;
}

function CompetencyReportInner({ students, sessionTitle }: CompetencyReportProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-bw-heading flex items-center gap-2">📊 Bilan par Competences</h2>
          {sessionTitle && <p className="text-sm text-bw-muted mt-0.5">{sessionTitle}</p>}
        </div>
        <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-bw-primary/10 text-bw-primary hover:bg-bw-primary/20 transition-colors cursor-pointer">
          Exporter PDF
        </button>
      </div>

      {/* LSU Grid */}
      {students.length === 0 ? (
        <p className="text-sm text-bw-muted text-center py-8">Pas assez de donnees pour generer un bilan.</p>
      ) : (
        <div className="space-y-4">
          {students.map((student, si) => (
            <motion.div
              key={student.studentId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: si * 0.05 }}
              className="rounded-xl border border-black/[0.04] overflow-hidden"
            >
              {/* Student header */}
              <div className="px-4 py-3 bg-black/[0.02] border-b border-black/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{student.studentAvatar}</span>
                  <span className="text-sm font-bold text-bw-heading">{student.studentName}</span>
                </div>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{
                    color: LEVEL_LABELS[student.overallLevel].color,
                    background: LEVEL_LABELS[student.overallLevel].bg,
                  }}
                >
                  {LEVEL_LABELS[student.overallLevel].label}
                </span>
              </div>

              {/* Competency domains */}
              <div className="px-4 py-3 space-y-3">
                {LSU_DOMAINS.map((domain) => {
                  const domainScores = student.competencies.filter((c) =>
                    domain.competencies.some((dc) => dc.id === c.id),
                  );

                  return (
                    <div key={domain.id}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-sm">{domain.icon}</span>
                        <span className="text-xs font-semibold text-bw-text">{domain.name}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 pl-6">
                        {domain.competencies.map((comp) => {
                          const score = domainScores.find((s) => s.id === comp.id);
                          const level = score?.level || "non_atteint";
                          const levelInfo = LEVEL_LABELS[level];

                          return (
                            <div
                              key={comp.id}
                              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg"
                              style={{ background: levelInfo.bg }}
                            >
                              <span className="text-xs text-bw-text truncate flex-1">{comp.name}</span>
                              <span className="text-xs font-bold ml-2 flex-shrink-0" style={{ color: levelInfo.color }}>
                                {level === "non_atteint"
                                  ? "○"
                                  : level === "partiellement"
                                    ? "◐"
                                    : level === "atteint"
                                      ? "●"
                                      : "★"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 justify-center">
        {Object.entries(LEVEL_LABELS).map(([key, info]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: info.color }} />
            <span className="text-xs text-bw-muted">{info.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const CompetencyReport = memo(CompetencyReportInner);
