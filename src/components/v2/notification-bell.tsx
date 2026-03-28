"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useDashboardSummary } from "@/hooks/use-dashboard-v2";
import { computeNotifications, type NotificationItem } from "@/lib/notifications";

const TYPE_ICONS: Record<NotificationItem["type"], string> = {
  prepare: "\u{1F4CB}",
  results: "\u{1F4CA}",
};

const SEVERITY_COLORS: Record<NotificationItem["severity"], string> = {
  info: "bg-[var(--color-bw-primary)]/10 text-bw-primary",
  warning: "bg-[var(--color-bw-amber-100)] text-[var(--color-bw-amber)]",
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data } = useDashboardSummary();

  const notifications = data
    ? computeNotifications({
        todaySessions: data.todaySessions,
        tomorrowSessions: data.tomorrowSessions,
      })
    : [];

  const count = notifications.length;

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-bw-muted hover:text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors cursor-pointer"
        aria-label={`Notifications${count > 0 ? ` (${count})` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="notification-panel"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-bw-danger)] text-[10px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div
          id="notification-panel"
          role="region"
          aria-label="Notifications"
          className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-[var(--color-bw-border)] bg-card shadow-lg z-50"
        >
          <div className="px-4 py-3 border-b border-[var(--color-bw-border)]">
            <h3 className="text-sm font-semibold text-bw-heading">Notifications</h3>
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-bw-muted">Rien de nouveau</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={notif.href}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--color-bw-surface-dim)] transition-colors border-b border-[var(--color-bw-border-subtle)] last:border-0"
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg text-xs shrink-0",
                      SEVERITY_COLORS[notif.severity],
                    )}
                  >
                    {TYPE_ICONS[notif.type]}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-bw-heading">{notif.title}</p>
                    <p className="text-xs text-bw-muted truncate">{notif.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
