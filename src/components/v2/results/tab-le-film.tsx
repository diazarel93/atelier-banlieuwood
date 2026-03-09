"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";
import { exportElementAsImage } from "@/lib/export-image";
import {
  TEMPLATE_LABELS,
  THEMATIQUE_LABELS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from "@/lib/constants";
import type { FilmData } from "@/app/api/sessions/[id]/film/route";

// ── Constants ──

const MANCHE_LABELS: Record<number, string> = {
  1: "Le Ton",
  2: "La Situation",
  3: "Les Personnages",
  4: "L'Objectif",
  5: "L'Obstacle",
  6: "La Premiere Scene",
  7: "La Relation",
  8: "Le Moment Fort",
};

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

// ── Helpers ──

function avatarSvg(opts: Record<string, unknown>, size: number): string {
  const { scene, ...dicebearOpts } = opts;
  void scene;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createAvatar(avataaars, { size, ...dicebearOpts } as any).toString();
}

// ── Section divider (gold bar with label) ──

function SectionDivider({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        margin: "8px 0 16px",
      }}
    >
      <div
        style={{
          flex: 1,
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(212,168,67,0.3))",
        }}
      />
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 4,
          textTransform: "uppercase" as const,
          color: "#D4A843",
        }}
      >
        {label}
      </span>
      <div
        style={{
          flex: 1,
          height: 1,
          background:
            "linear-gradient(90deg, rgba(212,168,67,0.3), transparent)",
        }}
      />
    </div>
  );
}

// ── Film strip bar ──

function FilmStripBar({ prefix }: { prefix: string }) {
  return (
    <div style={{ display: "flex", height: 18, flexShrink: 0 }}>
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={`${prefix}-${i}`}
          style={{
            width: 30,
            height: 18,
            borderLeft: "2px solid #D4A843",
            borderRight: "2px solid #D4A843",
            borderTop: "3px solid #D4A843",
            borderBottom: "3px solid #D4A843",
            background:
              i % 2 === 0 ? "rgba(212,168,67,0.08)" : "transparent",
          }}
        />
      ))}
    </div>
  );
}

// ── Props ──

interface TabLeFilmProps {
  filmData: FilmData | null;
}

export function TabLeFilm({ filmData }: TabLeFilmProps) {
  const exportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (!exportRef.current || !filmData) return;
    setExporting(true);
    try {
      const slug = filmData.session.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      await exportElementAsImage(exportRef.current, `${slug}-le-film.png`);
      toast.success("Le Film telecharge !");
    } catch {
      toast.error("Erreur lors de l'export");
    } finally {
      setExporting(false);
    }
  }, [filmData]);

  // Pre-render avatar SVGs for inline embedding
  const avatarSvgs = useMemo(() => {
    if (!filmData) return {};
    const map: Record<string, string> = {};
    for (const p of filmData.personnages) {
      const key = `${p.prenom}-${p.studentName}`;
      map[key] = avatarSvg(p.avatar_data, 64);
    }
    return map;
  }, [filmData]);

  if (!filmData) {
    return (
      <div className="flex items-center justify-center py-16 text-bw-muted text-sm">
        Chargement du film...
      </div>
    );
  }

  const { session, collectiveChoices, personnages, construction, students, stats } = filmData;
  const genreLabel = session.template ? TEMPLATE_LABELS[session.template] || session.template : null;
  const themeLabel = session.thematique ? THEMATIQUE_LABELS[session.thematique] || session.thematique : null;

  return (
    <div className="space-y-6">
      {/* Export button */}
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#D4A843] to-[#FF6B35] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {exporting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Export en cours...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Telecharger le film
            </>
          )}
        </button>
      </div>

      {/* Exportable zone — all inline styles for PNG export */}
      <div className="flex justify-center">
        <div className="rounded-xl overflow-hidden shadow-[0_8px_40px_rgba(212,168,67,0.15)]">
          <div
            ref={exportRef}
            style={{
              width: 600,
              background:
                "linear-gradient(180deg, #08090E 0%, #0E1017 15%, #15181F 50%, #0E1017 85%, #08090E 100%)",
              fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
              color: "#F1F5F9",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Film grain overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0.03,
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                pointerEvents: "none",
              }}
            />

            {/* Top film-strip */}
            <FilmStripBar prefix="top" />

            {/* Main content */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "32px 40px",
                gap: 24,
              }}
            >
              {/* ── Section 1: Title Card ── */}
              <div style={{ textAlign: "center" }}>
                {genreLabel && (
                  <div
                    style={{
                      display: "inline-block",
                      padding: "4px 18px",
                      borderRadius: 999,
                      border: "1px solid #D4A843",
                      color: "#D4A843",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: 3,
                      textTransform: "uppercase",
                      marginBottom: 16,
                    }}
                  >
                    {genreLabel}
                  </div>
                )}

                <h1
                  style={{
                    fontSize: 42,
                    fontWeight: 800,
                    lineHeight: 1.1,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    background:
                      "linear-gradient(135deg, #FFFFFF 0%, #D4A843 50%, #FF6B35 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    padding: "0 8px",
                    margin: 0,
                  }}
                >
                  {session.title}
                </h1>

                <div
                  style={{
                    width: 120,
                    height: 2,
                    background:
                      "linear-gradient(90deg, transparent, #D4A843, transparent)",
                    margin: "16px auto 0",
                  }}
                />

                {themeLabel && (
                  <p
                    style={{
                      fontSize: 15,
                      color: "#94A3B8",
                      fontStyle: "italic",
                      marginTop: 12,
                      letterSpacing: 1,
                    }}
                  >
                    {themeLabel}
                  </p>
                )}
              </div>

              {/* ── Section 2: Synopsis (collective choices) ── */}
              {collectiveChoices.length > 0 && (
                <div>
                  <SectionDivider label="Synopsis" />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {collectiveChoices.slice(0, 8).map((choice, i) => {
                      const catLabel =
                        CATEGORY_LABELS[choice.category] || choice.category;
                      const catColor =
                        CATEGORY_COLORS[choice.category] || "#D4A843";
                      return (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            gap: 12,
                            alignItems: "flex-start",
                          }}
                        >
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: catColor,
                              marginTop: 6,
                              flexShrink: 0,
                              boxShadow: `0 0 8px ${catColor}40`,
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 700,
                                letterSpacing: 2,
                                textTransform: "uppercase",
                                color: catColor,
                              }}
                            >
                              {catLabel}
                            </span>
                            <p
                              style={{
                                fontSize: 13,
                                lineHeight: 1.5,
                                color: "#D1D5DB",
                                margin: "2px 0 0",
                              }}
                            >
                              {choice.chosen_text}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Section 3: Personnages (M10) ── */}
              {personnages.length > 0 && (
                <div>
                  <SectionDivider label="Personnages" />
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 12,
                      justifyContent: "center",
                    }}
                  >
                    {personnages.map((p, i) => {
                      const key = `${p.prenom}-${p.studentName}`;
                      const svg = avatarSvgs[key] || "";
                      return (
                        <div
                          key={i}
                          style={{
                            width: 120,
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 12,
                            padding: 10,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <div
                            style={{
                              width: 64,
                              height: 64,
                              borderRadius: 8,
                              overflow: "hidden",
                              flexShrink: 0,
                            }}
                            dangerouslySetInnerHTML={{ __html: svg }}
                          />
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#F1F5F9",
                              textAlign: "center",
                            }}
                          >
                            {p.prenom}
                          </span>
                          {p.trait_dominant && (
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 600,
                                color: "#FF6B35",
                                textTransform: "uppercase",
                                letterSpacing: 1,
                                textAlign: "center",
                              }}
                            >
                              {p.trait_dominant}
                            </span>
                          )}
                          <span
                            style={{
                              fontSize: 9,
                              color: "#94A3B8",
                              textAlign: "center",
                            }}
                          >
                            {p.studentName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Section 4: Construction Collective (M12) ── */}
              {construction.length > 0 && (
                <div>
                  <SectionDivider label="Construction Collective" />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {construction.map((c) => {
                      const label =
                        MANCHE_LABELS[c.manche] || `Manche ${c.manche}`;
                      const roman = ROMAN[c.manche - 1] || String(c.manche);
                      return (
                        <div
                          key={c.manche}
                          style={{
                            display: "flex",
                            gap: 12,
                            alignItems: "flex-start",
                          }}
                        >
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              border: "1px solid #D4A843",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#D4A843",
                            }}
                          >
                            {roman}
                          </div>
                          <div style={{ flex: 1 }}>
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 700,
                                letterSpacing: 2,
                                textTransform: "uppercase",
                                color: "#D4A843",
                              }}
                            >
                              {label}
                            </span>
                            <p
                              style={{
                                fontSize: 13,
                                lineHeight: 1.5,
                                color: "#D1D5DB",
                                margin: "2px 0 0",
                              }}
                            >
                              {c.winning_text}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Section 5: Generique ── */}
              {students.length > 0 && (
                <div>
                  <SectionDivider label="Distribution" />
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    {students.map((s, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 999,
                          padding: "4px 12px 4px 6px",
                        }}
                      >
                        <span style={{ fontSize: 18 }}>{s.avatar}</span>
                        <span
                          style={{
                            fontSize: 11,
                            color: "#D1D5DB",
                            fontWeight: 500,
                          }}
                        >
                          {s.display_name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Branding footer ── */}
              <div
                style={{
                  textAlign: "center",
                  marginTop: 8,
                  paddingTop: 16,
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 1,
                    background:
                      "linear-gradient(90deg, transparent, rgba(212,168,67,0.4), transparent)",
                    margin: "0 auto 12px",
                  }}
                />
                <p
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    letterSpacing: 6,
                    textTransform: "uppercase",
                    background: "linear-gradient(135deg, #D4A843, #FF6B35)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    margin: 0,
                  }}
                >
                  Banlieuwood
                </p>
                <p
                  style={{
                    fontSize: 9,
                    color: "#606876",
                    letterSpacing: 3,
                    textTransform: "uppercase",
                    marginTop: 4,
                  }}
                >
                  Atelier &middot; {new Date().getFullYear()}
                </p>
                {/* Stats line */}
                <p
                  style={{
                    fontSize: 9,
                    color: "#475569",
                    marginTop: 8,
                    letterSpacing: 1,
                  }}
                >
                  {stats.totalStudents} eleves &middot;{" "}
                  {stats.totalResponses} reponses &middot;{" "}
                  {stats.participationRate}% participation
                </p>
              </div>
            </div>

            {/* Bottom film-strip */}
            <FilmStripBar prefix="bottom" />

            {/* Side film-strip accents */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 18,
                bottom: 18,
                width: 4,
                background:
                  "linear-gradient(180deg, #D4A843 0%, rgba(212,168,67,0.2) 50%, #D4A843 100%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 18,
                bottom: 18,
                width: 4,
                background:
                  "linear-gradient(180deg, #D4A843 0%, rgba(212,168,67,0.2) 50%, #D4A843 100%)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
