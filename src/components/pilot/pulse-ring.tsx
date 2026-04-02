"use client";

export type StudentState = "responded" | "active" | "stuck" | "disconnected";

interface PulseRingProps {
  students: { id: string; state: StudentState }[];
  size?: number;
}

const STATE_COLORS: Record<StudentState, string> = {
  responded: "var(--color-bw-teal)", // bw-teal
  active: "#F5A45B", // bw-primary (orange)
  stuck: "#F59E0B", // bw-amber
  disconnected: "#555960", // bw-muted/idle
};

export function PulseRing({ students, size = 36 }: PulseRingProps) {
  const total = students.length;
  if (total === 0) return null;

  const r = (size - 6) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const gap = total > 1 ? 2 : 0;
  const segmentLen = (circumference - gap * total) / total;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      {students.map((s, i) => {
        const offset = i * (segmentLen + gap);
        return (
          <circle
            key={s.id}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={STATE_COLORS[s.state]}
            strokeWidth={3}
            strokeDasharray={`${segmentLen} ${circumference - segmentLen}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            opacity={s.state === "disconnected" ? 0.4 : 1}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        );
      })}
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill="#B8BCC4" fontSize={10} fontWeight={600}>
        {students.filter((s) => s.state === "responded").length}
      </text>
    </svg>
  );
}
