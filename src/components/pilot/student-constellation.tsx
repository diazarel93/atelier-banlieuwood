"use client";

import { memo, useMemo } from "react";
import { STATE_STYLE } from "./state-styles";

/* ═══════════════════════════════════════════════════════════════
   StudentConstellation — SVG star-field visualization
   Replaces a flat student list with an organic constellation.
   Each student = a star positioned via golden-angle distribution.
   ═══════════════════════════════════════════════════════════════ */

type StudentState = "responded" | "active" | "stuck" | "disconnected";

interface StudentConstellationProps {
  studentStates: {
    id: string;
    state: StudentState;
    display_name: string;
    avatar: string;
    hand_raised_at?: string | null;
  }[];
  onStudentClick: (id: string) => void;
  teams?: {
    id: string;
    team_name: string;
    team_color: string;
    students: { id: string }[];
  }[];
}

/* ── Constants ── */

const GOLDEN_ANGLE = 137.508; // degrees
const MIN_SIZE = 200;
const STAR_RADIUS = 8; // base star outer radius
const DISCONNECTED_RADIUS = 5;
const LABEL_OFFSET = 16;

/* ── Utility: deterministic hash from student id ── */

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/* ── Utility: 5-point star path centered at (0,0) ── */

function starPath(outerR: number, innerR: number): string {
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / 2) + (i * Math.PI) / 5; // start from top
    const x = Math.cos(angle) * r;
    const y = -Math.sin(angle) * r;
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return `M${points.join("L")}Z`;
}

/* ── Positioning: golden-angle spiral with seeded jitter ── */

function computePositions(
  students: StudentConstellationProps["studentStates"],
  viewSize: number,
) {
  const cx = viewSize / 2;
  const cy = viewSize / 2;
  const maxRadius = viewSize / 2 - 24; // leave margin for labels
  const baseRadius = Math.min(Math.sqrt(students.length) * 20, maxRadius);

  return students.map((s, i) => {
    const angle = (i * GOLDEN_ANGLE * Math.PI) / 180;
    // Distribute outward with sqrt for even area coverage
    const r = baseRadius * Math.sqrt((i + 1) / students.length);
    // Seeded jitter to break perfect symmetry
    const h = hashId(s.id);
    const jitterR = ((h % 100) / 100 - 0.5) * 12;
    const jitterA = (((h >> 8) % 100) / 100 - 0.5) * 0.3;

    const x = cx + Math.cos(angle + jitterA) * (r + jitterR);
    const y = cy + Math.sin(angle + jitterA) * (r + jitterR);

    return { ...s, x, y };
  });
}

/* ── Component ── */

function StudentConstellationInner({
  studentStates,
  onStudentClick,
  teams,
}: StudentConstellationProps) {
  const viewSize = useMemo(
    () => Math.max(MIN_SIZE, Math.ceil(Math.sqrt(studentStates.length) * 55)),
    [studentStates.length],
  );

  const positioned = useMemo(
    () => computePositions(studentStates, viewSize),
    [studentStates, viewSize],
  );

  // Team lines: connect all team members pairwise
  const teamLines = useMemo(() => {
    if (!teams || teams.length === 0) return [];
    const posMap = new Map(positioned.map((p) => [p.id, p]));
    const lines: { x1: number; y1: number; x2: number; y2: number; color: string }[] = [];

    for (const team of teams) {
      const members = team.students
        .map((s) => posMap.get(s.id))
        .filter(Boolean) as (typeof positioned)[number][];
      for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
          lines.push({
            x1: members[i].x,
            y1: members[i].y,
            x2: members[j].x,
            y2: members[j].y,
            color: team.team_color,
          });
        }
      }
    }
    return lines;
  }, [teams, positioned]);

  const starD = useMemo(() => starPath(STAR_RADIUS, STAR_RADIUS * 0.4), []);

  if (studentStates.length === 0) {
    return (
      <p className="text-sm text-bw-muted text-center py-4">Aucun joueur</p>
    );
  }

  return (
    <>
      {/* CSS animations scoped via data attributes */}
      <style>{`
        .constellation-star {
          cursor: pointer;
          will-change: transform;
          transition: transform 0.15s ease;
        }
        .constellation-star:hover {
          transform: scale(1.2);
        }
        .constellation-star:hover .constellation-label {
          opacity: 1;
        }

        @keyframes star-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }
        @keyframes star-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes star-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .constellation-responded .constellation-shape {
          animation: star-pulse 2s ease-in-out infinite;
        }
        .constellation-active .constellation-shape {
          animation: star-rotate 12s linear infinite;
        }
        .constellation-stuck .constellation-shape {
          animation: star-blink 1.2s ease-in-out infinite;
        }
      `}</style>

      <svg
        viewBox={`0 0 ${viewSize} ${viewSize}`}
        width="100%"
        height="100%"
        className="max-w-full"
        role="img"
        aria-label="Constellation des joueurs"
      >
        {/* Glow filters */}
        <defs>
          <filter id="constellation-glow-responded" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="constellation-glow-stuck" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Team connection lines */}
        {teamLines.map((line, i) => (
          <line
            key={`team-line-${i}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={line.color}
            strokeWidth={1}
            opacity={0.15}
          />
        ))}

        {/* Students */}
        {positioned.map((student) => {
          const isDisconnected = student.state === "disconnected";
          const style = STATE_STYLE[student.state] ?? STATE_STYLE.disconnected;
          const fillColor = style.dot;
          const labelColor =
            student.state === "disconnected" ? "#B0A99E" : style.dot;
          const filter =
            student.state === "responded"
              ? "url(#constellation-glow-responded)"
              : student.state === "stuck"
                ? "url(#constellation-glow-stuck)"
                : undefined;

          // Truncate display name
          const label =
            student.display_name.length > 10
              ? student.display_name.slice(0, 9) + "\u2026"
              : student.display_name;

          return (
            <g
              key={student.id}
              className={`constellation-star constellation-${student.state}`}
              onClick={() => onStudentClick(student.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onStudentClick(student.id);
                }
              }}
              aria-label={`${student.display_name} — ${student.state}`}
              style={{
                transformOrigin: `${student.x}px ${student.y}px`,
              }}
            >
              {/* Star or circle shape */}
              {isDisconnected ? (
                <circle
                  className="constellation-shape"
                  cx={student.x}
                  cy={student.y}
                  r={DISCONNECTED_RADIUS}
                  fill={fillColor}
                  opacity={0.35}
                />
              ) : (
                <path
                  className="constellation-shape"
                  d={starD}
                  fill={fillColor}
                  filter={filter}
                  style={{
                    transformOrigin: `${student.x}px ${student.y}px`,
                    translate: `${student.x}px ${student.y}px`,
                  }}
                />
              )}

              {/* Avatar emoji centered in star */}
              <text
                x={student.x}
                y={student.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={10}
                style={{ pointerEvents: "none" }}
              >
                {student.avatar}
              </text>

              {/* Hand raised indicator */}
              {student.hand_raised_at && (
                <text
                  x={student.x}
                  y={student.y - STAR_RADIUS - 4}
                  textAnchor="middle"
                  dominantBaseline="auto"
                  fontSize={9}
                  style={{ pointerEvents: "none" }}
                >
                  {"\u270B"}
                </text>
              )}

              {/* Display name label */}
              <text
                className="constellation-label"
                x={student.x}
                y={student.y + LABEL_OFFSET}
                textAnchor="middle"
                dominantBaseline="hanging"
                fontSize={8}
                fill={labelColor}
                opacity={0.8}
                style={{ pointerEvents: "none" }}
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </>
  );
}

export const StudentConstellation = memo(StudentConstellationInner);
