"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function PilotError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error, { tags: { page: "pilot", device: "unknown" } });
    console.error("[PilotError]", error.message, error.stack);
  }, [error]);

  return (
    <div
      className="theme-lavande"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "#F8F7FC",
        color: "#1a1a2e",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "420px" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Erreur du cockpit</h2>
        <p style={{ color: "#6B7280", marginBottom: "0.75rem", fontSize: "0.875rem" }}>
          Le cockpit a rencontre un probleme. Vos eleves ne sont pas affectes.
        </p>
        <p style={{ color: "#9CA3AF", marginBottom: "1.5rem", fontSize: "0.75rem" }}>
          Si vous etes sur iPad, essayez Safari a jour ou un ordinateur.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <button
            onClick={reset}
            style={{
              background: "#FF6B35",
              color: "white",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Reessayer
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "rgba(0,0,0,0.05)",
              color: "#1a1a2e",
              border: "1px solid rgba(0,0,0,0.1)",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Recharger
          </button>
        </div>
        {process.env.NODE_ENV === "development" && (
          <pre
            style={{
              marginTop: "1rem",
              fontSize: "0.7rem",
              color: "#EF4444",
              textAlign: "left",
              overflowX: "auto",
              padding: "0.5rem",
              background: "rgba(255,0,0,0.05)",
              borderRadius: "0.5rem",
              border: "1px solid rgba(255,0,0,0.1)",
            }}
          >
            {error.message}
          </pre>
        )}
      </div>
    </div>
  );
}
