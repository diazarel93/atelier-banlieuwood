import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  emoji?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: "h-7 w-7 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
} as const;

const COLORS = [
  { bg: "var(--color-bw-violet-100)", text: "var(--color-bw-violet)" },
  { bg: "var(--color-bw-teal-100)", text: "var(--color-bw-teal-600)" },
  { bg: "var(--color-bw-amber-100)", text: "var(--color-bw-amber-500)" },
  { bg: "var(--color-bw-danger-100)", text: "var(--color-bw-danger)" },
  { bg: "var(--color-bw-green-100)", text: "var(--color-bw-green)" },
];

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function Avatar({ name, emoji, size = "md", className }: AvatarProps) {
  if (emoji) {
    return (
      <span
        className={cn(
          "flex items-center justify-center rounded-full bg-[var(--color-bw-surface-dim)] shrink-0",
          SIZES[size],
          className
        )}
      >
        {emoji}
      </span>
    );
  }

  const color = COLORS[hashName(name) % COLORS.length];

  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-full font-semibold shrink-0",
        SIZES[size],
        className
      )}
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {getInitials(name)}
    </span>
  );
}
