"use client";

import { useState, useEffect } from "react";

/**
 * Dark mode toggle with localStorage persistence.
 * Extracted from CockpitContent for clarity.
 */
function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function useCockpitDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(
    () => typeof window !== "undefined" && safeGetItem("cockpit-dark") === "1",
  );

  useEffect(() => {
    try {
      localStorage.setItem("cockpit-dark", isDarkMode ? "1" : "0");
    } catch {}
  }, [isDarkMode]);

  return { isDarkMode, setIsDarkMode };
}
