"use client";

import { motion } from "motion/react";
import { BrandLogo } from "@/components/brand-logo";
import { TEMPLATE_LABELS } from "@/lib/constants";

export interface ScreenHeaderSession {
  title?: string;
  template?: string | null;
  status: string;
  currentSituationIndex?: number;
}

export interface ScreenHeaderSeanceIntro {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
}

export interface ScreenHeaderProps {
  session: ScreenHeaderSession;
  seanceIntro: ScreenHeaderSeanceIntro | undefined;
  moduleColor: string;
  maxSituations: number;
  progressPct: number;
  connectedCount: number;
  noModuleSelected: boolean;
}

export function ScreenHeader({ session, seanceIntro, moduleColor, maxSituations, progressPct, connectedCount, noModuleSelected }: ScreenHeaderProps) {
  const templateInfo = session.template ? TEMPLATE_LABELS[session.template] : null;

  return (
    <header className="px-6 py-2.5 flex justify-between items-center flex-shrink-0 relative z-10 backdrop-blur-sm"
      style={{ background: "linear-gradient(90deg, rgba(18,20,24,0.85), rgba(18,20,24,0.6) 50%, rgba(18,20,24,0.85))", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold tracking-[0.2em] uppercase font-cinema">
          <BrandLogo />
        </h1>
        {/* Session title + genre */}
        {session.title && (
          <div className="flex items-center gap-2 ml-2">
            <span className="text-xs text-bw-muted">{session.title}</span>
            {templateInfo && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
                {templateInfo}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        {/* Active module name */}
        {!noModuleSelected && session.status !== "done" && seanceIntro && (
          <span className="text-sm font-medium" style={{ color: moduleColor }}>
            {seanceIntro.icon} {seanceIntro.title}
          </span>
        )}
        {/* Step dots */}
        {!noModuleSelected && session.status !== "done" && maxSituations > 1 && (
          <div className="flex items-center gap-1.5">
            {Array.from({ length: maxSituations }).map((_, i) => (
              <motion.div
                key={i}
                animate={i === (session.currentSituationIndex ?? 0)
                  ? { scale: [1, 1.3, 1], opacity: 1 }
                  : { scale: 1, opacity: i < (session.currentSituationIndex ?? 0) ? 1 : 0.3 }
                }
                transition={i === (session.currentSituationIndex ?? 0) ? { repeat: Infinity, duration: 1.5 } : {}}
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: i <= (session.currentSituationIndex ?? 0) ? moduleColor : "rgba(255,255,255,0.15)",
                }}
              />
            ))}
          </div>
        )}
        {/* Progress bar */}
        {!noModuleSelected && session.status !== "done" && progressPct > 0 && (
          <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5 }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${moduleColor}, ${moduleColor}99)` }}
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-2.5 h-2.5 rounded-full bg-bw-teal"
          />
          <span className="text-lg">{connectedCount} en ligne</span>
        </div>
      </div>
    </header>
  );
}
