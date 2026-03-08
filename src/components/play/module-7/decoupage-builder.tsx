"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { SuccessCheck } from "@/components/play/success-check";
import type { Module7Data } from "@/hooks/use-session-polling";

interface DecoupageBuilderProps {
  module7: Module7Data;
  sessionId: string;
  studentId: string;
}

interface PlanSlot {
  position: number;
  planType: string;
  description: string;
  intention: string;
}

export function DecoupageBuilder({ module7, sessionId, studentId }: DecoupageBuilderProps) {
  const keyScenes = module7.keyScenes || [];
  const planTypes = module7.planTypes || [];
  const existingDecoupages = module7.studentDecoupages || [];

  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const scene = keyScenes[currentSceneIdx];

  // Initialize slots from existing data or template
  const existingForScene = existingDecoupages.find(
    (d) => d.sceneId === scene?.id
  );
  const initialSlots: PlanSlot[] = existingForScene
    ? (existingForScene.plans as PlanSlot[])
    : (scene?.template as { slots: PlanSlot[] })?.slots || [
        { position: 1, planType: "", description: "", intention: "" },
        { position: 2, planType: "", description: "", intention: "" },
        { position: 3, planType: "", description: "", intention: "" },
      ];

  const [slots, setSlots] = useState<PlanSlot[]>(initialSlots);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(!!existingForScene);

  if (!scene) {
    return (
      <div className="text-center py-12 text-white/50">
        <p>Aucune scène disponible pour le découpage.</p>
      </div>
    );
  }

  const updateSlot = (index: number, field: keyof PlanSlot, value: string) => {
    setSlots((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      await fetch(`/api/sessions/${sessionId}/scenario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "decoupage",
          studentId,
          sceneId: scene.id,
          plans: slots,
        }),
      });
      setSubmitted(true);
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return <SuccessCheck />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4"
    >
      {/* Scene selector tabs */}
      <div className="flex gap-2 w-full">
        {keyScenes.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setCurrentSceneIdx(i)}
            className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              i === currentSceneIdx
                ? "bg-bw-teal text-white"
                : "bg-white/5 text-white/50 hover:bg-white/10"
            }`}
          >
            Scène {s.sceneNumber}
          </button>
        ))}
      </div>

      {/* Scene context */}
      <div className="w-full p-3 rounded-xl bg-white/5 border border-white/[0.06]">
        <p className="text-sm font-semibold text-white">{scene.title}</p>
        <p className="text-xs text-white/50 mt-1">{scene.description}</p>
      </div>

      <h2 className="text-lg font-bold text-white text-center">
        Choisis les plans pour cette scène
      </h2>

      {/* Plan slots */}
      <div className="w-full space-y-3">
        {slots.map((slot, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-3 rounded-xl bg-white/5 border border-white/[0.06]"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-white/40">Plan {slot.position}</span>
              <select
                value={slot.planType}
                onChange={(e) => updateSlot(i, "planType", e.target.value)}
                disabled={submitted}
                className="flex-1 rounded-xl bg-bw-elevated border border-white/[0.06] px-2 py-1 text-xs text-bw-text focus:outline-none focus:border-bw-teal transition-colors"
              >
                <option value="">Choisis un type...</option>
                {planTypes.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <input
              value={slot.description}
              onChange={(e) => updateSlot(i, "description", e.target.value)}
              disabled={submitted}
              placeholder="Que montre ce plan ?"
              className="w-full rounded-xl bg-bw-elevated border border-white/[0.06] px-3 py-2 text-xs text-bw-text placeholder:text-bw-muted focus:outline-none focus:border-bw-teal transition-colors mb-1"
            />
            <input
              value={slot.intention}
              onChange={(e) => updateSlot(i, "intention", e.target.value)}
              disabled={submitted}
              placeholder="Pourquoi ce plan ici ?"
              className="w-full rounded-xl bg-bw-elevated border border-white/[0.06] px-3 py-2 text-xs text-bw-text placeholder:text-bw-muted focus:outline-none focus:border-bw-teal transition-colors"
            />
          </motion.div>
        ))}
      </div>

      {/* Submit */}
      <div className="w-full flex justify-center">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={submitting || slots.some((s) => !s.planType)}
          className="btn-glow px-6 py-2.5 rounded-xl text-sm font-semibold bg-bw-teal text-white disabled:opacity-40 cursor-pointer"
        >
          {submitting ? "Envoi..." : "Valider mon découpage"}
        </motion.button>
      </div>
    </motion.div>
  );
}
