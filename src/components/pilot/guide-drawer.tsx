"use client";

import { motion } from "motion/react";
import { SOCLE_LABELS, type ModuleGuide } from "@/lib/guide-data";

interface GuideDrawerProps {
  moduleGuide: ModuleGuide | undefined;
  onClose: () => void;
}

export function GuideDrawer({ moduleGuide, onClose }: GuideDrawerProps) {
  if (!moduleGuide) return null;

  return (
    <>
      {/* Mobile backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />
      {/* Drawer panel */}
      <motion.aside
        initial={{ x: 280, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 280, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-y-0 right-0 z-50 w-[280px] glass border-l border-black/[0.04] flex flex-col lg:relative lg:inset-auto lg:z-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.04] flex-shrink-0 h-14">
          <h3 className="font-semibold text-sm">Guide complet</h3>
          <button
            onClick={onClose}
            className="text-bw-muted hover:text-bw-heading text-xs cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {/* Objectif */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-bw-primary">
              Objectif pédagogique
            </h4>
            <p className="text-xs text-bw-text leading-relaxed">
              {moduleGuide.objectifPedagogique}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {moduleGuide.socleCommun.map((d) => (
                <span
                  key={d}
                  className="text-xs px-2 py-0.5 rounded-full bg-bw-violet/20 text-bw-violet"
                  title={SOCLE_LABELS[d]}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* Intro à dire */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-bw-teal">
              À dire aux élèves
            </h4>
            <div className="bg-bw-teal/5 border-l-2 border-bw-teal rounded-r-lg px-3 py-3">
              <p className="text-xs text-bw-heading leading-relaxed italic">
                &ldquo;{moduleGuide.introADire}&rdquo;
              </p>
            </div>
          </div>

          {/* Signaux d'alerte */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-bw-amber">
              Signaux d&apos;alerte
            </h4>
            <ul className="space-y-1.5">
              {moduleGuide.aQuoiEtreAttentif.map((signal, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-bw-text leading-relaxed"
                >
                  <span className="text-bw-amber flex-shrink-0 mt-0.5">!</span>
                  {signal}
                </li>
              ))}
            </ul>
          </div>

          {/* Déroulé */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-bw-text">
              Déroulé ({moduleGuide.duration})
            </h4>
            <div className="space-y-2">
              {moduleGuide.phases.map((phase, i) => (
                <div key={i} className="bg-bw-bg rounded-xl p-3 border border-black/[0.04]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-bw-primary">{i + 1}</span>
                    <span className="text-xs font-semibold">{phase.name}</span>
                    <span className="text-xs text-bw-muted ml-auto">{phase.timing}</span>
                  </div>
                  <p className="text-xs text-bw-muted leading-relaxed">{phase.instruction}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Conseils */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-bw-green">
              Conseils
            </h4>
            <ul className="space-y-1.5">
              {moduleGuide.conseils.map((tip, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-bw-text leading-relaxed"
                >
                  <span className="text-bw-green flex-shrink-0">&#x2713;</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
