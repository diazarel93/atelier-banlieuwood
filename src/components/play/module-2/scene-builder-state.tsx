"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { Module5Data } from "@/hooks/use-session-polling";

export interface SceneBuilderStateProps {
  sessionId: string;
  studentId: string;
  module5: Module5Data;
  onDone: () => void;
}

export function SceneBuilderState({
  sessionId,
  studentId,
  module5,
  onDone,
}: SceneBuilderStateProps) {
  const [intention, setIntention] = useState(module5.scene?.intention || "");
  const [obstacle, setObstacle] = useState(module5.scene?.obstacle || "");
  const [changement, setChangement] = useState(module5.scene?.changement || "");
  const [selectedElements, setSelectedElements] = useState<Set<string>>(
    new Set(module5.scene?.elements?.map((e) => e.key) || [])
  );
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ strengths: string[]; suggestions: string[]; summary: string } | null>(
    module5.scene?.ai_feedback || null
  );

  // Lazy-load scene elements and emotion
  const [elements, setElements] = useState<{ key: string; label: string; tier: number; cost: number; slots: number }[]>([]);
  const [emotions, setEmotions] = useState<{ key: string; label: string; color: string }[]>([]);
  const [tierColors, setTierColors] = useState<Record<number, string>>({});
  const [tierLabels, setTierLabels] = useState<Record<number, string>>({});
  const [maxSlots, setMaxSlots] = useState(5);
  const [maxTokens, setMaxTokens] = useState(8);

  useEffect(() => {
    import("@/lib/module5-data").then((m) => {
      setElements(m.SCENE_ELEMENTS);
      setEmotions(m.EMOTIONS);
      setTierColors(m.TIER_COLORS);
      setTierLabels(m.TIER_LABELS);
      setMaxSlots(m.MAX_SLOTS);
      setMaxTokens(m.MAX_TOKENS);
    });
  }, []);

  const emotion = module5.chosenEmotion || "";
  const emotionInfo = emotions.find((e) => e.key === emotion);

  // Calculate totals
  const totalSlots = selectedElements.size;
  const totalTokens = Array.from(selectedElements).reduce((sum, key) => {
    const el = elements.find((e) => e.key === key);
    return sum + (el?.cost || 0);
  }, 0);

  function toggleElement(key: string) {
    setSelectedElements((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        const el = elements.find((e) => e.key === key);
        if (!el) return prev;
        if (next.size >= maxSlots) {
          toast.error(`Maximum ${maxSlots} emplacements`);
          return prev;
        }
        const newTokens = totalTokens + el.cost;
        if (newTokens > maxTokens) {
          toast.error(`Pas assez de jetons (${maxTokens - totalTokens} restants)`);
          return prev;
        }
        next.add(key);
      }
      return next;
    });
  }

  const canSubmit = intention.trim().length >= 5 && obstacle.trim().length >= 5 && changement.trim().length >= 5 && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const elArray = Array.from(selectedElements).map((key) => {
        const el = elements.find((e) => e.key === key);
        return { key, tier: el?.tier || 0, cost: el?.cost || 0 };
      });
      const res = await fetch(`/api/sessions/${sessionId}/scene`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          emotion: emotion || "exclusion",
          intention: intention.trim(),
          obstacle: obstacle.trim(),
          changement: changement.trim(),
          elements: elArray,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ai_feedback) {
          setFeedback(data.ai_feedback);
        }
        toast.success("Scène envoyée !");
        if (!data.ai_feedback) onDone();
      } else {
        const err = await res.json();
        toast.error(err.error || "Erreur");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setSubmitting(false);
    }
  }

  if (!elements.length) return null;

  // Group elements by tier
  const tiers = [0, 1, 2, 3];

  // If we have feedback, show it
  if (feedback) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-5 w-full">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-bw-teal/20 mx-auto flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="2" strokeLinecap="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold">Scène validée !</h2>
        </div>

        <div className="glass-card border-bw-teal/20 p-4 space-y-3">
          <p className="text-sm text-bw-teal font-medium">Retour du mentor</p>
          <p className="text-sm text-bw-text italic">{feedback.summary}</p>

          {feedback.strengths.length > 0 && (
            <div>
              <p className="text-xs text-bw-teal font-semibold mb-1">Points forts</p>
              {feedback.strengths.map((s, i) => (
                <p key={i} className="text-xs text-bw-text flex items-start gap-1.5">
                  <span className="text-bw-teal">✓</span> {s}
                </p>
              ))}
            </div>
          )}

          {feedback.suggestions.length > 0 && (
            <div>
              <p className="text-xs text-bw-amber font-semibold mb-1">Pistes</p>
              {feedback.suggestions.map((s, i) => (
                <p key={i} className="text-xs text-bw-text flex items-start gap-1.5">
                  <span className="text-bw-amber">→</span> {s}
                </p>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-bw-muted text-center">En attente des autres joueurs...</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col gap-4 w-full">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-bw-pink to-bw-pink/60 mx-auto flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <rect x="2" y="2" width="20" height="20" rx="2.18" />
            <path d="M7 2v20M17 2v20M2 12h20" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold font-cinema tracking-wider">Construis ta scène</h2>
        {emotionInfo && (
          <span className="text-xs px-3 py-1 rounded-full inline-block"
            style={{ backgroundColor: `${emotionInfo.color}20`, color: emotionInfo.color }}>
            {emotionInfo.label}
          </span>
        )}
      </div>

      {/* Narrative fields */}
      <div className="space-y-3">
        <div>
          <label className="text-xs text-bw-muted font-medium">🎯 Mon personnage veut...</label>
          <textarea
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            placeholder="Qu'est-ce que ton personnage veut vraiment ?"
            rows={2}
            maxLength={300}
            className="w-full bw-script bg-bw-elevated border border-white/[0.06] rounded-xl p-3 text-bw-heading placeholder:text-bw-muted focus:border-bw-pink focus:outline-none focus-visible:ring-2 focus-visible:ring-bw-pink/40 transition-colors resize-none mt-1"
          />
        </div>
        <div>
          <label className="text-xs text-bw-muted font-medium">⚠️ Mais...</label>
          <textarea
            value={obstacle}
            onChange={(e) => setObstacle(e.target.value)}
            placeholder="Qu'est-ce qui l'empêche d'y arriver ?"
            rows={2}
            maxLength={300}
            className="w-full bw-script bg-bw-elevated border border-white/[0.06] rounded-xl p-3 text-bw-heading placeholder:text-bw-muted focus:border-bw-pink focus:outline-none focus-visible:ring-2 focus-visible:ring-bw-pink/40 transition-colors resize-none mt-1"
          />
        </div>
        <div>
          <label className="text-xs text-bw-muted font-medium">🔄 À la fin...</label>
          <textarea
            value={changement}
            onChange={(e) => setChangement(e.target.value)}
            placeholder="Comment ça finit pour ton personnage ?"
            rows={2}
            maxLength={300}
            className="w-full bw-script bg-bw-elevated border border-white/[0.06] rounded-xl p-3 text-bw-heading placeholder:text-bw-muted focus:border-bw-pink focus:outline-none focus-visible:ring-2 focus-visible:ring-bw-pink/40 transition-colors resize-none mt-1"
          />
        </div>
      </div>

      {/* Counters */}
      <div className="flex gap-3">
        <div className={`flex-1 bg-bw-elevated rounded-xl px-3 py-2 text-center border ${totalSlots >= maxSlots ? "border-bw-amber/40" : "border-white/[0.06]"}`}>
          <span className="text-xs text-bw-muted">Emplacements</span>
          <p className={`text-lg font-bold ${totalSlots >= maxSlots ? "text-bw-amber" : "text-white"}`}>
            {totalSlots}/{maxSlots}
          </p>
        </div>
        <div className={`flex-1 bg-bw-elevated rounded-xl px-3 py-2 text-center border ${totalTokens >= maxTokens ? "border-bw-danger/40" : "border-white/[0.06]"}`}>
          <span className="text-xs text-bw-muted">Jetons</span>
          <p className={`text-lg font-bold ${totalTokens >= maxTokens ? "text-bw-danger" : "text-white"}`}>
            {totalTokens}/{maxTokens}
          </p>
        </div>
      </div>

      {/* Elements grid by tier */}
      <div className="space-y-3">
        {tiers.map((tier) => {
          const tierElements = elements.filter((e) => e.tier === tier);
          if (tierElements.length === 0) return null;
          const color = tierColors[tier] || "#888";
          return (
            <div key={tier}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color }}>
                {tierLabels[tier] || `Tier ${tier}`}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {tierElements.map((el) => {
                  const isSelected = selectedElements.has(el.key);
                  return (
                    <motion.button
                      key={el.key}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => toggleElement(el.key)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                        isSelected
                          ? "border-current bg-current/10"
                          : "border-white/[0.06] bg-bw-elevated text-bw-muted"
                      }`}
                      style={isSelected ? { color, borderColor: color, backgroundColor: `${color}15` } : {}}
                    >
                      {el.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`btn-glow w-full py-4 rounded-xl font-semibold transition-all ${
          canSubmit ? "bg-bw-pink text-white cursor-pointer" : "bg-bw-elevated text-bw-muted cursor-not-allowed"
        }`}
      >
        {submitting ? "Envoi..." : "Valider ma scène"}
      </motion.button>
    </motion.div>
  );
}
