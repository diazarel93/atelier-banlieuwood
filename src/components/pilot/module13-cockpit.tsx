"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { POSTPROD_STEPS, MUSIC_GENRES, MUSIC_MOODS, POSTER_STYLES } from "@/lib/module13-data";
import type { Module13Data } from "@/hooks/use-session-polling";

interface Module13CockpitProps {
  sessionId: string;
  module13: Module13Data;
  connectedCount: number;
}

export function Module13Cockpit({ sessionId, module13, connectedCount }: Module13CockpitProps) {
  const queryClient = useQueryClient();
  const stepConfig = POSTPROD_STEPS[module13.position - 1];

  // Validate result mutation
  const validateResult = useMutation({
    mutationFn: async ({ position, resultType, resultData }: { position: number; resultType: string; resultData: unknown }) => {
      const res = await fetch(`/api/sessions/${sessionId}/postprod`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position, resultType, resultData }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Résultat validé !");
      queryClient.invalidateQueries({ queryKey: ["session-cockpit", sessionId] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Erreur");
    },
  });

  const hasResult = module13.allResults.some((r) => r.position === module13.position);

  return (
    <div className="space-y-6">
      {/* Progress dots + step info */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/50">Étape {module13.position}/8</p>
          <h3 className="text-lg font-bold text-white">
            {stepConfig?.emoji} {module13.stepLabel}
          </h3>
          <p className="text-xs text-white/40 mt-1">{module13.stepDescription}</p>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: 8 }, (_, i) => {
            const p = i + 1;
            const done = module13.allResults.some((r) => r.position === p);
            const isCurrent = p === module13.position;
            return (
              <div
                key={p}
                className={`w-3 h-3 rounded-full transition-all ${
                  done ? "bg-cyan-400" : isCurrent ? "bg-yellow-400 animate-pulse" : "bg-white/15"
                }`}
                title={`Étape ${p}${done ? " (validée)" : isCurrent ? " (en cours)" : ""}`}
              />
            );
          })}
        </div>
      </div>

      {/* Submission counter */}
      <div className="flex items-center gap-4 text-sm text-white/60">
        <span>Réponses : {module13.submittedCount}/{connectedCount}</span>
        {hasResult && (
          <span className="text-cyan-400 font-semibold">Validé</span>
        )}
      </div>

      {/* Position-specific content */}
      {module13.position === 1 && (
        <MontageView module13={module13} onValidate={(data) => validateResult.mutate({ position: 1, resultType: "montage", resultData: data })} hasResult={hasResult} isPending={validateResult.isPending} />
      )}
      {module13.position === 2 && (
        <MusiqueView module13={module13} onValidate={(data) => validateResult.mutate({ position: 2, resultType: "musique", resultData: data })} hasResult={hasResult} isPending={validateResult.isPending} />
      )}
      {module13.position === 3 && (
        <TitreView module13={module13} onValidate={(data) => validateResult.mutate({ position: 3, resultType: "titre", resultData: data })} hasResult={hasResult} isPending={validateResult.isPending} />
      )}
      {module13.position === 4 && (
        <AfficheView module13={module13} onValidate={(data) => validateResult.mutate({ position: 4, resultType: "affiche", resultData: data })} hasResult={hasResult} isPending={validateResult.isPending} />
      )}
      {module13.position === 5 && (
        <TrailerView module13={module13} onValidate={(data) => validateResult.mutate({ position: 5, resultType: "trailer", resultData: data })} hasResult={hasResult} isPending={validateResult.isPending} />
      )}
      {module13.position >= 6 && (
        <div className="text-center text-white/50 py-4">
          <p className="text-sm">Cette étape utilise les réponses classiques.</p>
          <p className="text-xs mt-1">Les réponses apparaissent dans le fil ci-dessous.</p>
        </div>
      )}

      {/* Results history */}
      {module13.allResults.length > 0 && (
        <div className="mt-6 pt-4 border-t border-[#DDD7EC]">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-3">
            Décisions finales ({module13.allResults.length}/8)
          </p>
          <div className="space-y-2">
            {module13.allResults.map((r) => {
              const step = POSTPROD_STEPS[r.position - 1];
              return (
                <div key={r.position} className="flex gap-3 text-sm">
                  <span className="text-cyan-400 font-semibold w-36 flex-shrink-0">
                    {step?.emoji} {step?.label || `Étape ${r.position}`}
                  </span>
                  <span className="text-white/70 truncate">
                    {(r.data as { summary?: string })?.summary || r.type}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Position 1: Montage view ────────────────────────────
function MontageView({ module13, onValidate, hasResult, isPending }: {
  module13: Module13Data;
  onValidate: (data: unknown) => void;
  hasResult: boolean;
  isPending: boolean;
}) {
  // Show count of scene orders submitted
  if (module13.submittedCount === 0) {
    return <p className="text-white/40 text-sm text-center py-4">En attente des propositions d&apos;ordre...</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-white/60">{module13.submittedCount} proposition{module13.submittedCount > 1 ? "s" : ""} d&apos;ordre reçue{module13.submittedCount > 1 ? "s" : ""}</p>
      {!hasResult && (
        <button
          onClick={() => onValidate({ summary: `${module13.submittedCount} ordres proposés` })}
          disabled={isPending}
          className="px-4 py-2 text-sm bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 rounded-lg transition-colors border border-cyan-500/30"
        >
          Valider l&apos;étape
        </button>
      )}
    </div>
  );
}

// ── Position 2: Musique view ────────────────────────────
function MusiqueView({ module13, onValidate, hasResult, isPending }: {
  module13: Module13Data;
  onValidate: (data: unknown) => void;
  hasResult: boolean;
  isPending: boolean;
}) {
  const allChoices = module13.allChoices || [];

  // Count by genre
  const genreCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of allChoices) {
      counts[c.genre] = (counts[c.genre] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [allChoices]);

  // Count by mood
  const moodCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of allChoices) {
      counts[c.mood] = (counts[c.mood] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [allChoices]);

  if (allChoices.length === 0) {
    return <p className="text-white/40 text-sm text-center py-4">En attente des choix musicaux...</p>;
  }

  const topGenre = genreCounts[0];
  const topMood = moodCounts[0];
  const genreLabel = MUSIC_GENRES.find((g) => g.key === topGenre?.[0])?.label || topGenre?.[0];
  const moodLabel = MUSIC_MOODS.find((m) => m.key === topMood?.[0])?.label || topMood?.[0];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-white/40 mb-2">Genres populaires</p>
          {genreCounts.map(([genre, count]) => {
            const g = MUSIC_GENRES.find((x) => x.key === genre);
            return (
              <div key={genre} className="flex items-center gap-2 text-sm text-white/70 mb-1">
                <span>{g?.emoji}</span>
                <span className="flex-1">{g?.label || genre}</span>
                <span className="text-white/40">{count}</span>
              </div>
            );
          })}
        </div>
        <div>
          <p className="text-xs text-white/40 mb-2">Ambiances</p>
          {moodCounts.map(([mood, count]) => {
            const m = MUSIC_MOODS.find((x) => x.key === mood);
            return (
              <div key={mood} className="flex items-center gap-2 text-sm text-white/70 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m?.color || "#888" }} />
                <span className="flex-1">{m?.label || mood}</span>
                <span className="text-white/40">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {!hasResult && topGenre && topMood && (
        <button
          onClick={() => onValidate({ summary: `${genreLabel} / ${moodLabel}`, genre: topGenre[0], mood: topMood[0] })}
          disabled={isPending}
          className="px-4 py-2 text-sm bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 rounded-lg transition-colors border border-cyan-500/30"
        >
          Valider : {genreLabel} / {moodLabel}
        </button>
      )}
    </div>
  );
}

// ── Position 3: Titre view ──────────────────────────────
function TitreView({ module13, onValidate, hasResult, isPending }: {
  module13: Module13Data;
  onValidate: (data: unknown) => void;
  hasResult: boolean;
  isPending: boolean;
}) {
  const allTitres = module13.allTitres || [];

  if (allTitres.length === 0) {
    return <p className="text-white/40 text-sm text-center py-4">En attente des propositions de titre...</p>;
  }

  return (
    <div className="space-y-3">
      {allTitres.map((t, i) => (
        <motion.div
          key={i}
          layout
          className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
        >
          <p className="flex-1 text-white font-medium">{t.titre}</p>
          {!hasResult && (
            <button
              onClick={() => onValidate({ summary: t.titre, titre: t.titre })}
              disabled={isPending}
              className="px-3 py-1.5 text-xs bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 rounded-lg transition-colors border border-cyan-500/30"
            >
              Choisir
            </button>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// ── Position 4: Affiche view ────────────────────────────
function AfficheView({ module13, onValidate, hasResult, isPending }: {
  module13: Module13Data;
  onValidate: (data: unknown) => void;
  hasResult: boolean;
  isPending: boolean;
}) {
  const allAffiches = module13.allAffiches || [];

  if (allAffiches.length === 0) {
    return <p className="text-white/40 text-sm text-center py-4">En attente des concepts d&apos;affiche...</p>;
  }

  return (
    <div className="space-y-3">
      {allAffiches.map((a, i) => {
        const styleInfo = POSTER_STYLES.find((s) => s.key === a.style);
        return (
          <motion.div
            key={i}
            layout
            className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/60">{styleInfo?.label || a.style}</span>
              {a.tagline && <span className="text-xs text-white/40 italic">&ldquo;{a.tagline}&rdquo;</span>}
            </div>
            <p className="text-sm text-white/80">{a.description}</p>
            {!hasResult && (
              <button
                onClick={() => onValidate({ summary: `${styleInfo?.label}: ${a.description.slice(0, 50)}`, style: a.style, description: a.description, tagline: a.tagline })}
                disabled={isPending}
                className="px-3 py-1.5 text-xs bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 rounded-lg transition-colors border border-cyan-500/30"
              >
                Choisir cette affiche
              </button>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Position 5: Trailer view ────────────────────────────
function TrailerView({ module13, onValidate, hasResult, isPending }: {
  module13: Module13Data;
  onValidate: (data: unknown) => void;
  hasResult: boolean;
  isPending: boolean;
}) {
  if (module13.submittedCount === 0) {
    return <p className="text-white/40 text-sm text-center py-4">En attente des propositions de bande-annonce...</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-white/60">{module13.submittedCount} proposition{module13.submittedCount > 1 ? "s" : ""} reçue{module13.submittedCount > 1 ? "s" : ""}</p>
      {!hasResult && (
        <button
          onClick={() => onValidate({ summary: `${module13.submittedCount} bandes-annonces proposées` })}
          disabled={isPending}
          className="px-4 py-2 text-sm bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 rounded-lg transition-colors border border-cyan-500/30"
        >
          Valider l&apos;étape
        </button>
      )}
    </div>
  );
}
