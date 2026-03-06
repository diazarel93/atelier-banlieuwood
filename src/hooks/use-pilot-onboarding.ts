"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "bw-pilot-onboarding-done";

export interface OnboardingStep {
  id: string;
  target: string; // CSS selector or data-onboarding attribute
  text: string;
  position: "top" | "bottom" | "left" | "right";
}

const STEPS: OnboardingStep[] = [
  { id: "floating-cta", target: "[data-onboarding='next-action']", text: "Appuyez ici ou [N] pour avancer", position: "top" },
  { id: "broadcast", target: "[data-onboarding='broadcast']", text: "Envoyez un message a toute la classe", position: "bottom" },
  { id: "responses", target: "[data-onboarding='responses']", text: "Les reponses apparaissent ici", position: "top" },
  { id: "classmap", target: "[data-onboarding='classmap']", text: "Cliquez un eleve pour sa fiche", position: "right" },
];

export function usePilotOnboarding() {
  const [done, setDone] = useState(true); // Default to true to avoid flash
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setDone(false);
      setCurrentStep(0);
    }
  }, []);

  const dismiss = useCallback(() => {
    setDone(true);
    localStorage.setItem(STORAGE_KEY, "true");
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev >= STEPS.length - 1) {
        setDone(true);
        localStorage.setItem(STORAGE_KEY, "true");
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
