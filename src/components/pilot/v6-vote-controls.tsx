"use client";

// ═══════════════════════════════════════════════════════════════
// V6 VOTE CONTROLS — 4-button grid for vote management
// ═══════════════════════════════════════════════════════════════

interface V6VoteControlsProps {
  voteState: "closed" | "open" | "revealing" | "revealed";
  totalVotes: number;
  voteOptionCount?: number;
  onOpenVote: () => void;
  onSelectForVote?: () => void;
  onCloseVote: () => void;
  onReveal: () => void;
  onNext: () => void;
  onReset?: () => void;
}

export function V6VoteControls({
  voteState,
  totalVotes,
  voteOptionCount = 0,
  onOpenVote,
  onSelectForVote,
  onCloseVote,
  onReveal,
  onNext,
  onReset,
}: V6VoteControlsProps) {
  const needsSelection = voteState === "closed" && voteOptionCount === 0 && !!onSelectForVote;
  return (
    <section className="rounded-2xl border-2 border-bw-violet-border bg-bw-cockpit-canvas p-5 shadow-[0_0_20px_rgba(139,92,246,0.08)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-body-sm font-bold text-white">Controles Vote</h3>
        <div className="flex items-center gap-2">
          {voteState === "open" && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
              {totalVotes} votes
            </span>
          )}
          <span
            className={`text-body-xs font-semibold px-2.5 py-1 rounded-lg border ${
              voteState === "open"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : voteState === "revealed"
                  ? "bg-bw-amber/10 text-bw-amber border-bw-amber/20"
                  : voteState === "revealing"
                    ? "bg-bw-violet/10 text-bw-violet border-bw-violet/20"
                    : "bg-bw-cockpit-canvas text-bw-cockpit-muted border-[var(--color-bw-cockpit-border)]"
            }`}
          >
            {voteState === "open"
              ? "Ouvert"
              : voteState === "revealed"
                ? "Revele"
                : voteState === "revealing"
                  ? "Revelation..."
                  : "Ferme"}
          </span>
          {onReset && (
            <button
              onClick={onReset}
              className="text-body-xs font-semibold px-2 py-1 min-h-[44px] rounded-md bg-bw-cockpit-canvas border border-[var(--color-bw-cockpit-border)] text-bw-cockpit-muted hover:text-white cursor-pointer transition-colors flex items-center gap-1"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M1 4v6h6" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 4 buttons grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Sélectionner / Ouvrir */}
        {needsSelection ? (
          <button
            onClick={onSelectForVote}
            className="min-h-[44px] py-3 px-4 rounded-xl text-body-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 bg-bw-amber text-white col-span-2 sm:col-span-1"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
            Sélectionner
          </button>
        ) : (
          <button
            onClick={onOpenVote}
            disabled={voteState === "open"}
            className={`min-h-[44px] py-3 px-4 rounded-xl text-body-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed ${
              voteState === "open"
                ? "bg-bw-violet/15 text-bw-violet border border-bw-violet/30"
                : "bg-bw-violet text-white"
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            {voteOptionCount > 0 ? `Ouvrir (${voteOptionCount})` : "Ouvrir"}
          </button>
        )}

        {/* Fermer */}
        <button
          onClick={onCloseVote}
          disabled={voteState !== "open"}
          className={`min-h-[44px] py-3 px-4 rounded-xl text-body-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed ${
            voteState === "open" ? "bg-bw-primary text-white" : "bg-bw-cockpit-surface text-bw-cockpit-muted"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
          Fermer
        </button>

        {/* Reveler */}
        <button
          onClick={onReveal}
          disabled={voteState !== "closed" || totalVotes === 0}
          className={`min-h-[44px] py-3 px-4 rounded-xl text-body-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed ${
            voteState === "closed" && totalVotes > 0
              ? "bg-bw-pink text-white"
              : "bg-bw-cockpit-surface text-bw-cockpit-muted"
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z" />
          </svg>
          Reveler
        </button>

        {/* Suivant */}
        <button
          onClick={onNext}
          disabled={voteState !== "revealed"}
          className={`min-h-[44px] py-3 px-4 rounded-xl text-body-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed ${
            voteState === "revealed" ? "bg-bw-green text-white" : "bg-bw-cockpit-surface text-bw-cockpit-muted"
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M5 4l10 8-10 8z" />
            <path d="M19 5v14" />
          </svg>
          Suivant
        </button>
      </div>
    </section>
  );
}
