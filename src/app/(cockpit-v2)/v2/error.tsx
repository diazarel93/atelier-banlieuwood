"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function V2Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error, { tags: { page: "v2", device: "unknown" } });
    console.error("[V2Error]", error.message, error.stack);
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
      <div style={{ textAlign: "center", maxWidth: "440px" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
          Erreur du tableau de bord
        </h2>
        <p style={{ color: "#6B7280", marginBottom: "1rem", fontSize: "0.875rem" }}>
          Le tableau de bord a rencontre un probleme.
        </p>
        {/* Show error details for debugging */}
        <div
          style={{
            background: "rgba(239,68,68,0.05)",
            border: "1px solid rgba(239,68,68,0.15)",
            borderRadius: "0.75rem",
            padding: "0.75rem",
            marginBottom: "1.5rem",
            textAlign: "left",
          }}
        >
          <p style={{ fontSize: "0.7rem", color: "#EF4444", fontFamily: "monospace", wordBreak: "break-word" }}>
            {error.message}
          </p>
          {error.digest && (
            <p style={{ fontSize: "0.65rem", color: "#9CA3AF", marginTop: "0.25rem" }}>
              Ref: {error.digest}
            </p>
          )}
        </div>
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
            onClick={() => (window.location.href = "/v2/seances")}
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
            Retour aux seances
          </button>
        </div>
      </div>
    </div>
  );
}
