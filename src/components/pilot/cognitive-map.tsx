"use client";

import { memo } from "react";
import { motion } from "motion/react";

// ═══════════════════════════════════════════════════════════════
// CARTE COGNITIVE v1 — QCM thinking style interpretation
// Maps QCM option labels to cognitive styles via keyword matching
// ═══════════════════════════════════════════════════════════════

interface CognitiveMapProps {
  options: { key: string; label: string; count: number }[];
  total: number;
}

const STYLE_MAPPING: { keywords: string[]; emoji: string; label: string }[] = [
  { keywords: ["couleur", "image", "visuel", "decor", "lumiere", "photo", "dessin", "cadre"], emoji: "🎨", label: "Visuel" },
  { keywords: ["dialogue", "mot", "texte", "histoire", "personnage", "narrat", "parole", "disent", "raconte"], emoji: "💬", label: "Narratif" },
  { keywords: ["musique", "son", "emotion", "sentiment", "ambiance", "ressent", "touche"], emoji: "🎭", label: "Emotionnel" },
  { keywords: ["technique", "structure", "regle", "plan", "montage", "passer", "action", "va se"], emoji: "🔧", label: "Analytique" },
];

function detectStyle(label: string): { emoji: string; label: string } {
  const lower = label.toLowerCase();
  for (const mapping of STYLE_MAPPING) {
    if (mapping.keywords.some((kw) => lower.includes(kw))) {
      return { emoji: mapping.emoji, label: mapping.label };
    }
  }
  return { emoji: "💭", label: label.length > 20 ? label.slice(0, 18) + "..." : label };
}

function CognitiveMapInner({ options, total }: CognitiveMapProps) {
  if (total < 3 || options.length === 0) return null;

  const maxCount = Math.max(...options.map((o) => o.count), 1);

  return (
    <div
      className="rounded-[14px] overflow-hidden"
      style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.5)" }}
    >
      <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.5)" }}>
        <h4 className="text-[14px] font-bold text-[#2C2C2C]">Comment pense la classe</h4>
      </div>
      <div className="px-4 py-3 space-y-2.5">
        {options.map((opt, i) => {
          const style = detectStyle(opt.label);
          const pct = total > 0 ? Math.round((opt.count / total) * 100) : 0;
          const barWidth = maxCount > 0 ? (opt.count / maxCount) * 100 : 0;
          return (
            <div key={opt.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[#4A4A4A]">
                  <span>{style.emoji}</span>
                  {style.label}
                </span>
                <span className="text-[13px] font-bold tabular-nums text-[#2C2C2C]">{pct}%</span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: "rgba(239,232,221,0.5)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                  style={{
                    background: i === 0 ? "#6B8CFF" : i === 1 ? "#F5A45B" : i === 2 ? "#4CAF50" : "#E040FB",
                  }}
                />
              </div>
              <p className="text-[11px] text-[#B0A99E] mt-0.5">{opt.count} eleve{opt.count > 1 ? "s" : ""}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const CognitiveMap = memo(CognitiveMapInner);
