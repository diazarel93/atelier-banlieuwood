"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { exportElementAsImage } from "@/lib/export-image";
import { BrandLogo } from "@/components/brand-logo";
import { resolveTalentProfile } from "@/lib/talent-profiles";

interface BadgeData {
  displayName: string;
  avatar: string | null;
  sessionTitle: string;
  level: string;
  responses: number;
  retained: number;
  impactRate: number;
  creativeProfile: string | null;
  personnage: { prenom: string; trait_dominant: string } | null;
  achievements: string[];
  date: string;
}

const LEVEL_LABELS: Record<string, string> = {
  primaire: "Primaire",
  college: "Collège",
  lycee: "Lycée",
  superieur: "Supérieur",
};

export default function BadgePage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<BadgeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/badge/${token}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-dvh bg-studio flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-bw-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-dvh bg-studio flex flex-col items-center justify-center text-center px-4">
        <p className="text-lg font-semibold text-bw-heading mb-2">Badge introuvable</p>
        <p className="text-sm text-bw-muted">Ce lien n&apos;est plus valide ou a expiré.</p>
      </div>
    );
  }

  const profile = resolveTalentProfile(data.creativeProfile);

  return (
    <div className="min-h-dvh bg-studio flex flex-col items-center justify-center px-4 py-8">
      <div className="film-grain absolute inset-0 pointer-events-none" />

      {/* Badge card — exportable */}
      <div className="rounded-xl overflow-hidden shadow-[0_8px_40px_rgba(212,168,67,0.2)]">
        <div
          ref={badgeRef}
          style={{
            width: 400,
            background: "linear-gradient(180deg, #0A0C12 0%, #141722 50%, #0A0C12 100%)",
            fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
            color: "#F1F5F9",
            padding: "40px 32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            position: "relative",
          }}
        >
          {/* Ambient glow */}
          <div
            style={{
              position: "absolute",
              top: -60,
              left: "50%",
              transform: "translateX(-50%)",
              width: 300,
              height: 300,
              background: "radial-gradient(circle, rgba(212,168,67,0.08) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Studio header */}
          <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            <div
              style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "#D4A843", fontWeight: 600 }}
            >
              Banlieuwood Atelier
            </div>
            <div style={{ fontSize: 8, color: "#64748B", marginTop: 4 }}>Certificat de participation</div>
          </div>

          {/* Avatar + name */}
          <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>{data.avatar || "🎬"}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#F1F5F9" }}>{data.displayName}</div>
            {profile && (
              <div style={{ fontSize: 13, color: "#D4A843", marginTop: 4, fontWeight: 500 }}>
                {profile.emoji} {profile.label}
              </div>
            )}
          </div>

          {/* Separator */}
          <div
            style={{ width: 60, height: 2, background: "linear-gradient(90deg, #D4A843, #FF6B35)", borderRadius: 2 }}
          />

          {/* Session info */}
          <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#CBD5E1" }}>{data.sessionTitle}</div>
            <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>
              {LEVEL_LABELS[data.level] || data.level} · {new Date(data.date).toLocaleDateString("fr-FR")}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 20, position: "relative", zIndex: 1 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#D4A843" }}>{data.responses}</div>
              <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: 1 }}>
                Réponses
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#FF6B35" }}>{data.retained}</div>
              <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: 1 }}>
                Retenues
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#10B981" }}>{data.impactRate}%</div>
              <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: 1 }}>Impact</div>
            </div>
          </div>

          {/* Personnage */}
          {data.personnage && (
            <div
              style={{
                textAlign: "center",
                padding: "12px 20px",
                background: "rgba(255,255,255,0.04)",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.06)",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div style={{ fontSize: 11, color: "#64748B", marginBottom: 4 }}>Personnage créé</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#F1F5F9" }}>{data.personnage.prenom}</div>
              <div style={{ fontSize: 12, color: "#94A3B8", fontStyle: "italic" }}>
                {data.personnage.trait_dominant}
              </div>
            </div>
          )}

          {/* Achievements */}
          {data.achievements.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                justifyContent: "center",
                position: "relative",
                zIndex: 1,
              }}
            >
              {data.achievements.slice(0, 5).map((a) => (
                <span
                  key={a}
                  style={{
                    fontSize: 10,
                    padding: "3px 10px",
                    borderRadius: 12,
                    background: "rgba(212,168,67,0.12)",
                    color: "#D4A843",
                    fontWeight: 500,
                  }}
                >
                  {a}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              fontSize: 8,
              color: "#475569",
              textTransform: "uppercase",
              letterSpacing: 3,
              position: "relative",
              zIndex: 1,
            }}
          >
            banlieuwood.fr
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6 relative z-10">
        <button
          onClick={async () => {
            if (!badgeRef.current) return;
            await exportElementAsImage(badgeRef.current, `badge-${data.displayName}.png`);
          }}
          className="rounded-lg bg-gradient-to-r from-[#D4A843] to-[#FF6B35] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          Télécharger le badge
        </button>
      </div>

      {/* Branding */}
      <div className="mt-8 relative z-10">
        <BrandLogo size="sm" color="cinema" />
      </div>
    </div>
  );
}
