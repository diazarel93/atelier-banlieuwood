"use client";

import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { GlassCardV2 } from "@/components/v2/glass-card";
import { IconClock } from "@/components/v2/icons";
import { ROUTES } from "@/lib/routes";
import type { ModuleGuide } from "@/lib/guide-data";
import type { ExerciseEntry } from "@/lib/exercise-catalog";
import { SOCLE_COLORS } from "@/lib/socle-colors";

interface ModuleGuideModalProps {
  exercise: ExerciseEntry;
  guide: ModuleGuide | null;
  onClose: () => void;
}

export function ModuleGuideModal({ exercise, guide, onClose }: ModuleGuideModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Prevent body scroll + focus trap
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const prev = document.activeElement as HTMLElement | null;
    modalRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
      prev?.focus();
    };
  }, []);

  // Trap focus inside modal
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !modalRef.current) return;
    const focusable = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="module-guide-title"
      ref={modalRef}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Fermer la modale"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />

      {/* Modal */}
      <motion.div
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto mt-12 mb-8 mx-4 bg-card rounded-2xl border border-[var(--color-bw-border)] glass-shadow-elevated"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-[var(--color-bw-border)] px-6 py-4 flex items-start justify-between rounded-t-2xl">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm" aria-hidden="true">
                {exercise.phaseEmoji}
              </span>
              <span className="label-caps" style={{ color: exercise.phaseColor }}>
                {exercise.phaseLabel}
              </span>
            </div>
            <h2 id="module-guide-title" className="text-lg font-bold text-bw-heading leading-snug">
              {exercise.title}
            </h2>
            {exercise.subtitle && <p className="text-sm text-bw-muted mt-0.5">{exercise.subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="shrink-0 ml-4 p-2 rounded-lg text-bw-muted hover:text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors cursor-pointer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-bw-muted">
            <span className="flex items-center gap-1">
              <IconClock />
              {exercise.duration}
            </span>
            <span>{exercise.questions} questions</span>
            {exercise.tags.length > 0 && (
              <div className="flex gap-1">
                {exercise.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[var(--color-bw-surface-dim)] px-2 py-0.5 text-body-xs font-medium text-bw-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-bw-heading leading-relaxed">{exercise.description}</p>

          {!guide ? (
            <GlassCardV2 variant="flat" className="p-6 text-center">
              <p className="text-sm text-bw-muted">Fiche pédagogique non disponible pour ce module</p>
            </GlassCardV2>
          ) : (
            <>
              {/* Déroulé — timeline stepper (most useful, shown first) */}
              {guide.phases.length > 0 && (
                <GlassCardV2 className="p-5">
                  <p className="label-caps text-bw-muted mb-4">Déroulé — {guide.phases.length} étapes</p>
                  <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-[18px] top-3 bottom-3 w-px bg-[var(--color-bw-border)]" />

                    <div className="space-y-4">
                      {guide.phases.map((phase, i) => (
                        <div key={i} className="flex items-start gap-4 relative">
                          {/* Step number circle */}
                          <div
                            className="relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-card"
                            style={{
                              backgroundColor: `${exercise.color}15`,
                              color: exercise.color,
                              border: `2px solid ${exercise.color}40`,
                            }}
                          >
                            {i + 1}
                          </div>

                          <div className="flex-1 min-w-0 pb-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-bw-heading">{phase.name}</span>
                              <span className="text-body-xs font-mono text-[var(--color-bw-violet)] bg-[var(--color-bw-violet-100)] border border-[var(--color-bw-violet)]/20 rounded-md px-1.5 py-0.5">
                                {phase.timing}
                              </span>
                            </div>
                            <p className="text-xs text-bw-muted leading-relaxed">{phase.instruction}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlassCardV2>
              )}

              {/* Intro à dire */}
              <GlassCardV2 className="p-5">
                <p className="label-caps text-bw-muted mb-3">Introduction à dire</p>
                <div className="rounded-xl bg-[var(--color-bw-surface-dim)] p-4">
                  <p className="text-sm text-bw-heading italic leading-relaxed">&ldquo;{guide.introADire}&rdquo;</p>
                </div>
              </GlassCardV2>

              {/* Socle commun + objectif */}
              <GlassCardV2 className="p-5">
                <p className="label-caps text-bw-muted mb-3">Objectifs pédagogiques</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {guide.socleCommun.map((code) => {
                    const colors = SOCLE_COLORS[code] || {
                      bg: "#66666620",
                      text: "var(--color-bw-muted, #666)",
                    };
                    return (
                      <span
                        key={code}
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{
                          backgroundColor: colors.bg,
                          color: colors.text,
                        }}
                      >
                        {code}
                      </span>
                    );
                  })}
                </div>
                <p className="text-sm text-bw-heading leading-relaxed">{guide.objectifPedagogique}</p>
              </GlassCardV2>

              {/* Compétences */}
              <GlassCardV2 className="p-5">
                <p className="label-caps text-bw-muted mb-3">Compétences visées</p>
                <ul className="space-y-2">
                  {guide.competences.map((comp, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-bw-heading">
                      <span className="text-[var(--color-bw-green)] mt-0.5 shrink-0">&#10003;</span>
                      {comp}
                    </li>
                  ))}
                </ul>
              </GlassCardV2>

              {/* Relancer + Challenger */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassCardV2 className="p-4 border-l-4 border-l-[var(--color-bw-teal)]">
                  <span className="label-caps text-bw-teal-600">Relancer</span>
                  <ul className="mt-2 space-y-1.5">
                    {guide.commentRelancer.map((r, i) => (
                      <li key={i} className="text-xs text-bw-heading leading-relaxed">
                        &bull; {r}
                      </li>
                    ))}
                  </ul>
                </GlassCardV2>

                <GlassCardV2 className="p-4 border-l-4 border-l-[var(--color-bw-violet)]">
                  <span className="label-caps text-bw-violet">Challenger</span>
                  <ul className="mt-2 space-y-1.5">
                    {guide.commentChallenger.map((c, i) => (
                      <li key={i} className="text-xs text-bw-heading leading-relaxed">
                        &bull; {c}
                      </li>
                    ))}
                  </ul>
                </GlassCardV2>
              </div>

              {/* Points d'attention */}
              {guide.aQuoiEtreAttentif.length > 0 && (
                <GlassCardV2 variant="flat" className="p-5">
                  <p className="label-caps text-bw-muted mb-3">Points d&apos;attention</p>
                  <ul className="space-y-1.5">
                    {guide.aQuoiEtreAttentif.map((point, i) => (
                      <li key={i} className="text-xs text-bw-heading leading-relaxed pl-3 border-l-2 border-bw-amber">
                        {point}
                      </li>
                    ))}
                  </ul>
                </GlassCardV2>
              )}

              {/* Conseils */}
              {guide.conseils.length > 0 && (
                <GlassCardV2 variant="flat" className="p-5">
                  <p className="label-caps text-bw-muted mb-3">Conseils</p>
                  <ul className="space-y-1.5">
                    {guide.conseils.map((conseil, i) => (
                      <li key={i} className="text-xs text-bw-heading leading-relaxed">
                        &bull; {conseil}
                      </li>
                    ))}
                  </ul>
                </GlassCardV2>
              )}
            </>
          )}

          {/* CTA */}
          <div className="pt-2">
            <Link
              href={`${ROUTES.seanceNew}?module=${encodeURIComponent(exercise.title)}`}
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-bw-primary py-3 text-sm font-semibold text-white hover:bg-bw-primary-500 transition-colors btn-glow"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Créer une séance avec ce module
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
