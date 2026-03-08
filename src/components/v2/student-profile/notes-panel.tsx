"use client";

import { useState } from "react";
import { GlassCardV2 } from "../glass-card";

interface TeacherNote {
  id: string;
  note_type: string;
  content: string;
  created_at: string;
}

interface NotesPanelProps {
  notes: TeacherNote[];
  onAdd: (noteType: string, content: string) => void;
  onDelete: (noteId: string) => void;
  isAdding?: boolean;
}

const NOTE_TYPES = [
  { value: "observation", label: "Observation", color: "var(--color-bw-violet)" },
  { value: "strength", label: "Point fort", color: "var(--color-bw-green)" },
  { value: "concern", label: "Préoccupation", color: "var(--color-bw-danger)" },
  { value: "goal", label: "Objectif", color: "var(--color-bw-amber)" },
] as const;

function noteTypeInfo(type: string) {
  return NOTE_TYPES.find((t) => t.value === type) || NOTE_TYPES[0];
}

export function NotesPanel({ notes, onAdd, onDelete, isAdding }: NotesPanelProps) {
  const [noteType, setNoteType] = useState("observation");
  const [content, setContent] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    onAdd(noteType, content.trim());
    setContent("");
  }

  return (
    <GlassCardV2 className="p-5">
      <h3 className="label-caps mb-3">Notes</h3>

      {/* Add form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2 mb-2">
          <select
            value={noteType}
            onChange={(e) => setNoteType(e.target.value)}
            className="rounded-lg border border-[var(--color-bw-border)] bg-white px-2.5 py-1.5 text-body-xs font-medium text-bw-heading focus:outline-none focus:ring-2 focus:ring-bw-primary/30 focus:border-bw-primary transition-colors"
          >
            {NOTE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ajouter une note..."
            className="flex-1 h-9 rounded-lg border border-[var(--color-bw-border)] bg-white px-3 text-sm text-bw-heading placeholder:text-bw-placeholder focus:outline-none focus:ring-2 focus:ring-bw-primary/30 focus:border-bw-primary transition-colors"
          />
          <button
            type="submit"
            disabled={!content.trim() || isAdding}
            className="rounded-lg bg-bw-primary px-3.5 py-1.5 text-body-xs font-semibold text-white hover:bg-bw-primary-500 active:scale-[0.97] transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            {isAdding ? "..." : "Ajouter"}
          </button>
        </div>
      </form>

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="flex flex-col items-center py-4 text-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-bw-muted mb-2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <p className="text-body-xs text-bw-muted">Aucune note pour le moment</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notes.map((note) => {
            const info = noteTypeInfo(note.note_type);
            return (
              <div
                key={note.id}
                className="flex items-start gap-2.5 rounded-xl p-2.5 hover:bg-bw-primary/[0.025] transition-colors duration-100"
              >
                <div
                  className="mt-1.5 h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: info.color }}
                  title={info.label}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-bw-heading leading-snug">{note.content}</p>
                  <p className="text-body-xs text-bw-muted mt-0.5">
                    {info.label} &middot;{" "}
                    {new Date(note.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(note.id)}
                  className="text-bw-muted hover:text-[var(--color-bw-danger)] transition-colors shrink-0 cursor-pointer p-1 rounded-md hover:bg-[var(--color-bw-danger-100)]"
                  title="Supprimer"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </GlassCardV2>
  );
}
