import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "bw-v2-onboarding-done";

export function useOnboardingWizard() {
  const [showWizard, setShowWizard] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    try {
      const done = localStorage.getItem(STORAGE_KEY);
      if (!done) setShowWizard(true);
    } catch { /* iPad Private Browsing */ }
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, 3));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const dismiss = useCallback(() => {
    setShowWizard(false);
    try { localStorage.setItem(STORAGE_KEY, "true"); } catch {}
  }, []);

  return { showWizard, currentStep, nextStep, prevStep, dismiss };
}
