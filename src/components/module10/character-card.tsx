"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DiceBearAvatarCard } from "@/components/avatar-dicebear";
import { getTraitLabel, getObjectifLabel, getObstacleLabel } from "@/lib/module10-data";
import type { AvatarOptions } from "@/components/avatar-dicebear";
import { SceneBackground } from "./scene-backgrounds";
import { FilmStrip } from "./film-strip";

export interface CharacterCardProps {
  personnage: { prenom: string; age: string; trait: string; avatar: AvatarOptions };
  objectif?: string | null;
  obstacle?: string | null;
  pitchText?: string | null;
  chronoSeconds?: number | null;
  revealLevel: 0 | 1 | 2 | 3;
  size?: "sm" | "md" | "lg";
  responsesCount?: number;
  connectedCount?: number;
  showDownload?: boolean;
}

const SIZES = {
  sm: { avatar: 80, width: "w-full max-w-[180px]", text: "text-xs", heading: "text-sm", gap: "gap-2", pad: "p-3", badge: "px-1.5 py-0.5 text-[10px]" },
  md: { avatar: 120, width: "w-full max-w-[260px]", text: "text-sm", heading: "text-lg", gap: "gap-3", pad: "p-4", badge: "px-2 py-0.5 text-xs" },
  lg: { avatar: 160, width: "w-full max-w-[320px]", text: "text-sm", heading: "text-xl", gap: "gap-4", pad: "p-5", badge: "px-2.5 py-1 text-xs" },
} as const;

const CARD_BG = "rgb(15,23,42)";

function RevealSection({ show, delay = 0, children }: { show: boolean; delay?: number; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.45, delay, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Brief golden glow on reveal */}
          <motion.div
            initial={{ boxShadow: "0 0 16px 4px rgba(212,168,67,0.35)" }}
            animate={{ boxShadow: "0 0 0px 0px rgba(212,168,67,0)" }}
            transition={{ duration: 1.2, delay: delay + 0.1 }}
            style={{ borderRadius: 8 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Locked placeholder — shows what's coming to encourage completing the game */
function LockedSlot({ label, badgeClass }: { label: string; badgeClass: string }) {
  return (
    <span className={`${badgeClass} rounded-full bg-white/[0.04] text-white/20 inline-flex items-center gap-1 border border-dashed border-white/[0.08]`}>
      <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" className="opacity-40">
        <path d="M8 1a4 4 0 0 0-4 4v2H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-1V5a4 4 0 0 0-4-4zm-2 4a2 2 0 1 1 4 0v2H6V5z" />
      </svg>
      {label}
    </span>
  );
}

export function CharacterCard({
  personnage,
  objectif,
  obstacle,
  pitchText,
  chronoSeconds,
  revealLevel,
  size = "md",
  responsesCount,
  connectedCount,
  showDownload,
}: CharacterCardProps) {
  const s = SIZES[size];
  const scene = personnage.avatar.scene || "cite";
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const { exportElementAsImage } = await import("@/lib/export-image");
      const safeName = personnage.prenom.replace(/[^a-zA-Z0-9À-ÿ]/g, "-").toLowerCase();
      await exportElementAsImage(cardRef.current, `${safeName}-banlieuwood.png`);
    } catch { /* silent */ }
    finally { setDownloading(false); }
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`${s.width} rounded-2xl overflow-hidden border border-white/[0.08] relative`}
      style={{ background: CARD_BG }}
    >
      {/* Download button */}
      {showDownload && (
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-black/60 transition-all cursor-pointer disabled:opacity-40"
          title="Télécharger la carte"
        >
          {downloading ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          )}
        </button>
      )}
      {/* Scene backdrop */}
      <div className="absolute top-0 inset-x-0 h-20 overflow-hidden opacity-70">
        <SceneBackground scene={scene} className="w-full h-full" />
      </div>

      {/* Avataaars bust avatar */}
      <div className="flex flex-col items-center pt-3 relative z-10">
        <DiceBearAvatarCard options={personnage.avatar} size={s.avatar} fadeColor={CARD_BG} />
      </div>

      {/* Card body */}
      <div className={`${s.pad} ${s.gap} flex flex-col`}>
        {/* Level 0 — Identity (always visible) */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`${s.heading} font-bold text-bw-heading leading-tight`}>{personnage.prenom}</h3>
            {personnage.age && (
              <span className={`${s.text} text-bw-muted`}>{personnage.age} ans</span>
            )}
          </div>
          {personnage.trait && (
            <span
              className={`${s.badge} rounded-full font-medium bg-bw-primary/20 text-bw-primary whitespace-nowrap`}
            >
              {getTraitLabel(personnage.trait)}
            </span>
          )}
        </div>

        {/* Level 1 — Mission: objectif + obstacle */}
        {revealLevel >= 1 ? (
          <RevealSection show delay={0.1}>
            <div className="flex flex-wrap gap-1.5">
              {objectif && (
                <span className={`${s.badge} rounded-full bg-cyan-500/15 text-cyan-400 inline-flex items-center gap-1`}>
                  <span>🎯</span> {getObjectifLabel(objectif)}
                </span>
              )}
              {obstacle && (
                <span className={`${s.badge} rounded-full bg-red-500/15 text-red-400 inline-flex items-center gap-1`}>
                  <span>🧱</span> {getObstacleLabel(obstacle)}
                </span>
              )}
            </div>
          </RevealSection>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            <LockedSlot label="Mission" badgeClass={s.badge} />
            <LockedSlot label="Obstacle" badgeClass={s.badge} />
          </div>
        )}

        {/* Level 2 — Pitch excerpt */}
        {revealLevel >= 2 ? (
          <RevealSection show delay={0.15}>
            {pitchText && (
              <blockquote
                className={`${s.text} text-bw-muted/80 italic border-l-2 border-bw-primary/30 pl-2.5 leading-relaxed`}
              >
                &laquo;&nbsp;{pitchText.length > 120 ? pitchText.slice(0, 117) + "..." : pitchText}&nbsp;&raquo;
              </blockquote>
            )}
          </RevealSection>
        ) : (
          <div className={`${s.text} text-white/15 italic border-l-2 border-white/[0.06] pl-2.5`}>
            <span className="inline-flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" className="opacity-40">
                <path d="M8 1a4 4 0 0 0-4 4v2H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-1V5a4 4 0 0 0-4-4zm-2 4a2 2 0 1 1 4 0v2H6V5z" />
              </svg>
              Pitch à débloquer...
            </span>
          </div>
        )}

        {/* Level 3 — Chrono + ready badge */}
        {revealLevel >= 3 ? (
          <RevealSection show delay={0.1}>
            <div className="flex items-center justify-between">
              {chronoSeconds != null && (
                <span className={`${s.badge} rounded-full bg-amber-500/15 text-amber-400 inline-flex items-center gap-1`}>
                  <span>⏱</span> {chronoSeconds}s
                </span>
              )}
              <span className={`${s.badge} rounded-full bg-emerald-500/20 text-emerald-400 font-bold inline-flex items-center gap-1`}>
                🎬 PRÊT
              </span>
            </div>
          </RevealSection>
        ) : (
          <div className="flex items-center justify-between">
            <LockedSlot label="Chrono" badgeClass={s.badge} />
            <LockedSlot label="PRÊT" badgeClass={s.badge} />
          </div>
        )}

        {/* Response counter */}
        {responsesCount != null && connectedCount != null && connectedCount > 0 && (
          <div className={`${s.text} text-bw-muted/50 text-center`}>
            {responsesCount}/{connectedCount} ont répondu
          </div>
        )}
      </div>

      {/* Film strip decoration at bottom */}
      <FilmStrip className="w-full h-3" />
    </motion.div>
  );
}
