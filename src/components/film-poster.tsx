"use client";

import { forwardRef } from "react";
import { TEMPLATE_LABELS, THEMATIQUE_LABELS, CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/constants";

export interface PosterChoice {
  category: string;
  text: string;
}

export interface PosterStudent {
  displayName: string;
  avatar: string;
}

export interface FilmPosterProps {
  title: string;
  template?: string | null;
  thematique?: string | null;
  collectiveChoices: PosterChoice[];
  students: PosterStudent[];
}

/**
 * Film Poster — cinematic recap visual for a completed Banlieuwood session.
 * Designed for html-to-image export: self-contained, no external assets.
 */
const FilmPoster = forwardRef<HTMLDivElement, FilmPosterProps>(
  ({ title, template, thematique, collectiveChoices, students }, ref) => {
    const genreLabel = template ? TEMPLATE_LABELS[template] || template : null;
    const themeLabel = thematique ? THEMATIQUE_LABELS[thematique] || thematique : null;

    // Pick up to 5 best story beats
    const storyBeats = collectiveChoices.slice(0, 5);

    return (
      <div
        ref={ref}
        style={{
          width: 600,
          minHeight: 850,
          background: "linear-gradient(180deg, #08090E 0%, #0E1017 15%, #15181F 50%, #0E1017 85%, #08090E 100%)",
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

        {/* Top film-strip border */}
        <div style={{ display: "flex", height: 18, flexShrink: 0 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={`top-${i}`}
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

        {/* Main poster content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "32px 40px",
            gap: 24,
          }}
        >
          {/* ── Header: Genre badge + Title ── */}
          <div style={{ textAlign: "center" }}>
            {/* Genre badge */}
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

            {/* Title */}
            <h1
              style={{
                fontSize: 42,
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: 2,
                textTransform: "uppercase",
                background: "linear-gradient(135deg, #FFFFFF 0%, #D4A843 50%, #FF6B35 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                padding: "0 8px",
                margin: 0,
              }}
            >
              {title}
            </h1>

            {/* Gold divider */}
            <div
              style={{
                width: 120,
                height: 2,
                background: "linear-gradient(90deg, transparent, #D4A843, transparent)",
                margin: "16px auto 0",
              }}
            />

            {/* Thematique */}
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

          {/* ── Synopsis: collective choices as story beats ── */}
          {storyBeats.length > 0 && (
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: "linear-gradient(90deg, transparent, rgba(212,168,67,0.3))",
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 4,
                    textTransform: "uppercase",
                    color: "#D4A843",
                  }}
                >
                  Synopsis
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: "linear-gradient(90deg, rgba(212,168,67,0.3), transparent)",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {storyBeats.map((choice, i) => {
                  const catLabel = CATEGORY_LABELS[choice.category] || choice.category;
                  const catColor = CATEGORY_COLORS[choice.category] || "#D4A843";
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "flex-start",
                      }}
                    >
                      {/* Category dot */}
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
                          {choice.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Cast: student avatars + names ── */}
          {students.length > 0 && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: "linear-gradient(90deg, transparent, rgba(212,168,67,0.3))",
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 4,
                    textTransform: "uppercase",
                    color: "#D4A843",
                  }}
                >
                  Distribution
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: "linear-gradient(90deg, rgba(212,168,67,0.3), transparent)",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {students.map((student, i) => (
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
                    <span style={{ fontSize: 18 }}>{student.avatar}</span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#D1D5DB",
                        fontWeight: 500,
                      }}
                    >
                      {student.displayName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Branding footer ── */}
          <div style={{ textAlign: "center", marginTop: "auto", paddingTop: 16 }}>
            <div
              style={{
                width: 80,
                height: 1,
                background: "linear-gradient(90deg, transparent, rgba(212,168,67,0.4), transparent)",
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
          </div>
        </div>

        {/* Bottom film-strip border */}
        <div style={{ display: "flex", height: 18, flexShrink: 0 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={`bottom-${i}`}
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

        {/* Side film-strip accents (left) */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 18,
            bottom: 18,
            width: 4,
            background: "linear-gradient(180deg, #D4A843 0%, rgba(212,168,67,0.2) 50%, #D4A843 100%)",
          }}
        />
        {/* Side film-strip accents (right) */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 18,
            bottom: 18,
            width: 4,
            background: "linear-gradient(180deg, #D4A843 0%, rgba(212,168,67,0.2) 50%, #D4A843 100%)",
          }}
        />
      </div>
    );
  },
);

FilmPoster.displayName = "FilmPoster";
export default FilmPoster;
