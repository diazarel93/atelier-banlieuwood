"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="bg-studio relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
      {/* Ambient danger glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-bw-danger/[0.06] blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 h-[300px] w-[300px] rounded-full bg-bw-primary/[0.04] blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center animate-[page-fade-in_600ms_cubic-bezier(0.4,0,0.2,1)_forwards]">
        {/* Error icon with glow */}
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 animate-pulse rounded-full bg-bw-danger/20 blur-xl" />
          <div className="glass-card relative flex h-20 w-20 items-center justify-center rounded-2xl border-bw-danger/20">
            <svg
              className="h-10 w-10 text-bw-danger drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="bw-display mt-8 text-4xl uppercase tracking-wider text-bw-heading sm:text-5xl">
          Coupure technique
        </h1>

        {/* Separator line */}
        <div className="mt-4 h-px w-24 bg-gradient-to-r from-transparent via-bw-danger/40 to-transparent" />

        {/* Description */}
        <p className="mt-5 max-w-md text-sm leading-relaxed text-bw-muted">
          Un probleme est survenu sur le plateau. L&apos;equipe technique intervient
          pour relancer la prise.
        </p>

        {/* Error digest (dev info) */}
        {error.digest && (
          <p className="mt-3 font-mono text-xs text-bw-placeholder">
            Ref: {error.digest}
          </p>
        )}

        {/* CTA button */}
        <button
          onClick={reset}
          className="btn-glow mt-10 inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-br from-bw-primary to-bw-primary-600 px-8 py-3.5 text-sm font-semibold tracking-wide text-white shadow-[0_0_24px_rgba(255,107,53,0.3),0_4px_16px_rgba(255,107,53,0.2)] transition-all duration-300 hover:shadow-[0_0_32px_rgba(255,107,53,0.45),0_6px_24px_rgba(255,107,53,0.3)] hover:brightness-110"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
          </svg>
          Relancer la scene
        </button>
      </div>
    </div>
  )
}
