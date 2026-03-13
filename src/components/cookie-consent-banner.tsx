"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { setConsent, hasRespondedToConsent } from "@/lib/cookie-consent";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show banner if user hasn't responded yet
    if (!hasRespondedToConsent()) {
      // Small delay to avoid flash
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleAccept() {
    setConsent(true);
    setVisible(false);
  }

  function handleRefuse() {
    setConsent(false);
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6"
          role="dialog"
          aria-label="Consentement cookies"
        >
          <div className="mx-auto max-w-2xl rounded-2xl bg-white border border-bw-border shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-bw-heading font-medium mb-1">
                  Cookies & confidentialite
                </p>
                <p className="text-xs text-bw-muted leading-relaxed">
                  Nous utilisons des cookies analytiques (PostHog) pour ameliorer l&apos;experience.
                  Les cookies essentiels (authentification, Sentry) restent actifs.{" "}
                  <a href="/legal/privacy" className="text-bw-primary hover:underline">
                    Politique de confidentialite
                  </a>
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={handleRefuse}
                  className="rounded-xl border border-bw-border px-4 py-2 text-sm font-medium text-bw-muted hover:text-bw-heading hover:bg-bw-bg transition-colors cursor-pointer"
                >
                  Refuser
                </button>
                <button
                  onClick={handleAccept}
                  className="rounded-xl bg-bw-primary px-4 py-2 text-sm font-medium text-white hover:bg-bw-primary-500 transition-colors cursor-pointer"
                >
                  Accepter tout
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
