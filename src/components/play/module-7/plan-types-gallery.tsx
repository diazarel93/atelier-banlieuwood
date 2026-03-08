"use client";

import { motion } from "motion/react";
import type { Module7Data } from "@/hooks/use-session-polling";

// Map plan keys to their illustration URLs
const PLAN_IMAGE_URLS: Record<string, string> = {
  "plan-large": "/images/plans/plan-large.svg",
  "plan-moyen": "/images/plans/plan-moyen.svg",
  "gros-plan": "/images/plans/gros-plan.svg",
  "plan-reaction": "/images/plans/plan-reaction.svg",
};

const PLAN_ALT_TEXTS: Record<string, string> = {
  "plan-large": "Illustration plan large : une cour d\u2019\u00e9cole vue de loin avec des \u00e9l\u00e8ves",
  "plan-moyen": "Illustration plan moyen : deux \u00e9l\u00e8ves assis \u00e0 une table, visibles de la taille",
  "gros-plan": "Illustration gros plan : un visage expressif qui remplit le cadre",
  "plan-reaction": "Illustration plan r\u00e9action : par-dessus l\u2019\u00e9paule, on voit le visage surpris d\u2019un personnage",
};

const PLAN_COLORS: Record<string, string> = {
  "plan-large": "bg-bw-violet/20 text-bw-violet",
  "plan-moyen": "bg-bw-teal/20 text-bw-teal",
  "gros-plan": "bg-bw-amber/20 text-bw-amber",
  "plan-reaction": "bg-bw-pink/20 text-bw-pink",
};

interface PlanTypesGalleryProps {
  module7: Module7Data;
}

export function PlanTypesGallery({ module7 }: PlanTypesGalleryProps) {
  const plans = module7.plans || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Les 4 Plans</h2>
        <p className="text-sm text-white/50 mt-1">
          Chaque plan raconte quelque chose de diff\u00e9rent
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 w-full">
        {plans.map((plan, i) => {
          const imageUrl = plan.imageUrl || PLAN_IMAGE_URLS[plan.key];
          const altText = PLAN_ALT_TEXTS[plan.key] || `Illustration ${plan.label}`;
          const colorClasses = PLAN_COLORS[plan.key] || "bg-white/10 text-white/60";

          return (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              className="rounded-xl bg-white/5 border border-white/[0.06] hover:bg-white/8 transition-colors overflow-hidden"
            >
              {/* Plan illustration */}
              {imageUrl && (
                <div className="w-full border-b border-white/5">
                  <img
                    src={imageUrl}
                    alt={altText}
                    className="w-full h-auto rounded-t-xl"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Text content */}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold shrink-0 ${colorClasses.split(" ")[0]}`}
                  >
                    <span className="text-white">{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-white">{plan.label}</h3>
                    <p className={`text-xs mt-0.5 ${colorClasses.split(" ").slice(1).join(" ")}`}>
                      {plan.question}
                    </p>
                    <p className="text-xs text-white/50 mt-1">{plan.description}</p>
                    <p className="text-xs text-white/30 mt-1 italic">Ex : {plan.example}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
