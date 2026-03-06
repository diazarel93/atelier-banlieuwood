"use client";

import { useState, memo } from "react";
import { motion, AnimatePresence } from "motion/react";

// ═══════════════════════════════════════════════════════════════
// POWER-UPS BAR — Student in-game boosts
// Double Temps, Indice, Coup de Pouce, Bouclier
// ═══════════════════════════════════════════════════════════════

interface PowerUp {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  count: number;
}

interface PowerUpsBarProps {
  powerUps: Record<string, number>;
  onUsePowerUp: (powerUpId: string) => void;
  disabled?: boolean;
}

const POWER_UP_DEFS: Omit<PowerUp, "count">[] = [
  {
    id: "double_temps",
    name: "Double Temps",
    icon: "⏳",
    description: "+30 secondes pour repondre",
    color: "#4ECDC4",
  },
  {
    id: "indice",
    name: "Indice",
    icon: "💡",
    description: "Recois un indice de l'IA",
    color: "#8B5CF6",
  },
  {
    id: "coup_de_pouce",
    name: "Coup de Pouce",
    icon: "🤝",
    description: "Vois la reponse d'un coequipier",
    color: "#FF6B35",
  },
  {
    id: "bouclier",
    name: "Bouclier",
    icon: "🛡️",
    description: "Protege ta serie en cas d'erreur",
    color: "#D4A843",
  },
];

function PowerUpsBarInner({ powerUps, onUsePowerUp, disabled }: PowerUpsBarProps) {
  const [activating, setActivating] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<string | null>(null);

  const items: PowerUp[] = POWER_UP_DEFS.map((def) => ({
    ...def,
    count: powerUps[def.id] ?? 0,
  }));

  const handleUse = (id: string) => {
    const item = items.find((p) => p.id === id);
    if (!item || item.count <= 0 || disabled) return;

    setActivating(id);
    onUsePowerUp(id);
    setTimeout(() => setActivating(null), 1200);
  };

  return (
    <div className="flex items-center gap-2">
      {items.map((pu) => {
        const isActivating = activating === pu.id;
        const isEmpty = pu.count <= 0;

        return (
          <div
            key={pu.id}
            className="relative"
            onMouseEnter={() => setTooltip(pu.id)}
            onMouseLeave={() => setTooltip(null)}
          >
            <motion.button
              onClick={() => handleUse(pu.id)}
              disabled={isEmpty || disabled}
              className={`relative w-10 h-10 rounded-xl flex items-center justify-center text-lg cursor-pointer transition-all ${
                isEmpty || disabled
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:scale-110 active:scale-95"
              }`}
              style={{
                background: isEmpty ? "rgba(255,255,255,0.04)" : `${pu.color}15`,
                border: `1px solid ${isEmpty ? "rgba(255,255,255,0.06)" : `${pu.color}30`}`,
                boxShadow: isActivating
                  ? `0 0 20px ${pu.color}60, 0 0 40px ${pu.color}30`
                  : undefined,
              }}
              animate={
                isActivating
                  ? { scale: [1, 1.3, 0.9, 1.1, 1], rotate: [0, -10, 10, -5, 0] }
                  : {}
              }
              transition={{ duration: 0.6 }}
            >
              {pu.icon}
              {/* Count badge */}
              {!isEmpty && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-black text-white"
                  style={{ background: pu.color, fontSize: "9px" }}
                >
                  {pu.count}
                </span>
              )}
            </motion.button>

            {/* Activation burst */}
            <AnimatePresence>
              {isActivating && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 1 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{ border: `2px solid ${pu.color}`, boxShadow: `0 0 12px ${pu.color}40` }}
                />
              )}
            </AnimatePresence>

            {/* Tooltip */}
            <AnimatePresence>
              {tooltip === pu.id && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-bw-popover border border-white/10 rounded-lg px-3 py-2 shadow-lg z-30 w-36 pointer-events-none"
                >
                  <p className="text-xs font-bold text-bw-heading">{pu.name}</p>
                  <p className="text-xs text-bw-muted mt-0.5">{pu.description}</p>
                  {isEmpty && (
                    <p className="text-xs text-bw-danger mt-1 font-semibold">Epuise !</p>
                  )}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-bw-popover border-r border-b border-white/10 rotate-45 -mt-1" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export const PowerUpsBar = memo(PowerUpsBarInner);
