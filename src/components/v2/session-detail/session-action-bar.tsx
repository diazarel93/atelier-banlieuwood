"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import type { SessionState } from "@/lib/session-state";

interface SessionActionBarProps {
  sessionId: string;
  sessionState: SessionState;
  onProjection: () => void;
  onDuplicate?: () => void;
  isDuplicating?: boolean;
}

export function SessionActionBar({
  sessionId,
  sessionState: ss,
  onProjection,
  onDuplicate,
  isDuplicating,
}: SessionActionBarProps) {
  return (
    <div className="sticky top-14 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-white/85 backdrop-blur-xl border-b border-[var(--color-bw-border)] flex flex-wrap items-center gap-3">
      {ss.canPilot && (
        <Link
          href={ROUTES.pilot(sessionId)}
          prefetch={false}
          className="inline-flex items-center gap-2 rounded-xl bg-bw-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-bw-primary-500 transition-colors btn-glow"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          {ss.ctaLabel}
        </Link>
      )}

      <button
        onClick={onProjection}
        className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-bw-border)] px-4 py-2.5 text-sm font-medium text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors cursor-pointer"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
        Projection
      </button>

      {ss.canViewResults && (
        <Link
          href={ROUTES.seanceResults(sessionId)}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-bw-border)] px-4 py-2.5 text-sm font-medium text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Résultats
        </Link>
      )}

      {ss.canPrepare && (
        <Link
          href={ROUTES.seancePrepare(sessionId)}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-bw-border)] px-4 py-2.5 text-sm font-medium text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors"
        >
          Préparer
        </Link>
      )}

      {onDuplicate && (
        <button
          type="button"
          onClick={onDuplicate}
          disabled={isDuplicating}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-bw-border)] px-4 py-2.5 text-sm font-medium text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors disabled:opacity-50 cursor-pointer"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          {isDuplicating ? "Duplication..." : "Dupliquer"}
        </button>
      )}
    </div>
  );
}
