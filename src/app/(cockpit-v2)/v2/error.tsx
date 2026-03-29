"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function V2Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error, { tags: { page: "v2", device: "unknown" } });
    console.error("[V2Error]", error.message, error.stack);
  }, [error]);

  return (
    <div className="theme-lavande min-h-dvh flex items-center justify-center p-8 bg-[var(--background)] text-bw-heading font-sans">
      <div className="text-center max-w-[440px]">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-heading-lg mb-2">Erreur du tableau de bord</h2>
        <p className="text-sm text-bw-muted mb-4">Le tableau de bord a rencontré un problème.</p>

        {/* Error details */}
        <div className="bg-bw-danger/5 border border-bw-danger/15 rounded-xl p-3 mb-6 text-left">
          <p className="text-[11px] text-bw-danger font-mono break-words">{error.message}</p>
          {error.digest && <p className="text-[10px] text-bw-muted mt-1">Ref: {error.digest}</p>}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-bw-primary text-white px-6 py-3 rounded-xl font-semibold text-sm cursor-pointer hover:bg-bw-primary-500 transition-colors"
          >
            Réessayer
          </button>
          <button
            onClick={() => (window.location.href = "/v2/seances")}
            className="bg-[var(--color-bw-surface-dim)] text-bw-heading border border-[var(--color-bw-border)] px-6 py-3 rounded-xl font-semibold text-sm cursor-pointer hover:bg-[var(--color-bw-surface)] transition-colors"
          >
            Retour aux séances
          </button>
        </div>
      </div>
    </div>
  );
}
