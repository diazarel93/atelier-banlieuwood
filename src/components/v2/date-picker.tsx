"use client";

import { cn } from "@/lib/utils";

interface DatePickerProps {
  value: string; // ISO date string or ""
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export function DatePicker({ value, onChange, label, className }: DatePickerProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-xs font-medium text-bw-muted">{label}</label>
      )}
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-lg border border-[var(--color-bw-border)] bg-white px-3 text-sm text-bw-heading focus:outline-none focus:ring-2 focus:ring-bw-primary/30 focus:border-bw-primary transition-colors"
      />
    </div>
  );
}
