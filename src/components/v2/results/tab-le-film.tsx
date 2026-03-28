"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";
import DOMPurify from "dompurify";
import { exportElementAsImage, exportElementAsPdf } from "@/lib/export-image";
import { TEMPLATE_LABELS, THEMATIQUE_LABELS, CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/constants";
import type { FilmData } from "@/app/api/sessions/[id]/film/route";

// ── Constants ──

const MANCHE_LABELS: Record<number, string> = {
  1: "Le Ton",
  2: "La Situation",
  3: "Les Personnages",
  4: "L'Objectif",
  5: "L'Obstacle",
  6: "La Première Scène",
  7: "La Relation",
  8: "Le Moment Fort",
};

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

const LEVEL_LABELS: Record<string, string> = {
  primaire: "Primaire",
  college: "Collège",
  lycee: "Lycée",
  superieur: "Supérieur",
};

// ── Helpers ──

function avatarSvg(opts: Record<string, unknown>, size: number): string {
  const { scene, ...dicebearOpts } = opts;
  void scene;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createAvatar(avataaars, { size, ...dicebearOpts } as any).toString();
}

function participationStars(rate: number): number {
  if (rate >= 90) return 5;
  if (rate >= 70) return 4;
  if (rate >= 50) return 3;
  if (rate >= 30) return 2;
  return 1;
}

// ── Inline SVG sub-components (all style={{}}) ──

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
            background: i % 2 === 0 ? "rgba(212,168,67,0.08)" : "transparent",
          }}
        />
      ))}
    </div>
  );
}

function GoldDivider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0 16px" }}>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(212,168,67,0.35))" }} />
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
      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(212,168,67,0.35), transparent)" }} />
    </div>
  );
}

function StarRow({ filled, total = 5 }: { filled: number; total?: number }) {
  return (
    <span>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{ color: i < filled ? "#D4A843" : "#334155", fontSize: 14, letterSpacing: 2 }}>
          {"\u2605"}
        </span>
      ))}
    </span>
  );
}

/** Inline SVG clapperboard — 120x100, gold strokes on dark */
function ClapperboardSvg() {
  return (
    <svg width="120" height="100" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Clapper top (angled stripes) */}
      <path d="M10 30 L110 30 L105 8 L15 8 Z" fill="#1A1D26" stroke="#D4A843" strokeWidth="1.5" />
      {/* Stripe diagonals */}
      <line x1="30" y1="8" x2="25" y2="30" stroke="#D4A843" strokeWidth="2" opacity="0.6" />
      <line x1="50" y1="8" x2="45" y2="30" stroke="#D4A843" strokeWidth="2" opacity="0.6" />
      <line x1="70" y1="8" x2="65" y2="30" stroke="#D4A843" strokeWidth="2" opacity="0.6" />
      <line x1="90" y1="8" x2="85" y2="30" stroke="#D4A843" strokeWidth="2" opacity="0.6" />
      {/* Board body */}
      <rect x="10" y="30" width="100" height="60" rx="3" fill="#0F1219" stroke="#D4A843" strokeWidth="1.5" />
      {/* Text lines */}
      <rect x="20" y="42" width="50" height="3" rx="1.5" fill="#D4A843" opacity="0.5" />
      <rect x="20" y="52" width="35" height="3" rx="1.5" fill="#D4A843" opacity="0.3" />
      <rect x="20" y="62" width="45" height="3" rx="1.5" fill="#D4A843" opacity="0.3" />
      {/* Circle accent */}
      <circle cx="90" cy="60" r="12" fill="none" stroke="#D4A843" strokeWidth="1" opacity="0.4" />
      <circle cx="90" cy="60" r="5" fill="#D4A843" opacity="0.2" />
      {/* Hinge circle */}
      <circle cx="15" cy="30" r="4" fill="#1A1D26" stroke="#D4A843" strokeWidth="1.5" />
    </svg>
  );
}

// ── Main ──

interface TabLeFilmProps {
  filmData: FilmData | null;
}

export function TabLeFilm({ filmData }: TabLeFilmProps) {
  const exportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const getSlug = useCallback(() => {
    if (!filmData) return "film";
    return filmData.session.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }, [filmData]);

  const handleExport = useCallback(async () => {
    if (!exportRef.current || !filmData) return;
    setExporting(true);
    try {
      await exportElementAsImage(exportRef.current, `${getSlug()}-le-film.png`);
      toast.success("Le Film téléchargé !");
    } catch {
      toast.error("Erreur lors de l'export");
    } finally {
      setExporting(false);
    }
  }, [filmData, getSlug]);

  const handleExportPdf = useCallback(async () => {
    if (!exportRef.current || !filmData) return;
    setExporting(true);
    try {
      await exportElementAsPdf(exportRef.current, `${getSlug()}-le-film.pdf`);
      toast.success("PDF téléchargé !");
    } catch {
      toast.error("Erreur lors de l'export PDF");
    } finally {
      setExporting(false);
    }
  }, [filmData, getSlug]);

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
    return <div className="flex items-center justify-center py-16 text-bw-muted text-sm">Chargement du film...</div>;
  }

  const { session, collectiveChoices, personnages, construction, students, stats } = filmData;
  const genreLabel = session.template ? TEMPLATE_LABELS[session.template] || session.template : null;
  const themeLabel = session.thematique ? THEMATIQUE_LABELS[session.thematique] || session.thematique : null;
  const levelLabel = LEVEL_LABELS[session.level] || session.level;
  const stars = participationStars(stats.participationRate);
  const premiereDate = new Date(session.created_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Split students into 2 columns for credits
  const mid = Math.ceil(students.length / 2);
  const col1 = students.slice(0, mid);
  const col2 = students.slice(mid);

  return (
    <div className="space-y-6">
      {/* Export buttons */}
      <div className="flex justify-end gap-2">
        <button
          onClick={handleExportPdf}
          disabled={exporting}
          className="inline-flex items-center gap-2 rounded-lg border border-[#D4A843]/30 bg-transparent px-4 py-2 text-sm font-medium text-[#D4A843] transition-opacity hover:bg-[#D4A843]/10 disabled:opacity-50"
        >
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
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          PDF
        </button>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#D4A843] to-[#FF6B35] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {exporting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
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
              Télécharger le film
            </>
          )}
        </button>
      </div>

      {/* ════ Exportable poster ════ */}
      <div className="flex justify-center">
        <div className="rounded-xl overflow-hidden shadow-[0_8px_40px_rgba(212,168,67,0.2)]">
          <div
            ref={exportRef}
            style={{
              width: 600,
              background: "linear-gradient(180deg, #05060A 0%, #0A0C12 8%, #0F1219 45%, #0A0C12 85%, #05060A 100%)",
              fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
              color: "#F1F5F9",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* ── Ambient light effects ── */}
            <div
              style={{
                position: "absolute",
                top: -100,
                left: "50%",
                transform: "translateX(-50%)",
                width: 600,
                height: 500,
                background:
                  "radial-gradient(ellipse at center, rgba(212,168,67,0.07) 0%, rgba(212,168,67,0.02) 45%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 100,
                left: -80,
                width: 350,
                height: 350,
                background: "radial-gradient(circle, rgba(255,107,53,0.03) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 200,
                right: -80,
                width: 300,
                height: 300,
                background: "radial-gradient(circle, rgba(212,168,67,0.025) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            {/* Film grain */}
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
                padding: "40px 44px 36px",
                gap: 0,
                position: "relative",
                zIndex: 1,
              }}
            >
              {/* ═══ Section 1: Studio header + Clap + Title ═══ */}
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                {/* Studio name */}
                <div
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 4 }}
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
                    color: "#64748B",
                    margin: "0 0 24px",
                  }}
                >
                  présente
                </p>

                {/* Clapperboard */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
                  <ClapperboardSvg />
                </div>

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

                {/* Title with spotlight */}
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: 450,
                      height: 100,
                      background: "radial-gradient(ellipse, rgba(212,168,67,0.12) 0%, transparent 70%)",
                      pointerEvents: "none",
                    }}
                  />
                  <h1
                    style={{
                      fontSize: 48,
                      fontWeight: 900,
                      lineHeight: 1.05,
                      letterSpacing: 3,
                      textTransform: "uppercase",
                      background: "linear-gradient(135deg, #FFFFFF 0%, #F5E6B8 30%, #D4A843 60%, #FF6B35 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      margin: 0,
                      position: "relative",
                      textShadow: "none",
                    }}
                  >
                    {session.title}
                  </h1>
                </div>

                {/* Gold ornament */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    margin: "20px 0 0",
                  }}
                >
                  <div style={{ width: 50, height: 1, background: "linear-gradient(90deg, transparent, #D4A843)" }} />
                  <span style={{ color: "#D4A843", fontSize: 10 }}>{"\u2726"}</span>
                  <div style={{ width: 50, height: 1, background: "linear-gradient(90deg, #D4A843, transparent)" }} />
                </div>

                {/* Thematique */}
                {themeLabel && (
                  <p style={{ fontSize: 14, color: "#94A3B8", fontStyle: "italic", marginTop: 14, letterSpacing: 1 }}>
                    &laquo; {themeLabel} &raquo;
                  </p>
                )}

                {/* Premiere date + Level */}
                <div style={{ marginTop: 20, display: "flex", justifyContent: "center", gap: 12 }}>
                  <span style={{ fontSize: 10, color: "#64748B", letterSpacing: 2, textTransform: "uppercase" }}>
                    Première : {premiereDate}
                  </span>
                  <span style={{ fontSize: 10, color: "#475569" }}>{"\u2022"}</span>
                  <span style={{ fontSize: 10, color: "#64748B", letterSpacing: 2, textTransform: "uppercase" }}>
                    {levelLabel}
                  </span>
                </div>
              </div>

              {/* ═══ Section 2: Synopsis ═══ */}
              {collectiveChoices.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <GoldDivider label="Synopsis" />
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {collectiveChoices.slice(0, 8).map((choice, i) => {
                      const catLabel = CATEGORY_LABELS[choice.category] || choice.category;
                      const catColor = CATEGORY_COLORS[choice.category] || "#D4A843";
                      return (
                        <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
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
                            <p style={{ fontSize: 13, lineHeight: 1.55, color: "#CBD5E1", margin: "2px 0 0" }}>
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
                <div style={{ marginBottom: 28 }}>
                  <GoldDivider label="Personnages" />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
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
                            padding: "10px 8px",
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
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true } }),
                            }}
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
                          <span style={{ fontSize: 8, color: "#64748B", textAlign: "center", fontStyle: "italic" }}>
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
                <div style={{ marginBottom: 28 }}>
                  <GoldDivider label="Construction" />
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative", paddingLeft: 20 }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: 5,
                        top: 6,
                        bottom: 6,
                        width: 1,
                        background: "linear-gradient(180deg, #D4A843, rgba(212,168,67,0.15))",
                      }}
                    />
                    {construction.map((c, idx) => {
                      const label = MANCHE_LABELS[c.manche] || `Manche ${c.manche}`;
                      const roman = ROMAN[c.manche - 1] || String(c.manche);
                      return (
                        <div
                          key={c.manche}
                          style={{
                            display: "flex",
                            gap: 14,
                            alignItems: "flex-start",
                            paddingBottom: idx < construction.length - 1 ? 12 : 0,
                            position: "relative",
                          }}
                        >
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
                            style={{ fontSize: 11, fontWeight: 800, color: "#D4A843", minWidth: 24, flexShrink: 0 }}
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
                            <p style={{ fontSize: 12, lineHeight: 1.5, color: "#CBD5E1", margin: "2px 0 0" }}>
                              {c.winning_text}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ═══ Section 5: Générique — 2-column credits ═══ */}
              {students.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <GoldDivider label="Générique" />
                  <div style={{ display: "flex", justifyContent: "center", gap: 40 }}>
                    {/* Column 1 */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                      {col1.map((s, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: "#CBD5E1", letterSpacing: 0.5 }}>
                            {s.display_name}
                          </span>
                          <span style={{ fontSize: 18 }}>{s.avatar}</span>
                        </div>
                      ))}
                    </div>
                    {/* Divider line */}
                    <div
                      style={{
                        width: 1,
                        background: "linear-gradient(180deg, transparent, rgba(212,168,67,0.25), transparent)",
                      }}
                    />
                    {/* Column 2 */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
                      {col2.map((s, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 18 }}>{s.avatar}</span>
                          <span style={{ fontSize: 13, fontWeight: 500, color: "#CBD5E1", letterSpacing: 0.5 }}>
                            {s.display_name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ═══ Stats + Star rating ═══ */}
              <div style={{ textAlign: "center", paddingTop: 4, marginBottom: 8 }}>
                <div style={{ marginBottom: 10 }}>
                  <StarRow filled={stars} />
                  <span style={{ fontSize: 10, color: "#94A3B8", marginLeft: 8, letterSpacing: 1 }}>
                    {stats.participationRate}% participation
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
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
                    {"\u2726"} {stats.totalStudents} élèves
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
                    {"\u2726"} {stats.totalResponses} réponses
                  </span>
                </div>
              </div>

              {/* ═══ Branding footer ═══ */}
              <div style={{ textAlign: "center", paddingTop: 20 }}>
                <div
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 14 }}
                >
                  <div
                    style={{
                      width: 60,
                      height: 1,
                      background: "linear-gradient(90deg, transparent, rgba(212,168,67,0.3))",
                    }}
                  />
                  <span style={{ color: "#D4A843", fontSize: 6 }}>{"\u2726"}</span>
                  <div
                    style={{
                      width: 60,
                      height: 1,
                      background: "linear-gradient(90deg, rgba(212,168,67,0.3), transparent)",
                    }}
                  />
                </div>
                <p
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    letterSpacing: 8,
                    textTransform: "uppercase",
                    background: "linear-gradient(135deg, #D4A843 0%, #FF6B35 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    margin: 0,
                  }}
                >
                  Banlieuwood
                </p>
                <p
                  style={{ fontSize: 9, color: "#4B5563", letterSpacing: 4, textTransform: "uppercase", marginTop: 5 }}
                >
                  Atelier Cinéma &middot; {new Date().getFullYear()}
                </p>
              </div>
            </div>

            {/* Bottom film strip */}
            <FilmStripBar prefix="bottom" />

            {/* Side accents */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 18,
                bottom: 18,
                width: 4,
                background: "linear-gradient(180deg, #D4A843 0%, rgba(212,168,67,0.15) 50%, #D4A843 100%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 18,
                bottom: 18,
                width: 4,
                background: "linear-gradient(180deg, #D4A843 0%, rgba(212,168,67,0.15) 50%, #D4A843 100%)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
