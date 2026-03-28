"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
// BrandLogo available for back-link pages if needed

import { Breadcrumb, type BreadcrumbItem } from "@/components/breadcrumb";

interface DashboardHeaderProps {
  backHref?: string;
  backLabel?: string;
  breadcrumb?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function DashboardHeader({ backHref, backLabel, breadcrumb, actions }: DashboardHeaderProps) {
  return (
    <header className="glass sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 flex items-center justify-between rounded-b-xl">
      {/* Left side -- back link or breadcrumb */}
      <div className="flex items-center gap-3">
        {backHref ? (
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-bw-muted hover:text-bw-primary hover:bg-bw-primary/10"
          >
            <Link href={backHref}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              {backLabel ?? "Retour"}
            </Link>
          </Button>
        ) : breadcrumb ? (
          <Breadcrumb items={breadcrumb} />
        ) : (
          <div className="flex items-center gap-3">
            {/* Film clap icon */}
            <div className="flex size-8 items-center justify-center rounded-lg bg-bw-primary/10 border border-bw-primary/20">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="text-bw-primary"
              >
                <rect x="2" y="2" width="20" height="20" rx="2.18" />
                <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 7h5M17 17h5" />
              </svg>
            </div>
            <span className="bw-display text-xl tracking-wider uppercase text-gradient-cinema">
              Director&apos;s Dashboard
            </span>
          </div>
        )}
      </div>

      {/* Right side -- actions only (no duplicate brand) */}
      <div className="flex items-center gap-3">{actions}</div>
    </header>
  );
}
