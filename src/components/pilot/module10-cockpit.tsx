"use client";

import { motion } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DiceBearAvatarMini } from "@/components/avatar-dicebear";
import { GenericInlineActions } from "@/components/pilot/response-actions";

interface Module10Data {
  type: string;
  image?: { id: string; url: string; title: string; description: string } | null;
  etsiText?: string;
  helpUsed?: boolean;
  submitted?: boolean;
  submittedCount?: number;
  ideaBankCount?: number;
  ideaBankItems?: { id: string; text: string; votes: number }[];
  personnage?: { prenom: string; trait: string; avatar: Record<string, string> } | null;
  objectif?: string | null;
  obstacle?: string | null;
  pitchText?: string | null;
  chronoSeconds?: number | null;
  confrontation?: {
    pitchA: { text: string; prenom: string; studentId: string };
    pitchB: { text: string; prenom: string; studentId: string };
  } | null;
  pitchList?: { studentId: string; prenom: string; text: string }[];
  allSubmissions?: { studentName: string; text: string; studentId: string; avatar?: Record<string, unknown> }[];
}

interface Module10CockpitProps {
  isEtsi: boolean;
  isPitch: boolean;
  module10Data: Module10Data | undefined;
  isPreviewing: boolean;
  cardSearch: string;
  selectedPitchIds: string[];
  setSelectedPitchIds: React.Dispatch<React.SetStateAction<string[]>>;
  sessionId: string;
  currentModule: number;
  currentSeance: number;
  currentSituationIndex: number;
  studentWarnings: Record<string, number>;
  onBroadcast: (msg: string) => void;
  onWarn: (studentId: string) => void;
  isWarnPending: boolean;
}

export function Module10Cockpit({
  isEtsi,
  module10Data,
  isPreviewing,
  cardSearch,
  selectedPitchIds,
  setSelectedPitchIds,
  sessionId,
  currentModule,
  currentSeance,
  currentSituationIndex,
  studentWarnings,
  onBroadcast,
  onWarn,
  isWarnPending,
}: Module10CockpitProps) {
  const queryClient = useQueryClient();

  return (
    <>
      {/* Activity context */}
      {!isPreviewing && (
        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{isEtsi ? "✨" : "🎤"}</span>
            <span className="text-sm font-semibold text-bw-heading">{isEtsi ? "Et si..." : "Pitch"}</span>
            <span className="text-xs text-bw-muted ml-auto uppercase tracking-wider">
              {module10Data?.type === "etsi"
                ? "Image + écriture + QCMs"
                : module10Data?.type === "idea-bank"
                  ? "Banque d'idées"
                  : module10Data?.type === "avatar"
                    ? "Création personnage"
                    : module10Data?.type === "objectif"
                      ? "Objectif + Obstacle"
                      : module10Data?.type === "pitch"
                        ? "Assemblage pitch"
                        : module10Data?.type === "chrono"
                          ? "Test chrono 30s"
                          : module10Data?.type === "confrontation"
                            ? "Confrontation"
                            : ""}
            </span>
          </div>
          <p className="text-xs text-bw-muted leading-relaxed">
            {module10Data?.type === "etsi"
              ? "Les élèves observent une image et écrivent leur « Et si... »."
              : module10Data?.type === "idea-bank"
                ? "Les élèves partagent leur meilleure idée « Et si... » et votent pour la plus inspirante."
                : module10Data?.type === "avatar"
                  ? "Les élèves construisent l'identité visuelle de leur personnage : look, prénom, trait de caractère."
                  : module10Data?.type === "objectif"
                    ? "Les élèves choisissent ce que leur personnage VEUT (objectif) et ce qui l'en EMPÊCHE (obstacle). C'est le moteur du conflit."
                    : module10Data?.type === "pitch"
                      ? "Les élèves écrivent un vrai récit (min 80 car.) à partir de leur personnage, objectif et obstacle. Pas de template — ils racontent l'histoire."
                      : module10Data?.type === "chrono"
                        ? "Les élèves lisent leur pitch à voix haute en 30 secondes. Exercice d'oral et de concision."
                        : module10Data?.type === "confrontation"
                          ? "Deux pitchs sont projetés. La classe écoute et vote pour celui qui donne le plus envie de voir le film."
                          : ""}
          </p>
        </div>
      )}

      {/* Et si... Image */}
      {module10Data?.type === "etsi" && module10Data.image && (
        <div className="rounded-xl overflow-hidden border border-bw-teal/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={module10Data.image.url}
            alt={module10Data.image.title}
            className="w-full h-auto max-h-48 object-cover"
          />
          <div className="bg-bw-elevated px-3 py-2 border-t border-black/[0.06]">
            <p className="text-xs font-medium text-bw-teal">{module10Data.image.title}</p>
            <p className="text-xs text-bw-muted mt-0.5 line-clamp-2">{module10Data.image.description}</p>
          </div>
        </div>
      )}

      {/* Pitch — personnage card */}
      {module10Data?.personnage &&
        (module10Data.type === "objectif" || module10Data.type === "pitch" || module10Data.type === "chrono") && (
          <div className="bg-bw-elevated rounded-xl p-3 border border-black/[0.06] flex items-center gap-3">
            <DiceBearAvatarMini options={module10Data.personnage.avatar || {}} size={40} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-bw-heading truncate">{module10Data.personnage.prenom}</p>
              <p className="text-xs text-bw-muted">{module10Data.personnage.trait}</p>
            </div>
            {module10Data.objectif && (
              <div className="text-right">
                <p className="text-xs text-bw-muted">Objectif</p>
                <p className="text-xs text-bw-teal truncate max-w-[120px]">{module10Data.objectif}</p>
              </div>
            )}
          </div>
        )}

      {/* Confrontation — pitch picker */}
      {module10Data?.type === "confrontation" && (
        <>
          {module10Data.confrontation && (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-bw-teal/10 rounded-xl p-3 border border-bw-teal/20">
                <p className="text-xs text-bw-teal font-bold uppercase mb-1">
                  Pitch A — {module10Data.confrontation.pitchA.prenom}
                </p>
                <p className="text-xs text-bw-text line-clamp-3">{module10Data.confrontation.pitchA.text}</p>
              </div>
              <div className="bg-bw-danger/10 rounded-xl p-3 border border-bw-danger/20">
                <p className="text-xs text-bw-danger font-bold uppercase mb-1">
                  Pitch B — {module10Data.confrontation.pitchB.prenom}
                </p>
                <p className="text-xs text-bw-text line-clamp-3">{module10Data.confrontation.pitchB.text}</p>
              </div>
            </div>
          )}
          {module10Data.pitchList && module10Data.pitchList.length >= 2 && (
            <div className="bg-bw-surface rounded-xl p-3 border border-black/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-bw-muted uppercase font-semibold tracking-wider">
                  Choisir les pitchs à confronter
                </span>
                <span className="text-xs text-bw-muted">{selectedPitchIds.length}/2</span>
              </div>
              {module10Data.pitchList.map((p) => {
                const isSelected = selectedPitchIds.includes(p.studentId);
                const idx = selectedPitchIds.indexOf(p.studentId);
                return (
                  <button
                    key={p.studentId}
                    onClick={() =>
                      setSelectedPitchIds((prev) => {
                        if (isSelected) return prev.filter((id) => id !== p.studentId);
                        if (prev.length >= 2) return [prev[1], p.studentId];
                        return [...prev, p.studentId];
                      })
                    }
                    className={`w-full text-left p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? idx === 0
                          ? "bg-bw-teal/10 border-bw-teal/30 text-bw-teal"
                          : "bg-bw-danger/10 border-bw-danger/30 text-bw-danger"
                        : "bg-bw-bg border-black/[0.06] text-bw-muted hover:border-bw-teal/20"
                    }`}
                  >
                    <span className="font-medium">
                      {isSelected ? (idx === 0 ? "A" : "B") + " — " : ""}
                      {p.prenom}
                    </span>
                    <span className="block text-xs text-bw-muted mt-0.5 line-clamp-1">{p.text}</span>
                  </button>
                );
              })}
              {selectedPitchIds.length === 2 && (
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(
                        `/api/sessions/${sessionId}/situation?pitchA=${selectedPitchIds[0]}&pitchB=${selectedPitchIds[1]}`,
                      );
                      if (res.ok) {
                        const data = await res.json();
                        queryClient.setQueryData(
                          ["pilot-situation", sessionId, currentModule, currentSeance, currentSituationIndex],
                          data,
                        );
                        toast.success("Duel mis à jour");
                      }
                    } catch {
                      toast.error("Erreur");
                    }
                  }}
                  className="w-full py-2 rounded-lg bg-bw-teal text-white text-xs font-medium cursor-pointer hover:brightness-110 transition-all"
                >
                  Lancer le duel
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Idea bank items */}
      {module10Data?.type === "idea-bank" && module10Data.ideaBankItems && module10Data.ideaBankItems.length > 0 && (
        <div className="bg-bw-surface rounded-xl p-3 border border-black/[0.06] space-y-1.5">
          <p className="text-xs text-bw-muted uppercase font-semibold tracking-wider">💡 Banque d&apos;idées</p>
          {module10Data.ideaBankItems.slice(0, 5).map((item) => (
            <div key={item.id} className="flex items-center gap-2 text-xs">
              <span className="text-bw-teal font-medium tabular-nums">{item.votes}♥</span>
              <span className="text-bw-text truncate">{item.text}</span>
            </div>
          ))}
          {module10Data.ideaBankItems.length > 5 && (
            <p className="text-xs text-bw-muted">+{module10Data.ideaBankItems.length - 5} autres</p>
          )}
        </div>
      )}

      {/* All submissions list */}
      {module10Data?.allSubmissions && module10Data.allSubmissions.length > 0 && (
        <div className="space-y-1.5">
          {module10Data.allSubmissions
            .filter(
              (sub) =>
                !cardSearch ||
                (sub.studentName || "").toLowerCase().includes(cardSearch.toLowerCase()) ||
                (sub.text || "").toLowerCase().includes(cardSearch.toLowerCase()),
            )
            .map((sub, i) => (
              <motion.div
                key={sub.studentId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-bw-surface rounded-xl p-3 border border-black/[0.06] space-y-2"
              >
                <div className="flex items-start gap-2">
                  {sub.avatar && <DiceBearAvatarMini options={sub.avatar} size={28} />}
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-bw-text">{sub.studentName}</span>
                    <p className="text-sm text-bw-heading leading-snug mt-0.5 whitespace-pre-wrap">{sub.text}</p>
                  </div>
                </div>
                <GenericInlineActions
                  entityId={sub.studentId}
                  studentId={sub.studentId}
                  studentName={sub.studentName}
                  onBroadcast={onBroadcast}
                  onWarn={onWarn}
                  isWarnPending={isWarnPending}
                  warnings={studentWarnings[sub.studentId] || 0}
                />
              </motion.div>
            ))}
        </div>
      )}
    </>
  );
}
