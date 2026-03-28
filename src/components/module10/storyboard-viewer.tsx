"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { generateStoryboardUrls } from "@/lib/pollinations";

interface StoryboardViewerProps {
  prenom: string;
  trait?: string;
  objectif?: string;
  obstacle?: string;
  pitchText?: string;
}

export function StoryboardViewer({ prenom, trait, objectif, obstacle, pitchText }: StoryboardViewerProps) {
  const urls = generateStoryboardUrls({ prenom, trait, objectif, obstacle, pitchText });
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const [errors, setErrors] = useState<Record<number, boolean>>({});
  const gridRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (!gridRef.current) return;
    setDownloading(true);
    try {
      const { exportElementAsImage } = await import("@/lib/export-image");
      const safeName = prenom.replace(/[^a-zA-Z0-9À-ÿ]/g, "-").toLowerCase();
      await exportElementAsImage(gridRef.current, `storyboard-${safeName}.png`);
    } catch {
      /* silent */
    } finally {
      setDownloading(false);
    }
  }

  const PANEL_LABELS = ["Ouverture", "Découverte", "Confrontation", "Climax"];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
          <span className="text-base">🎬</span>
          Storyboard IA
        </h3>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] hover:text-white transition-all cursor-pointer disabled:opacity-40"
        >
          {downloading ? (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="animate-spin"
            >
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
          ) : (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          )}
          Télécharger
        </button>
      </div>

      <div ref={gridRef} className="grid grid-cols-2 gap-2 rounded-xl p-3" style={{ backgroundColor: "#0F172A" }}>
        {urls.map((url, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            className="relative rounded-lg overflow-hidden border border-white/[0.06] aspect-video"
            style={{ backgroundColor: "#1E293B" }}
          >
            {/* Loading skeleton */}
            {!loaded[i] && !errors[i] && (
              <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-bw-primary/50 animate-spin" />
              </div>
            )}

            {/* Error state */}
            {errors[i] && (
              <div className="absolute inset-0 flex items-center justify-center text-white/20">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
            )}

            <Image
              src={url}
              alt={`Panel ${i + 1}: ${PANEL_LABELS[i]}`}
              fill
              unoptimized
              sizes="50vw"
              className={`object-cover transition-opacity duration-500 ${loaded[i] ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setLoaded((p) => ({ ...p, [i]: true }))}
              onError={() => setErrors((p) => ({ ...p, [i]: true }))}
            />

            {/* Panel label */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1">
              <span className="text-xs font-bold uppercase tracking-wider text-white/70">{PANEL_LABELS[i]}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
