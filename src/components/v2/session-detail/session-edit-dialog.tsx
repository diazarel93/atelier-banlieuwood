"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import type { SessionEditPayload } from "@/hooks/use-session-detail";

const LEVEL_OPTIONS = [
  { value: "primaire", label: "Primaire" },
  { value: "college", label: "College" },
  { value: "lycee", label: "Lycee" },
] as const;

interface SessionEditDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (payload: SessionEditPayload) => void;
  isPending: boolean;
  initial: {
    title: string;
    class_label: string | null;
    level: string;
    scheduled_at: string | null;
    thematique: string | null;
  };
}

export function SessionEditDialog({
  open,
  onClose,
  onSave,
  isPending,
  initial,
}: SessionEditDialogProps) {
  const [title, setTitle] = useState(initial.title);
  const [classLabel, setClassLabel] = useState(initial.class_label || "");
  const [level, setLevel] = useState(initial.level);
  const [scheduledAt, setScheduledAt] = useState(
    initial.scheduled_at ? initial.scheduled_at.slice(0, 10) : ""
  );
  const [thematique, setThematique] = useState(initial.thematique || "");

  // Reset form when dialog opens with new initial values
  useEffect(() => {
    if (open) {
      setTitle(initial.title);
      setClassLabel(initial.class_label || "");
      setLevel(initial.level);
      setScheduledAt(
        initial.scheduled_at ? initial.scheduled_at.slice(0, 10) : ""
      );
      setThematique(initial.thematique || "");
    }
  }, [open, initial]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const payload: SessionEditPayload = {
      title: title.trim(),
      class_label: classLabel.trim() || null,
      level,
      scheduled_at: scheduledAt
        ? new Date(scheduledAt).toISOString()
        : null,
      thematique: thematique.trim() || null,
    };
    onSave(payload);
  }

  const inputClasses =
    "w-full h-10 rounded-lg border border-[var(--color-bw-border)] bg-card px-3 text-sm text-bw-heading placeholder:text-bw-placeholder focus:outline-none focus:ring-2 focus:ring-bw-primary/30 focus:border-bw-primary transition-colors";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Modifier la seance"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-md rounded-2xl bg-card border border-[var(--color-bw-border)] p-6 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-bw-heading mb-5">
              Modifier la seance
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label
                  htmlFor="edit-title"
                  className="block text-xs font-medium text-bw-muted mb-1.5"
                >
                  Titre
                </label>
                <input
                  id="edit-title"
                  type="text"
                  maxLength={100}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClasses}
                  required
                />
                <p className="text-[10px] text-bw-muted mt-1 text-right">
                  {title.length}/100
                </p>
              </div>

              {/* Class label */}
              <div>
                <label
                  htmlFor="edit-class"
                  className="block text-xs font-medium text-bw-muted mb-1.5"
                >
                  Classe
                </label>
                <input
                  id="edit-class"
                  type="text"
                  maxLength={50}
                  value={classLabel}
                  onChange={(e) => setClassLabel(e.target.value)}
                  placeholder="ex: 4eB, CM2 Voltaire..."
                  className={inputClasses}
                />
              </div>

              {/* Level */}
              <div>
                <label
                  htmlFor="edit-level"
                  className="block text-xs font-medium text-bw-muted mb-1.5"
                >
                  Niveau
                </label>
                <select
                  id="edit-level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className={inputClasses}
                >
                  {LEVEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label
                  htmlFor="edit-date"
                  className="block text-xs font-medium text-bw-muted mb-1.5"
                >
                  Date prevue
                </label>
                <input
                  id="edit-date"
                  type="date"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className={inputClasses}
                />
              </div>

              {/* Thematique */}
              <div>
                <label
                  htmlFor="edit-thematique"
                  className="block text-xs font-medium text-bw-muted mb-1.5"
                >
                  Thematique
                </label>
                <input
                  id="edit-thematique"
                  type="text"
                  maxLength={200}
                  value={thematique}
                  onChange={(e) => setThematique(e.target.value)}
                  placeholder="ex: L'univers du cinema fantastique..."
                  className={inputClasses}
                />
                <p className="text-[10px] text-bw-muted mt-1 text-right">
                  {thematique.length}/200
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={isPending}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isPending || !title.trim()}>
                  {isPending ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
