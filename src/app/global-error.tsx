"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fr">
      <body style={{ background: "#0F1117", color: "#E5E7EB", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
          <div style={{ textAlign: "center", maxWidth: "400px" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎬</div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
              Coupez ! Erreur technique
            </h2>
            <p style={{ color: "#9CA3AF", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
              Une erreur inattendue est survenue. Notre equipe est prevenue.
            </p>
            <button
              onClick={reset}
              style={{
                background: "linear-gradient(135deg, #FF6B35, #D4A843)",
                color: "white",
                border: "none",
                padding: "0.75rem 2rem",
                borderRadius: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Reessayer
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
