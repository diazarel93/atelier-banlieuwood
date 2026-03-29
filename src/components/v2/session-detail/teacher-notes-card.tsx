"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { GlassCardV2 } from "@/components/v2/glass-card";

interface TeacherNotesCardProps {
  notes: string | null;
  onSave: (notes: string) => void;
  isSaving: boolean;
}

export function TeacherNotesCard({ notes, onSave, isSaving }: TeacherNotesCardProps) {
  const [open, setOpen] = useState(!!notes);
  const [value, setValue] = useState(notes || "");
  const [saved, setSaved] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef(notes || "");

  // Sync external notes changes
  useEffect(() => {
    setValue(notes || "");
    lastSavedRef.current = notes || "";
  }, [notes]);

  // Clear "saved" feedback after 2s
  useEffect(() => {
    if (saved) {
      const t = setTimeout(() => setSaved(false), 2000);
      return () => clearTimeout(t);
    }
  }, [saved]);

  const doSave = useCallback(
    (text: string) => {
      if (text === lastSavedRef.current) return;
      lastSavedRef.current = text;
      onSave(text);
      setSaved(true);
    },
    [onSave],
  );

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newValue = e.target.value;
    setValue(newValue);

    // Debounce 1s auto-save
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSave(newValue);
    }, 1000);
  }

  function handleBlur() {
    // Save immediately on blur
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    doSave(value);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <GlassCardV2 variant="flat" className="overflow-hidden">
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
            className="text-bw-muted"
          >
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span className="text-xs font-medium text-bw-muted">Notes enseignant</span>
        </span>
        <span className="flex items-center gap-2">
          {saved && (
            <span className="text-[10px] font-medium text-bw-teal animate-in fade-in duration-300">Enregistré</span>
          )}
          {isSaving && <span className="text-[10px] font-medium text-bw-muted">...</span>}
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden="true"
            className={`text-bw-muted transition-transform ${open ? "rotate-180" : ""}`}
          >
            <path d="M3 4.5l3 3 3-3" />
          </svg>
        </span>
      </button>

      {/* Body */}
      {open && (
        <div className="px-4 pb-4">
          <textarea
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Ajoutez vos notes sur cette seance..."
            rows={4}
            className="w-full rounded-lg border border-[var(--color-bw-border)] bg-[var(--color-bw-surface-dim)] px-3 py-2 text-sm text-bw-heading placeholder:text-bw-placeholder focus:outline-none focus:ring-2 focus:ring-bw-primary/30 focus:border-bw-primary transition-colors resize-y"
          />
        </div>
      )}
    </GlassCardV2>
  );
}
