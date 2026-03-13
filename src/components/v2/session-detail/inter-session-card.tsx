"use client";

import { useState } from "react";
import { GlassCardV2 } from "@/components/v2/glass-card";
import { toast } from "sonner";

interface InterSessionCardProps {
  sessionId: string;
  currentModule: number;
}

export function InterSessionCard({ sessionId, currentModule }: InterSessionCardProps) {
  const [loading, setLoading] = useState(false);

  // M6 (dbModule=5): Generate scenes from M12 winners
  if (currentModule === 5) {
    return (
      <GlassCardV2 variant="flat" className="p-5 border-l-4 border-l-emerald-500">
        <div className="flex items-start gap-4">
          <div className="text-2xl">🎬</div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-bw-heading">
              Inter-séance : Générer les scènes
            </h3>
            <p className="text-xs text-bw-muted mt-1">
              Génère 4-6 scènes incomplètes à partir des choix collectifs du Module 5 (Construction Collective).
              Les élèves les compléteront pendant le Module 6.
            </p>
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  const res = await fetch(`/api/sessions/${sessionId}/scenario-generate`, {
                    method: "POST",
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || "Erreur");
                  toast.success(`${data.scenesCount || "Des"} scènes générées + missions assignées`);
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Erreur de génération");
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors disabled:opacity-50"
            >
              {loading ? "Génération en cours..." : "Générer les scènes IA"}
            </button>
          </div>
        </div>
      </GlassCardV2>
    );
  }

  // M7 (dbModule=7): Generate fiches de tournage for M8
  if (currentModule === 7) {
    return (
      <GlassCardV2 variant="flat" className="p-5 border-l-4 border-l-violet-500">
        <div className="flex items-start gap-4">
          <div className="text-2xl">📋</div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-bw-heading">
              Inter-séance : Fiches de tournage
            </h3>
            <p className="text-xs text-bw-muted mt-1">
              Génère 6 fiches par rôle (réalisateur, cadreur, scripte, assistant, son, acteur)
              à partir du scénario et du storyboard.
            </p>
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  const res = await fetch(`/api/sessions/${sessionId}/fiches-tournage`, {
                    method: "POST",
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || "Erreur");
                  toast.success(`${data.count || 6} fiches de tournage générées`);
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Erreur de génération");
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition-colors disabled:opacity-50"
            >
              {loading ? "Génération en cours..." : "Générer les fiches de tournage"}
            </button>
          </div>
        </div>
      </GlassCardV2>
    );
  }

  // M8 (dbModule=8): Compute points from all modules
  if (currentModule === 8) {
    return (
      <GlassCardV2 variant="flat" className="p-5 border-l-4 border-l-amber-500">
        <div className="flex items-start gap-4">
          <div className="text-2xl">🏆</div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-bw-heading">
              Inter-séance : Calculer les points
            </h3>
            <p className="text-xs text-bw-muted mt-1">
              Calcule les scores de participation, créativité et engagement de chaque élève.
              L'ordre de choix des rôles sera basé sur ce classement (invisible aux élèves).
            </p>
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  const res = await fetch(`/api/sessions/${sessionId}/equipe-compute`, {
                    method: "POST",
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || "Erreur");
                  toast.success(`Classement calculé pour ${data.ranking?.length || 0} élèves`);
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Erreur de calcul");
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500 transition-colors disabled:opacity-50"
            >
              {loading ? "Calcul en cours..." : "Calculer les points"}
            </button>
          </div>
        </div>
      </GlassCardV2>
    );
  }

  return null;
}
