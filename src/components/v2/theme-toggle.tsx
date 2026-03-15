"use client";

import { useState, useEffect } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    try {
      // Check localStorage first, then OS preference
      const stored = localStorage.getItem("bw-theme");
      if (stored === "dark") {
        setIsDark(true);
        document.querySelector(".theme-lavande")?.setAttribute("data-theme", "dark");
      } else if (stored === null) {
        // No stored preference — check OS preference
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (prefersDark) {
          setIsDark(true);
          document.querySelector(".theme-lavande")?.setAttribute("data-theme", "dark");
          localStorage.setItem("bw-theme", "dark");
        }
      }
    } catch { /* iPad Private Browsing — ignore */ }
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    const el = document.querySelector(".theme-lavande");
    if (next) {
      el?.setAttribute("data-theme", "dark");
      try { localStorage.setItem("bw-theme", "dark"); } catch {}
    } else {
      el?.removeAttribute("data-theme");
      try { localStorage.setItem("bw-theme", "light"); } catch {}
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      aria-pressed={isDark}
      className="p-2 min-h-11 min-w-11 flex items-center justify-center rounded-lg text-bw-muted hover:text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors"
    >
      {isDark ? (
        // Sun icon
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ) : (
        // Moon icon
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M14 8.5A6 6 0 117.5 2a4.5 4.5 0 006.5 6.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
