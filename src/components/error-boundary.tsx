"use client";

import React from "react";
import * as Sentry from "@sentry/nextjs";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  variant?: "compact" | "full";
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, { extra: { componentStack: errorInfo?.componentStack } });
    console.error("[ErrorBoundary]", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    const variant = this.props.variant ?? "compact";

    if (variant === "full") {
      return (
        <div role="alert" className="min-h-dvh flex items-center justify-center px-4">
          <div className="text-center space-y-4 max-w-sm">
            <div className="w-16 h-16 rounded-full bg-bw-amber/20 flex items-center justify-center mx-auto">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D4A843" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <p className="text-white font-medium">Quelque chose a planté</p>
            <p className="text-bw-muted text-sm">
              Une erreur inattendue s&apos;est produite.
            </p>
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-bw-primary text-white rounded-xl text-sm font-medium cursor-pointer hover:bg-bw-primary/90 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      );
    }

    // Compact variant
    return (
      <div role="alert" className="rounded-xl border border-bw-amber/30 bg-bw-amber/10 p-4 text-center space-y-2">
        <p className="text-sm text-bw-amber font-medium">Quelque chose a planté</p>
        <button
          onClick={this.handleRetry}
          className="px-3 py-1.5 bg-bw-amber/20 text-bw-amber rounded-lg text-xs font-medium cursor-pointer hover:bg-bw-amber/30 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }
}
