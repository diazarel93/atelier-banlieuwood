"use client";

import Link from "next/link";
import { GlassCardV2 } from "./glass-card";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Optional accent color for the icon ring. Defaults to primary orange. */
  accent?: "primary" | "violet" | "teal" | "amber";
  className?: string;
}

const ACCENT_STYLES = {
  primary: {
    ring: "ring-bw-primary/10",
    bg: "bg-gradient-to-br from-bw-primary-50 to-bw-primary-100",
    icon: "text-bw-primary",
  },
  violet: {
    ring: "ring-bw-violet/10",
    bg: "bg-gradient-to-br from-bw-violet-50 to-bw-violet-100",
    icon: "text-bw-violet",
  },
  teal: {
    ring: "ring-bw-teal/10",
    bg: "bg-gradient-to-br from-bw-teal-50 to-bw-teal-100",
    icon: "text-bw-teal",
  },
  amber: {
    ring: "ring-bw-amber/10",
    bg: "bg-gradient-to-br from-bw-amber-100 to-bw-yellow-100",
    icon: "text-bw-amber",
  },
};

export function EmptyState({ icon, title, description, action, accent = "primary", className }: EmptyStateProps) {
  const styles = ACCENT_STYLES[accent];

  const actionClasses =
    "inline-flex items-center gap-1.5 rounded-xl bg-bw-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-bw-glow-primary)] hover:bg-bw-primary-500 hover:shadow-[0_0_20px_rgba(255,107,53,0.35)] active:scale-[0.98] transition-all duration-150";

  return (
    <GlassCardV2 className={`py-14 px-8 flex flex-col items-center text-center max-w-md mx-auto ${className || ""}`}>
      {/* Icon with gradient background + ring */}
      <div
        className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ring-inset ${styles.ring} ${styles.bg} ${styles.icon}`}
      >
        {icon}
      </div>

      <h2 className="text-heading-md text-bw-heading mb-2">{title}</h2>
      <p className="text-body-sm text-bw-muted leading-relaxed mb-8 max-w-xs">{description}</p>

      {action &&
        (action.href ? (
          <Link href={action.href} className={actionClasses}>
            {action.label}
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 3l4 4-4 4" />
            </svg>
          </Link>
        ) : (
          <button type="button" onClick={action.onClick} className={actionClasses}>
            {action.label}
          </button>
        ))}
    </GlassCardV2>
  );
}
