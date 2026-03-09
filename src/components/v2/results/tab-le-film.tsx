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
  4: "L\u2019Objectif",
  5: "L\u2019Obstacle",
  6: "La Premi\u00e8re Sc\u00e8ne",
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

/** Participation rate → 1-5 stars */
function participationStars(rate: number): number {
  if (rate >= 90) return 5;
  if (rate >= 70) return 4;
  if (rate >= 50) return 3;
  if (rate >= 30) return 2;
  return 1;
}

// ── Shared inline sub-components ──

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

function GoldDivider({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        margin: "4px 0 16px",
      }}
    >
      <div
        style={{
          flex: 1,
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(212,168,67,0.35))",
        }}
      />
      <span
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 5,
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
            "linear-gradient(90deg, rgba(212,168,67,0.35), transparent)",
        }}
      />
    </div>
  );
}

function StarRow({ filled, total = 5 }: { filled: number; total?: number }) {
  return (
    <span>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          style={{
            color: i < filled ? "#D4A843" : "#334155",
            fontSize: 14,
            letterSpacing: 2,
          }}
        >
          {"\u2605"}
        </span>
      ))}
    </span>
  );
}

// ── Main component ──

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
      toast.success("Le Film t\u00e9l\u00e9charg\u00e9 !");
    } catch {
      toast.error("Erreur lors de l\u2019export");
    } finally {
      setExporting(false);
    }
  }, [filmData]);

  // Pre-render avatar SVGs
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

  const {
    session,
    collectiveChoices,
    personnages,
    construction,
    students,
    stats,
  } = filmData;
  const genreLabel = session.template
    ? TEMPLATE_LABELS[session.template] || session.template
    : null;
  const themeLabel = session.thematique
    ? THEMATIQUE_LABELS[session.thematique] || session.thematique
    : null;
  const stars = participationStars(stats.participationRate);
  const dateStr = new Date(session.created_at).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
  });

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
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Export en cours...
            </>
          ) : (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              T\u00e9l\u00e9charger le film
            </>
          )}
        </button>
      </div>

      {/* ── Exportable poster — 100% inline styles ── */}
      <div className="flex justify-center">
        <div className="rounded-xl overflow-hidden shadow-[0_8px_40px_rgba(212,168,67,0.2)]">
          <div
            ref={exportRef}
            style={{
              width: 600,
              background:
                "linear-gradient(180deg, #05060A 0%, #0A0C12 10%, #0F1219 40%, #0A0C12 80%, #05060A 100%)",
              fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
              color: "#F1F5F9",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* ── Ambient light effects ── */}
            {/* Spotlight from top center */}
            <div
              style={{
                position: "absolute",
                top: -80,
                left: "50%",
                transform: "translateX(-50%)",
                width: 500,
                height: 400,
                background:
                  "radial-gradient(ellipse at center, rgba(212,168,67,0.08) 0%, rgba(212,168,67,0.03) 40%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            {/* Warm glow bottom left */}
            <div
              style={{
                position: "absolute",
                bottom: 60,
                left: -60,
                width: 300,
                height: 300,
                background:
                  "radial-gradient(circle, rgba(255,107,53,0.04) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            {/* Film grain overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0.025,
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                pointerEvents: "none",
              }}
            />

            {/* Top film strip */}
            <FilmStripBar prefix="top" />

            {/* ── Main content ── */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "36px 44px 32px",
                gap: 28,
                position: "relative",
                zIndex: 1,
              }}
            >
              {/* ═══ Section 1: "BANLIEUWOOD PRESENTE" + Title Card ═══ */}
              <div style={{ textAlign: "center" }}>
                {/* Decorative stars + studio name */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    marginBottom: 6,
                  }}
                >
                  <span style={{ color: "#D4A843", fontSize: 8 }}>
                    {"\u2726"} {"\u2726"} {"\u2726"}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: 8,
                      textTransform: "uppercase",
                      color: "#D4A843",
                    }}
                  >
                    Banlieuwood
                  </span>
                  <span style={{ color: "#D4A843", fontSize: 8 }}>
                    {"\u2726"} {"\u2726"} {"\u2726"}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: 6,
                    textTransform: "uppercase",
                    color: "#94A3B8",
                    margin: "0 0 20px",
                  }}
                >
                  pr\u00e9sente
                </p>

                {/* Genre badge */}
                {genreLabel && (
                  <div
                    style={{
                      display: "inline-block",
                      padding: "4px 20px",
                      borderRadius: 999,
                      border: "1px solid rgba(212,168,67,0.5)",
                      background: "rgba(212,168,67,0.06)",
                      color: "#D4A843",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 3,
                      textTransform: "uppercase",
                      marginBottom: 20,
                    }}
                  >
                    {genreLabel}
                  </div>
                )}

                {/* Spotlight glow behind title */}
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: 400,
                      height: 80,
                      background:
                        "radial-gradient(ellipse, rgba(212,168,67,0.1) 0%, transparent 70%)",
                      pointerEvents: "none",
                    }}
                  />
                  <h1
                    style={{
                      fontSize: 46,
                      fontWeight: 900,
                      lineHeight: 1.05,
                      letterSpacing: 3,
                      textTransform: "uppercase",
                      background:
                        "linear-gradient(135deg, #FFFFFF 0%, #F5E6B8 30%, #D4A843 60%, #FF6B35 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      padding: "0 4px",
                      margin: 0,
                      position: "relative",
                    }}
                  >
                    {session.title}
                  </h1>
                </div>

                {/* Gold ornament divider */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    margin: "18px 0 0",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 1,
                      background:
                        "linear-gradient(90deg, transparent, #D4A843)",
                    }}
                  />
                  <span style={{ color: "#D4A843", fontSize: 10 }}>
                    {"\u2726"}
                  </span>
                  <div
                    style={{
                      width: 40,
                      height: 1,
                      background:
                        "linear-gradient(90deg, #D4A843, transparent)",
                    }}
                  />
                </div>

                {/* Thematique */}
                {themeLabel && (
                  <p
                    style={{
                      fontSize: 14,
                      color: "#94A3B8",
                      fontStyle: "italic",
                      marginTop: 14,
                      letterSpacing: 1,
                    }}
                  >
                    &laquo; {themeLabel} &raquo;
                  </p>
                )}
              </div>

              {/* ═══ Section 2: Synopsis ═══ */}
              {collectiveChoices.length > 0 && (
                <div>
                  <GoldDivider label="Synopsis" />
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
                              boxShadow: `0 0 10px ${catColor}50`,
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
                                lineHeight: 1.55,
                                color: "#CBD5E1",
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

              {/* ═══ Section 3: Personnages (M10) ═══ */}
              {personnages.length > 0 && (
                <div>
                  <GoldDivider label="Personnages" />
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 10,
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
                            width: 118,
                            background:
                              "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
                            border: "1px solid rgba(212,168,67,0.12)",
                            borderRadius: 12,
                            padding: "10px 8px 10px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <div
                            style={{
                              width: 56,
                              height: 56,
                              borderRadius: 28,
                              overflow: "hidden",
                              flexShrink: 0,
                              border: "2px solid rgba(212,168,67,0.2)",
                            }}
                            dangerouslySetInnerHTML={{ __html: svg }}
                          />
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#F1F5F9",
                              textAlign: "center",
                              lineHeight: 1.2,
                            }}
                          >
                            {p.prenom}
                          </span>
                          {p.trait_dominant && (
                            <span
                              style={{
                                fontSize: 8,
                                fontWeight: 700,
                                color: "#FF6B35",
                                textTransform: "uppercase",
                                letterSpacing: 1.5,
                                textAlign: "center",
                              }}
                            >
                              {p.trait_dominant}
                            </span>
                          )}
                          <span
                            style={{
                              fontSize: 8,
                              color: "#64748B",
                              textAlign: "center",
                              fontStyle: "italic",
                            }}
                          >
                            par {p.studentName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ═══ Section 4: Construction Collective (M12) ═══ */}
              {construction.length > 0 && (
                <div>
                  <GoldDivider label="Construction" />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 0,
                      position: "relative",
                      paddingLeft: 20,
                    }}
                  >
                    {/* Timeline line */}
                    <div
                      style={{
                        position: "absolute",
                        left: 5,
                        top: 6,
                        bottom: 6,
                        width: 1,
                        background:
                          "linear-gradient(180deg, #D4A843, rgba(212,168,67,0.15))",
                      }}
                    />
                    {construction.map((c, idx) => {
                      const label =
                        MANCHE_LABELS[c.manche] || `Manche ${c.manche}`;
                      const roman =
                        ROMAN[c.manche - 1] || String(c.manche);
                      return (
                        <div
                          key={c.manche}
                          style={{
                            display: "flex",
                            gap: 14,
                            alignItems: "flex-start",
                            paddingBottom:
                              idx < construction.length - 1 ? 12 : 0,
                            position: "relative",
                          }}
                        >
                          {/* Timeline dot */}
                          <div
                            style={{
                              position: "absolute",
                              left: -18,
                              top: 4,
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              background: "#0F1219",
                              border: "2px solid #D4A843",
                              boxShadow: "0 0 6px rgba(212,168,67,0.3)",
                            }}
                          />
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              color: "#D4A843",
                              minWidth: 24,
                              flexShrink: 0,
                            }}
                          >
                            {roman}
                          </span>
                          <div style={{ flex: 1 }}>
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 700,
                                letterSpacing: 2,
                                textTransform: "uppercase",
                                color: "#94A3B8",
                              }}
                            >
                              {label}
                            </span>
                            <p
                              style={{
                                fontSize: 12,
                                lineHeight: 1.5,
                                color: "#CBD5E1",
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

              {/* ═══ Section 5: G\u00e9n\u00e9rique / Credits ═══ */}
              {students.length > 0 && (
                <div>
                  <GoldDivider label="Avec" />
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
                          gap: 5,
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          borderRadius: 999,
                          padding: "4px 12px 4px 6px",
                        }}
                      >
                        <span style={{ fontSize: 16 }}>{s.avatar}</span>
                        <span
                          style={{
                            fontSize: 11,
                            color: "#CBD5E1",
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

              {/* ═══ Stats badges + Star rating ═══ */}
              <div style={{ textAlign: "center", paddingTop: 4 }}>
                {/* Star rating */}
                <div style={{ marginBottom: 10 }}>
                  <StarRow filled={stars} />
                  <span
                    style={{
                      fontSize: 10,
                      color: "#94A3B8",
                      marginLeft: 8,
                      letterSpacing: 1,
                    }}
                  >
                    {stats.participationRate}% participation
                  </span>
                </div>

                {/* Stats pills */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "3px 10px",
                      borderRadius: 999,
                      border: "1px solid rgba(212,168,67,0.2)",
                      background: "rgba(212,168,67,0.05)",
                      fontSize: 10,
                      color: "#D4A843",
                      fontWeight: 600,
                    }}
                  >
                    {"\u2726"} {stats.totalStudents} \u00e9l\u00e8ves
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "3px 10px",
                      borderRadius: 999,
                      border: "1px solid rgba(212,168,67,0.2)",
                      background: "rgba(212,168,67,0.05)",
                      fontSize: 10,
                      color: "#D4A843",
                      fontWeight: 600,
                    }}
                  >
                    {"\u2726"} {stats.totalResponses} r\u00e9ponses
                  </span>
                </div>
              </div>

              {/* ═══ Branding footer ═══ */}
              <div
                style={{
                  textAlign: "center",
                  marginTop: 4,
                  paddingTop: 16,
                }}
              >
                {/* Ornament */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      width: 50,
                      height: 1,
                      background:
                        "linear-gradient(90deg, transparent, rgba(212,168,67,0.3))",
                    }}
                  />
                  <span style={{ color: "#D4A843", fontSize: 6 }}>
                    {"\u2726"}
                  </span>
                  <div
                    style={{
                      width: 50,
                      height: 1,
                      background:
                        "linear-gradient(90deg, rgba(212,168,67,0.3), transparent)",
                    }}
                  />
                </div>

                <p
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    letterSpacing: 8,
                    textTransform: "uppercase",
                    background:
                      "linear-gradient(135deg, #D4A843 0%, #FF6B35 100%)",
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
                    color: "#4B5563",
                    letterSpacing: 4,
                    textTransform: "uppercase",
                    marginTop: 5,
                  }}
                >
                  Atelier &middot; {dateStr}
                </p>
              </div>
            </div>

            {/* Bottom film strip */}
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
                  "linear-gradient(180deg, #D4A843 0%, rgba(212,168,67,0.15) 50%, #D4A843 100%)",
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
                  "linear-gradient(180deg, #D4A843 0%, rgba(212,168,67,0.15) 50%, #D4A843 100%)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
