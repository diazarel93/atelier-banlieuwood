"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useCockpitData, useCockpitActions } from "@/components/pilot/cockpit-context";

const TAGS = [
  { id: "obs", label: "Observation", color: "var(--color-bw-primary)" },
  { id: "rev", label: "A revoir", color: "var(--color-bw-danger)" },
  { id: "idee", label: "Idee", color: "var(--color-bw-green)" },
] as const;

export function SessionNotesPanel() {
  const { session } = useCockpitData();
  const { updateSession } = useCockpitActions();
  const sess = (session as unknown as Record<string, unknown>) ?? {};
  const [notes, setNotes] = useState((sess.teacher_notes as string) || "");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync from session on first load
  useEffect(() => {
    if (sess.teacher_notes && !notes) setNotes(sess.teacher_notes as string);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveNotes = useCallback(
    (text: string) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        updateSession.mutate({ teacher_notes: text });
      }, 1500);
    },
    [updateSession],
  );

  const handleChange = useCallback(
    (text: string) => {
      setNotes(text);
      saveNotes(text);
    },
    [saveNotes],
  );

  const insertTimestamp = useCallback(() => {
    const openedAt = sess.question_opened_at as string | null;
    const elapsed = openedAt ? Math.floor((Date.now() - new Date(openedAt).getTime()) / 1000) : 0;
    const mm = Math.floor(elapsed / 60);
    const ss = String(elapsed % 60).padStart(2, "0");
    handleChange(notes + `\n[${mm}:${ss}] `);
  }, [notes, sess.question_opened_at, handleChange]);

  const insertTag = useCallback(
    (label: string) => {
      handleChange(notes + `\n[${label}] `);
    },
    [notes, handleChange],
  );

  return (
    <div className="flex flex-col gap-2 p-3">
      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={insertTimestamp}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold bg-[var(--color-bw-surface-dim)] text-bw-muted hover:text-bw-heading transition-colors cursor-pointer border border-[var(--color-bw-cockpit-border)]"
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
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          Horodater
        </button>
        {TAGS.map((tag) => (
          <button
            key={tag.id}
            onClick={() => insertTag(tag.label)}
            className="px-2 py-1 rounded-md text-[10px] font-semibold cursor-pointer transition-colors border"
            style={{
              background: `${tag.color}10`,
              borderColor: `${tag.color}33`,
              color: tag.color,
            }}
          >
            {tag.label}
          </button>
        ))}
      </div>
      <textarea
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Notes de session (sauvegarde auto)..."
        className="w-full min-h-[200px] p-3 rounded-xl border border-[var(--color-bw-cockpit-border)] bg-[var(--color-bw-surface-dim)] text-bw-heading text-xs font-mono leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-bw-primary/30 placeholder:text-bw-muted/50"
      />
      <p className="text-[9px] text-bw-muted text-right">Sauvegarde automatique</p>
    </div>
  );
}
