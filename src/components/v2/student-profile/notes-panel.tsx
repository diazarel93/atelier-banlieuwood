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
  { value: "observation", label: "Observation", color: "#6366F1" },
  { value: "strength", label: "Point fort", color: "#10B981" },
  { value: "concern", label: "Préoccupation", color: "#EF4444" },
  { value: "goal", label: "Objectif", color: "#F59E0B" },
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
    <GlassCardV2 className="p-4">
      <h3 className="text-xs font-semibold text-bw-heading uppercase tracking-wide mb-3">
        Notes
      </h3>

      {/* Add form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2 mb-2">
          <select
            value={noteType}
            onChange={(e) => setNoteType(e.target.value)}
            className="rounded-lg border border-[var(--color-bw-border)] bg-white px-2 py-1.5 text-xs text-bw-heading focus:outline-none focus:ring-2 focus:ring-bw-primary/30"
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
            className="flex-1 rounded-lg border border-[var(--color-bw-border)] bg-white px-3 py-1.5 text-sm text-bw-heading placeholder:text-bw-muted focus:outline-none focus:ring-2 focus:ring-bw-primary/30"
          />
          <button
            type="submit"
            disabled={!content.trim() || isAdding}
            className="rounded-lg bg-bw-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-bw-primary-500 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isAdding ? "..." : "Ajouter"}
          </button>
        </div>
      </form>

      {/* Notes list */}
      {notes.length === 0 ? (
        <p className="text-sm text-bw-muted text-center py-2">
          Aucune note
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {notes.map((note) => {
            const info = noteTypeInfo(note.note_type);
            return (
              <div
                key={note.id}
                className="flex items-start gap-2 rounded-lg border border-[var(--color-bw-border-subtle)] p-2.5"
              >
                <div
                  className="mt-0.5 h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: info.color }}
                  title={info.label}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-bw-heading">{note.content}</p>
                  <p className="text-[10px] text-bw-muted mt-0.5">
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
                  className="text-bw-muted hover:text-red-500 transition-colors shrink-0 cursor-pointer"
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
