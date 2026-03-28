"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Detects if the app is running as an installed PWA (standalone mode).
 */
function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as unknown as { standalone: boolean }).standalone === true)
  );
}

/**
 * Detects if the Fullscreen API is available.
 */
function canFullscreen(): boolean {
  if (typeof document === "undefined") return false;
  return !!(
    document.documentElement.requestFullscreen ||
    (document.documentElement as unknown as { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen
  );
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
}

export function FullscreenToggle() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPwaHint, setShowPwaHint] = useState(false);
  const standalone = typeof window !== "undefined" && isStandalone();

  // Track fullscreen state changes
  useEffect(() => {
    function handleChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", handleChange);
    document.addEventListener("webkitfullscreenchange", handleChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
      document.removeEventListener("webkitfullscreenchange", handleChange);
    };
  }, []);

  const toggle = useCallback(() => {
    if (isFullscreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as unknown as { webkitExitFullscreen?: () => void }).webkitExitFullscreen) {
        (document as unknown as { webkitExitFullscreen: () => void }).webkitExitFullscreen();
      }
      return;
    }

    if (canFullscreen()) {
      const el = document.documentElement as unknown as {
        requestFullscreen?: () => Promise<void>;
        webkitRequestFullscreen?: () => void;
      };
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      }
    } else {
      // No Fullscreen API (old iPad) — show PWA hint
      setShowPwaHint(true);
    }
  }, [isFullscreen]);

  // Don't show in standalone PWA mode (already fullscreen)
  if (standalone) return null;

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-label={isFullscreen ? "Quitter le plein ecran" : "Plein ecran"}
        className="p-2 min-h-11 min-w-11 flex items-center justify-center rounded-lg text-bw-muted hover:text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors"
      >
        {isFullscreen ? (
          // Minimize icon
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M6 2v4H2M10 14v-4h4M14 6h-4V2M2 10h4v4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          // Maximize icon
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M2 6V2h4M14 10v4h-4M10 2h4v4M6 14H2v-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* PWA install hint for iPad without Fullscreen API */}
      {showPwaHint && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowPwaHint(false)}
        >
          <div
            className="mx-4 max-w-sm rounded-2xl bg-card p-6 shadow-2xl border border-[var(--color-bw-border)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-4">
              <div className="text-4xl">📱</div>
              <h3 className="text-lg font-bold text-bw-heading">Mode plein ecran</h3>
              <p className="text-sm text-bw-muted leading-relaxed">
                {isIOS() ? (
                  <>
                    Sur iPad/iPhone, appuyez sur{" "}
                    <span className="inline-flex items-center gap-1 font-medium text-bw-heading">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        aria-hidden="true"
                      >
                        <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                        <polyline points="16 6 12 2 8 6" />
                        <line x1="12" y1="2" x2="12" y2="15" />
                      </svg>
                      Partager
                    </span>{" "}
                    puis <strong>&quot;Sur l&apos;ecran d&apos;accueil&quot;</strong> pour ouvrir Banlieuwood en plein
                    ecran sans barre de navigation.
                  </>
                ) : (
                  <>
                    Votre navigateur ne supporte pas le plein ecran. Utilisez <strong>F11</strong> ou installez
                    l&apos;app depuis le menu du navigateur.
                  </>
                )}
              </p>
              <button
                onClick={() => setShowPwaHint(false)}
                className="px-4 py-2 rounded-xl bg-bw-primary text-white text-sm font-semibold hover:bg-bw-primary/90 transition-colors"
              >
                Compris
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
