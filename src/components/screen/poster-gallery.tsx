"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DiceBearAvatar } from "@/components/avatar-dicebear";

const GLOW_COLORS = [
  "rgba(6,182,212,0.5)",   // teal
  "rgba(139,92,246,0.5)",  // violet
  "rgba(245,158,11,0.5)",  // amber
  "rgba(236,72,153,0.5)",  // pink
  "rgba(16,185,129,0.5)",  // emerald
  "rgba(255,107,53,0.5)",  // orange
];

function getAvatarSize(count: number): number {
  if (count <= 4) return 88;
  if (count <= 8) return 76;
  if (count <= 16) return 64;
  if (count <= 24) return 56;
  return 48;
}

function getFontSize(count: number): { name: string; creator: string } {
  if (count <= 8) return { name: "text-sm", creator: "text-xs" };
  if (count <= 16) return { name: "text-xs", creator: "text-xs" };
  return { name: "text-xs", creator: "text-xs" };
}

export interface PosterGalleryProps {
  submissions: { studentId: string; text: string; studentName?: string; avatar?: Record<string, unknown> }[];
}

export function PosterGallery({ submissions }: PosterGalleryProps) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [heroId, setHeroId] = useState<string | null>(null);
  const seenIdsRef = useRef<Set<string> | null>(null); // null = not yet initialized

  // Detect new arrivals → trigger hero spotlight (skip initial render)
  useEffect(() => {
    // First render — seed all existing IDs, no hero
    if (seenIdsRef.current === null) {
      seenIdsRef.current = new Set(submissions.map((s) => s.studentId));
      return;
    }

    // Find new arrival
    const newSub = submissions.find((s) => !seenIdsRef.current!.has(s.studentId));
    submissions.forEach((s) => seenIdsRef.current!.add(s.studentId));

    if (newSub) {
      setHeroId(newSub.studentId);
      const t = setTimeout(() => setHeroId(null), 2500);
      return () => clearTimeout(t);
    }
  }, [submissions]);

  const heroSub = heroId ? submissions.find((s) => s.studentId === heroId) : null;

  async function handleDownloadPoster() {
    if (!galleryRef.current) return;
    setDownloading(true);
    try {
      const { exportElementAsImage } = await import("@/lib/export-image");
      await exportElementAsImage(galleryRef.current, "classe-banlieuwood.png");
    } catch { /* silent */ }
    finally { setDownloading(false); }
  }

  const count = submissions.length;
  const avatarSize = getAvatarSize(count);
  const fontSize = getFontSize(count);

  return (
    <div className="space-y-2">
      {/* ═══ HERO SPOTLIGHT — new arrival reveal (above gallery) ═══ */}
      <AnimatePresence>
        {heroSub && (() => {
          const parts = heroSub.text.split(",");
          const prenom = parts[0] || "?";
          const trait = parts[2] || "";
          const glowColor = GLOW_COLORS[submissions.indexOf(heroSub) % GLOW_COLORS.length];
          return (
            <motion.div
              key={`hero-${heroSub.studentId}`}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.4 } }}
              transition={{ type: "spring", stiffness: 150, damping: 18 }}
              className="flex flex-col items-center py-2"
            >
              <motion.div
                animate={{ boxShadow: [`0 0 24px ${glowColor}`, `0 0 56px ${glowColor}`, `0 0 24px ${glowColor}`] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="rounded-full overflow-hidden"
                style={{ width: 110, height: 110, border: `3px solid ${glowColor.replace("0.5", "0.6")}` }}
              >
                <DiceBearAvatar options={heroSub.avatar || {}} size={110} />
              </motion.div>
              <motion.span
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mt-2 text-xl font-bold text-white tracking-wide"
              >
                {prenom}
              </motion.span>
              {trait && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  className="text-sm text-bw-teal/80"
                >
                  {trait}
                </motion.span>
              )}
              {heroSub.studentName && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55 }}
                  className="text-xs text-bw-muted"
                >
                  par {heroSub.studentName}
                </motion.span>
              )}
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ═══ GALLERY — adaptive sizing ═══ */}
      <div ref={galleryRef}
        className="flex flex-wrap justify-center gap-3 p-4 rounded-xl"
        style={{ backgroundColor: "#0F172A" }}>
        {submissions.map((sub, i) => {
          const parts = sub.text.split(",");
          const prenom = parts[0] || "?";
          const glowColor = GLOW_COLORS[i % GLOW_COLORS.length];
          return (
            <motion.div key={sub.studentId}
              layout
              initial={{ opacity: 0, scale: 0, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: i * 0.06 }}
              className="flex flex-col items-center text-center"
              style={{ width: avatarSize + 24 }}>
              <motion.div
                layout
                className="rounded-full overflow-hidden flex-shrink-0 transition-all duration-500"
                style={{
                  width: avatarSize,
                  height: avatarSize,
                  boxShadow: `0 0 10px ${glowColor.replace("0.5", "0.2")}`,
                  border: `2px solid ${glowColor.replace("0.5", "0.3")}`,
                }}
              >
                <DiceBearAvatar options={sub.avatar || {}} size={avatarSize} />
              </motion.div>
              <span className={`${fontSize.name} font-semibold text-bw-heading mt-1 leading-tight truncate w-full`}>
                {prenom}
              </span>
              {sub.studentName && (
                <span className={`${fontSize.creator} text-bw-muted truncate w-full leading-tight`}>
                  {sub.studentName}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      <button
        onClick={handleDownloadPoster}
        disabled={downloading}
        className="mx-auto flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white/50 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:text-white/70 transition-all cursor-pointer disabled:opacity-40"
      >
        {downloading ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        )}
        Poster
      </button>
    </div>
  );
}
