import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "bw-v2-onboarding-done";

export function useOnboardingWizard() {
  const [showWizard, setShowWizard] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      setShowWizard(true);
    }
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, 3));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const dismiss = useCallback(() => {
    setShowWizard(false);
    localStorage.setItem(STORAGE_KEY, "true");
  }, []);

  return { showWizard, currentStep, nextStep, prevStep, dismiss };
}
