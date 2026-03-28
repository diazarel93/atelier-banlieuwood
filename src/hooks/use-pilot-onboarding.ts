"use client";

import { useState, useCallback } from "react";

const STORAGE_KEY = "bw-pilot-onboarding-done";

export interface OnboardingStep {
  id: string;
  target: string; // CSS selector or data-onboarding attribute
  text: string;
  position: "top" | "bottom" | "left" | "right";
}

const STEPS: OnboardingStep[] = [
  {
    id: "floating-cta",
    target: "[data-onboarding='next-action']",
    text: "Appuyez ici ou [N] pour avancer",
    position: "top",
  },
  {
    id: "broadcast",
    target: "[data-onboarding='broadcast']",
    text: "Envoyez un message a toute la classe",
    position: "bottom",
  },
  { id: "responses", target: "[data-onboarding='responses']", text: "Les reponses apparaissent ici", position: "top" },
  { id: "classmap", target: "[data-onboarding='classmap']", text: "Cliquez un eleve pour sa fiche", position: "right" },
];

export function usePilotOnboarding() {
  // Initialize from localStorage synchronously to avoid flash
  const [done, setDone] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      return !!localStorage.getItem(STORAGE_KEY);
    } catch {
      return true;
    }
  });
  const [currentStep, setCurrentStep] = useState(0);

  const dismiss = useCallback(() => {
    setDone(true);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {}
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev >= STEPS.length - 1) {
        setDone(true);
        try {
          localStorage.setItem(STORAGE_KEY, "true");
        } catch {}
        return prev;
      }
      return prev + 1;
    });
  }, []);

  return {
    showOnboarding: !done,
    currentStep: STEPS[currentStep] || null,
    stepIndex: currentStep,
    totalSteps: STEPS.length,
    nextStep,
    dismiss,
  };
}
