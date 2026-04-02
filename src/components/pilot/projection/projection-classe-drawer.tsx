"use client";

import { useCockpitData } from "@/components/pilot/cockpit-context";

export function ProjectionClasseDrawer() {
  const { activeStudents, responses } = useCockpitData();

  const respondedIds = new Set(responses.map((r) => r.student_id));
  const respondedCount = activeStudents.filter((s) => respondedIds.has(s.id)).length;
  const totalActive = activeStudents.length;
  const progressPct = totalActive > 0 ? Math.round((respondedCount / totalActive) * 100) : 0;

  return (
    <div className="space-y-3">
      {/* Barre progression globale */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#4A4A4A]">Réponses</span>
          <span className="text-xs font-bold text-[#2C2C2C] tabular-nums">
            {respondedCount} / {totalActive}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-[#E8DFD2] overflow-hidden">
          <div
            className="h-full rounded-full bg-bw-teal transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Liste élèves */}
      <ul className="space-y-1.5">
        {activeStudents.map((student) => {
          const hasResponded = respondedIds.has(student.id);
          return (
            <li key={student.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-white/60">
              {/* Badge statut — AUCUN score, AUCUN classement (doctrine Banlieuwood) */}
              <span
                className="flex-shrink-0 w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: hasResponded ? "var(--color-bw-teal)" : "var(--color-bw-gold)" }}
                title={hasResponded ? "A répondu" : "En attente"}
              />
              <span className="text-sm text-[#2C2C2C] truncate">{student.display_name}</span>
            </li>
          );
        })}
      </ul>

      {activeStudents.length === 0 && <p className="text-center text-sm text-[#4A4A4A] py-6">Aucun élève connecté</p>}
    </div>
  );
}
