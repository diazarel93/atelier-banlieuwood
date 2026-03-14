"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

// ═══════════════════════════════════════════════════════════════
// CELEBRATIONS — Progressive celebration system by player level
// ═══════════════════════════════════════════════════════════════

// ---------------------------------------------------------------------------
// 1. CelebrationConfig + getCelebrationConfig
// ---------------------------------------------------------------------------

export interface CelebrationConfig {
  particles: number;
  spread: number;
  colors?: string[];
  shake: boolean;
  shakeDuration: number;
  spotlight: boolean;
  sounds: string[];
}

/**
 * Returns a celebration intensity config based on the player's level.
 *
 * Level mapping:
 *  1-3  (Figurant → Assistant)    — light burst
 *  4-6  (Cadreur → Réalisateur)   — medium + spotlight
 *  7-9  (Producteur → Légende)    — heavy + shake + gold
 *  10   (Oscar)                   — maximum fanfare
 */
export function getCelebrationConfig(level: number): CelebrationConfig {
  if (level >= 10) {
    return {
      particles: 200,
      spread: 100,
      colors: ["#FFD700", "#FFC800", "#FFAA00", "#FFE066"],
      shake: true,
      shakeDuration: 500,
      spotlight: true,
      sounds: ["levelUp", "fanfare"],
    };
  }

  if (level >= 7) {
    return {
      particles: 150,
      spread: 80,
      colors: ["#FFD700", "#FF6B35", "#FFC800", "#D4A843"],
      shake: true,
      shakeDuration: 300,
      spotlight: true,
      sounds: ["confetti", "levelUp"],
    };
  }

  if (level >= 4) {
    return {
      particles: 100,
      spread: 70,
      shake: false,
      shakeDuration: 0,
      spotlight: true,
      sounds: ["confetti"],
    };
  }

  // level 1-3
  return {
    particles: 50,
    spread: 60,
    shake: false,
    shakeDuration: 0,
    spotlight: false,
    sounds: ["confetti"],
  };
}

// ---------------------------------------------------------------------------
// 2. CelebrationOverlay — progressive overlay driven by level
// ---------------------------------------------------------------------------

export interface CelebrationOverlayProps {
  level: number;
  trigger: boolean;
  onComplete?: () => void;
}

// Keyframe names injected once via <style>
const KEYFRAMES_ID = "__celebration-keyframes__";

function ensureKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById(KEYFRAMES_ID)) return;

  const style = document.createElement("style");
  style.id = KEYFRAMES_ID;
  style.textContent = `
    @keyframes spotlight-sweep {
      0%   { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    @keyframes screen-shake {
      0%   { transform: translate(0, 0); }
      10%  { transform: translate(2px, 1px); }
      20%  { transform: translate(-1px, -2px); }
      30%  { transform: translate(-2px, 0px); }
      40%  { transform: translate(2px, 2px); }
      50%  { transform: translate(1px, -1px); }
      60%  { transform: translate(-1px, 2px); }
      70%  { transform: translate(2px, 1px); }
      80%  { transform: translate(-2px, -1px); }
      90%  { transform: translate(1px, 2px); }
      100% { transform: translate(0, 0); }
    }
  `;
  document.head.appendChild(style);
}

export function CelebrationOverlay({
  level,
  trigger,
  onComplete,
}: CelebrationOverlayProps) {
  const [showSpotlight, setShowSpotlight] = useState(false);
  const prevTriggerRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Fire celebration when trigger flips to true
  useEffect(() => {
    if (trigger && !prevTriggerRef.current) {
      fireCelebration();
    }
    prevTriggerRef.current = trigger;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, []);

  const fireCelebration = useCallback(async () => {
    const config = getCelebrationConfig(level);

    ensureKeyframes();

    // --- Confetti ---
    try {
      const confetti = (await import("canvas-confetti")).default;
      const confettiOpts: Parameters<typeof confetti>[0] = {
        particleCount: config.particles,
        spread: config.spread,
        origin: { y: 0.6 },
      };
      if (config.colors) {
        confettiOpts.colors = config.colors;
      }
      confetti(confettiOpts);

      // For high levels, fire a second burst from the sides
      if (level >= 7) {
        setTimeout(() => {
          confetti({
            particleCount: Math.floor(config.particles / 2),
            angle: 60,
            spread: config.spread * 0.7,
            origin: { x: 0, y: 0.6 },
            colors: config.colors,
          });
          confetti({
            particleCount: Math.floor(config.particles / 2),
            angle: 120,
            spread: config.spread * 0.7,
            origin: { x: 1, y: 0.6 },
            colors: config.colors,
          });
        }, 200);
      }
    } catch {
      /* canvas-confetti not available */
    }

    // --- Spotlight sweep ---
    if (config.spotlight) {
      setShowSpotlight(true);
      setTimeout(() => setShowSpotlight(false), 1500);
    }

    // --- Screen shake ---
    if (config.shake && config.shakeDuration > 0) {
      const target = document.getElementById("celebration-shake-target") || document.body;
      target.style.animation = `screen-shake ${config.shakeDuration}ms ease-in-out`;

      const onEnd = () => {
        target.style.animation = "";
        target.removeEventListener("animationend", onEnd);
      };
      target.addEventListener("animationend", onEnd);

      // Safety cleanup
      cleanupRef.current = () => {
        target.style.animation = "";
        target.removeEventListener("animationend", onEnd);
      };
    }

    // --- Completion callback ---
    const longestEffect = Math.max(
      1500, // confetti duration
      config.spotlight ? 1500 : 0,
      config.shakeDuration,
    );
    setTimeout(() => {
      cleanupRef.current = null;
      onComplete?.();
    }, longestEffect + 200);
  }, [level, onComplete]);

  return (
    <AnimatePresence>
      {showSpotlight && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.20) 40%, rgba(255,255,255,0.20) 60%, transparent 100%)",
              animation: "spotlight-sweep 1.5s ease-in-out forwards",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// 3. Legacy exports — backward compatibility
// ---------------------------------------------------------------------------

interface LegacyCelebrationProps {
  type: "achievement" | "level_up" | "streak" | "retained" | "combo";
  title: string;
  subtitle?: string;
  icon?: string;
  color?: string;
  visible: boolean;
  onDismiss: () => void;
  autoHide?: number;
}

export function CelebrationBanner({
  type,
  title,
  subtitle,
  icon,
  color = "#FF6B35",
  visible,
  onDismiss,
  autoHide = 4000,
}: LegacyCelebrationProps) {
  useEffect(() => {
    if (visible && autoHide > 0) {
      const timer = setTimeout(onDismiss, autoHide);
      return () => clearTimeout(timer);
    }
  }, [visible, autoHide, onDismiss]);

  const fireConfetti = useCallback(async () => {
    try {
      const confetti = (await import("canvas-confetti")).default;
      if (type === "level_up") {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
          colors: ["#FF6B35", "#D4A843", "#4ECDC4", "#8B5CF6"],
        });
      } else if (type === "achievement") {
        confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0, y: 0.7 } });
        confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1, y: 0.7 } });
      } else {
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
      }
    } catch {
      /* confetti not available */
    }
  }, [type]);

  useEffect(() => {
    if (visible) fireConfetti();
  }, [visible, fireConfetti]);

  const backgrounds: Record<string, string> = {
    achievement: "linear-gradient(135deg, #D4A843, #F5ECCE)",
    level_up: "linear-gradient(135deg, #FF6B35, #D4A843)",
    streak: "linear-gradient(135deg, #EF4444, #FF6B35)",
    retained: "linear-gradient(135deg, #4ECDC4, #2B9A93)",
    combo: "linear-gradient(135deg, #8B5CF6, #EC4899)",
  };

  const defaultIcons: Record<string, string> = {
    achievement: "\u{1F396}",
    level_up: "\u2B06\uFE0F",
    streak: "\u{1F525}",
    retained: "\u{1F3C6}",
    combo: "\u{1F4A5}",
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.5, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            onClick={onDismiss}
            className="pointer-events-auto cursor-pointer rounded-3xl px-8 py-6 text-center max-w-xs"
            style={{
              background: backgrounds[type] || `linear-gradient(135deg, ${color}, ${color}CC)`,
              boxShadow: `0 20px 60px rgba(0,0,0,0.3), 0 0 40px ${color}40`,
            }}
          >
            <motion.span
              className="text-5xl inline-block"
              animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {icon || defaultIcons[type] || "\u{1F389}"}
            </motion.span>
            <motion.h2
              className="text-xl font-black text-white mt-3"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              {title}
            </motion.h2>
            {subtitle && (
              <motion.p
                className="text-sm text-white/80 mt-1"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                {subtitle}
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// XP delta animation — floating "+10 XP" text
export function XPDelta({ amount, visible }: { amount: number; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && amount > 0 && (
        <motion.span
          initial={{ opacity: 1, y: 0, scale: 1 }}
          animate={{ opacity: 0, y: -30, scale: 1.2 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="fixed top-4 right-4 z-50 text-lg font-black pointer-events-none"
          style={{ color: "#FF6B35", textShadow: "0 2px 8px rgba(255,107,53,0.4)" }}
        >
          +{amount} XP
        </motion.span>
      )}
    </AnimatePresence>
  );
}
