"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { GlassCardV2 } from "./glass-card";

interface MiniCalendarProps {
  /** Dates with sessions — show dots */
  sessionDates?: Date[];
  /** Currently selected date */
  selectedDate?: Date;
  /** Month to display (defaults to current) */
  month?: Date;
  onSelectDate?: (date: Date) => void;
  className?: string;
}

const DAYS = ["L", "M", "M", "J", "V", "S", "D"];
const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function MiniCalendar({
  sessionDates = [],
  selectedDate,
  month: monthProp,
  onSelectDate,
  className,
}: MiniCalendarProps) {
  const now = new Date();
  const [monthOffset, setMonthOffset] = useState(0);
  const baseMonth = monthProp || now;
  const month = new Date(baseMonth.getFullYear(), baseMonth.getMonth() + monthOffset, 1);
  const year = month.getFullYear();
  const monthIdx = month.getMonth();

  const sessionSet = useMemo(() => {
    const set = new Set<string>();
    for (const d of sessionDates) {
      set.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    }
    return set;
  }, [sessionDates]);

  const days = (() => {
    const firstDay = new Date(year, monthIdx, 1);
    // Monday = 0 in our grid
    const startDay = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

    const cells: (Date | null)[] = [];
    // padding before
    for (let i = 0; i < startDay; i++) cells.push(null);
    // actual days
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(year, monthIdx, d));
    }
    return cells;
  })();

  return (
    <GlassCardV2 className={cn("p-4", className)}>
      {/* Header with navigation */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonthOffset((o) => o - 1)}
          aria-label="Mois précédent"
          className="p-1 rounded-md text-bw-muted hover:text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-bw-heading">
          {MONTHS[monthIdx]} {year}
        </span>
        <button
          type="button"
          onClick={() => setMonthOffset((o) => o + 1)}
          aria-label="Mois suivant"
          className="p-1 rounded-md text-bw-muted hover:text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAYS.map((d, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-medium text-bw-muted"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="h-7" />;
          }

          const isToday = isSameDay(date, now);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const hasSession = sessionSet.has(
            `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
          );

          return (
            <button
              key={date.getDate()}
              type="button"
              onClick={() => onSelectDate?.(date)}
              className={cn(
                "relative flex h-7 w-full items-center justify-center rounded-md text-xs transition-colors",
                isSelected
                  ? "bg-bw-primary text-white font-semibold"
                  : isToday
                    ? "bg-[var(--color-bw-surface-dim)] font-semibold text-bw-heading"
                    : "text-bw-text hover:bg-[var(--color-bw-surface-dim)]"
              )}
            >
              {date.getDate()}
              {hasSession && !isSelected && (
                <span className="absolute bottom-[3px] left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-bw-primary ring-2 ring-bw-primary/20" />
              )}
            </button>
          );
        })}
      </div>
    </GlassCardV2>
  );
}
