"use client";

import { useState, useEffect } from "react";

/**
 * Dark mode toggle with localStorage persistence.
 * Extracted from CockpitContent for clarity.
 */
export function useCockpitDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(
    () => typeof window !== "undefined" && localStorage.getItem("cockpit-dark") === "1"
  );

  useEffect(() => {
    localStorage.setItem("cockpit-dark", isDarkMode ? "1" : "0");
  }, [isDarkMode]);

  return { isDarkMode, setIsDarkMode };
}
