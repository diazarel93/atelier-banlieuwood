"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function PlayError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error, { tags: { page: "play", device: "unknown" } });
    console.error("[PlayError]", error.message, error.stack);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "#0F1117",
        color: "#E5E7EB",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "400px" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎬</div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Oups, petit souci technique</h2>
        <p style={{ color: "#9CA3AF", marginBottom: "1rem", fontSize: "0.875rem" }}>
          Essaie de recharger la page. Si le probleme persiste, reconnecte-toi.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <button
            onClick={reset}
            style={{
              background: "linear-gradient(135deg, var(--color-bw-primary), var(--color-bw-gold))",
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
              background: "rgba(255,255,255,0.1)",
              color: "#E5E7EB",
              border: "1px solid rgba(255,255,255,0.2)",
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
              background: "rgba(255,0,0,0.1)",
              borderRadius: "0.5rem",
            }}
          >
            {error.message}
          </pre>
        )}
      </div>
    </div>
  );
}
