"use client";

import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { GlassCardV2 } from "./glass-card";
import { useOnboardingWizard } from "@/hooks/use-onboarding-wizard";

const STEPS = [
  {
    title: "Bienvenue sur Banlieuwood !",
    description:
      "La plateforme d'ecriture cinematographique collaborative. Pilotez des seances interactives ou 5 a 30 eleves creent un court-metrage ensemble.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="20" width="36" height="20" rx="3" fill="#F3F4F6" stroke="#FF6B35" strokeWidth="1.5" />
        <path d="M6 20L14 6H34L42 20" fill="#FF6B35" fillOpacity="0.15" stroke="#FF6B35" strokeWidth="1.5" strokeLinejoin="round" />
        <line x1="18" y1="10" x2="15" y2="18" stroke="#FF6B35" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="26" y1="8" x2="23" y2="18" stroke="#FF6B35" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    cta: null,
  },
  {
    title: "8 modules pedagogiques",
    description:
      "De l'imagination au tournage : chaque module est une brique du film. Les eleves ecrivent, votent, debattent — chacun sur sa tablette ou ordinateur.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="4" y="8" width="16" height="14" rx="3" fill="#FF6B35" fillOpacity="0.15" stroke="#FF6B35" strokeWidth="1.5" />
        <rect x="28" y="8" width="16" height="14" rx="3" fill="#8B5CF6" fillOpacity="0.15" stroke="#8B5CF6" strokeWidth="1.5" />
        <rect x="4" y="28" width="16" height="14" rx="3" fill="#D4A843" fillOpacity="0.15" stroke="#D4A843" strokeWidth="1.5" />
        <rect x="28" y="28" width="16" height="14" rx="3" fill="#4ECDC4" fillOpacity="0.15" stroke="#4ECDC4" strokeWidth="1.5" />
      </svg>
    ),
    cta: { label: "Voir les modules", href: ROUTES.bibliotheque },
  },
  {
    title: "Creez votre premiere seance",
    description:
      "Choisissez un niveau, un module, et lancez ! Un code unique est genere pour que vos eleves rejoignent la session depuis leur appareil.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="18" fill="#4ECDC4" fillOpacity="0.1" stroke="#4ECDC4" strokeWidth="1.5" />
        <path d="M24 16v16M16 24h16" stroke="#4ECDC4" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    cta: { label: "Creer une seance", href: ROUTES.seanceNew },
  },
  {
    title: "Pilotez en temps reel",
    description:
      "Suivez les reponses, lancez les votes, gerez le rythme. Tout est synchronise en direct. Vos eleves n'ont besoin d'aucun compte.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M10 38V20M18 38V14M26 38V24M34 38V10" stroke="#FF6B35" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
    cta: { label: "Voir le dashboard", href: ROUTES.dashboard },
  },
];

export function OnboardingWizard() {
  const { showWizard, currentStep, nextStep, prevStep, dismiss } = useOnboardingWizard();

  if (!showWizard) return null;

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;
  const isFirst = currentStep === 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-6"
      >
        <GlassCardV2 className="p-6 sm:p-8 max-w-2xl mx-auto">
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStep ? "w-6 bg-bw-primary" : i < currentStep ? "w-3 bg-bw-primary/40" : "w-3 bg-bw-border"
                }`}
              />
            ))}
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-4">{step.icon}</div>
              <h2 className="text-lg font-bold text-bw-heading mb-2">{step.title}</h2>
              <p className="text-sm text-bw-muted leading-relaxed max-w-md">{step.description}</p>

              {step.cta && (
                <Link
                  href={step.cta.href}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-bw-primary/10 px-4 py-2 text-sm font-semibold text-bw-primary hover:bg-bw-primary/20 transition-colors"
                >
                  {step.cta.label}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-bw-border">
            <button
              type="button"
              onClick={dismiss}
              className="text-xs text-bw-muted hover:text-bw-heading transition-colors cursor-pointer min-h-11 px-2"
            >
              Passer
            </button>

            <div className="flex gap-2">
              {!isFirst && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="rounded-xl border border-bw-border px-4 py-2 text-sm font-medium text-bw-muted hover:text-bw-heading transition-colors cursor-pointer"
                >
                  Précédent
                </button>
              )}
              <button
                type="button"
                onClick={isLast ? dismiss : nextStep}
                className="rounded-xl bg-bw-primary px-4 py-2 text-sm font-semibold text-white hover:bg-bw-primary-500 transition-colors cursor-pointer"
              >
                {isLast ? "C'est parti !" : "Suivant"}
              </button>
            </div>
          </div>
        </GlassCardV2>
      </motion.div>
    </AnimatePresence>
  );
}
