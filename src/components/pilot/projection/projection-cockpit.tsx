"use client";

import { useState } from "react";
import { useCockpitData } from "@/components/pilot/cockpit-context";
import { LateralDrawer } from "./lateral-drawer";
import { ProjectionHeader } from "./projection-header";
import { ProjectionCenter } from "./projection-center";
import { ProjectionFooter } from "./projection-footer";
import { ProjectionClasseDrawer } from "./projection-classe-drawer";
import { ProjectionResponsesDrawer } from "./projection-responses-drawer";

export function ProjectionCockpit() {
  const { activeStudents, responses } = useCockpitData();

  const [classeOpen, setClasseOpen] = useState(false);
  const [reponsesOpen, setReponsesOpen] = useState(false);

  // Stable sessionStartedAt — initialised once at mount
  const [sessionStartedAt] = useState<number>(() => Date.now());

  // Students en attente (pas encore répondu)
  const respondedIds = new Set(responses.map((r) => r.student_id));
  const enAttente = activeStudents.filter((s) => !respondedIds.has(s.id)).length;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F7F3EA]">
      <ProjectionHeader sessionStartedAt={sessionStartedAt} />

      <div className="flex-1 flex overflow-hidden">
        {/* Drawer gauche — Classe */}
        <LateralDrawer
          side="left"
          open={classeOpen}
          onClose={() => setClasseOpen(false)}
          title="Classe"
          badge={enAttente}
        >
          <ProjectionClasseDrawer />
        </LateralDrawer>

        {/* Zone centrale — radial gradient "halo projecteur" signature Direction C */}
        <main
          className="flex-1 flex flex-col items-center justify-center px-6 py-4 min-w-0 overflow-y-auto"
          style={{ background: "radial-gradient(ellipse at center, rgba(255,107,53,0.05), transparent 65%)" }}
        >
          <ProjectionCenter />
        </main>

        {/* Drawer droit — Réponses */}
        <LateralDrawer
          side="right"
          open={reponsesOpen}
          onClose={() => setReponsesOpen(false)}
          title="Réponses"
          badge={responses.length}
        >
          <ProjectionResponsesDrawer />
        </LateralDrawer>
      </div>

      {/* Footer tablet uniquement */}
      <ProjectionFooter
        onOpenClasse={() => setClasseOpen(true)}
        onOpenReponses={() => setReponsesOpen(true)}
        classeCount={enAttente}
        reponseCount={responses.length}
      />
    </div>
  );
}
