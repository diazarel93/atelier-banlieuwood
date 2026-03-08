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
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <GlassCardV2 className={`p-10 flex flex-col items-center text-center max-w-md mx-auto ${className || ""}`}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-bw-surface-dim)] text-bw-muted">
        {icon}
      </div>
      <h2 className="text-lg font-bold text-bw-heading mb-2">{title}</h2>
      <p className="text-sm text-bw-muted leading-relaxed mb-6">{description}</p>
      {action &&
        (action.href ? (
          <Link
            href={action.href}
            className="inline-flex items-center gap-1.5 rounded-lg bg-bw-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-bw-primary-500 transition-colors"
          >
            {action.label}
          </Link>
        ) : (
          <button
            type="button"
            onClick={action.onClick}
            className="inline-flex items-center gap-1.5 rounded-lg bg-bw-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-bw-primary-500 transition-colors"
          >
            {action.label}
          </button>
        ))}
    </GlassCardV2>
  );
}
