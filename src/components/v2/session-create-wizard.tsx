"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import { GlassCardV2 } from "./glass-card";
import { DatePicker } from "./date-picker";
import { toast } from "sonner";

interface WizardData {
  title: string;
  classLabel: string;
  level: "primaire" | "college" | "lycee";
  scheduledAt: string;
  template: string;
  thematique: string;
  repeat: boolean;
  repeatFrequency: "weekly" | "biweekly";
  repeatCount: number;
}

const LEVELS = [
  { value: "primaire", label: "Primaire" },
  { value: "college", label: "Collège" },
  { value: "lycee", label: "Lycée" },
] as const;

const TEMPLATES = [
  { value: "", label: "Aucun" },
  { value: "horreur", label: "Horreur" },
  { value: "comedie", label: "Comédie" },
  { value: "action", label: "Action" },
  { value: "romance", label: "Romance" },
  { value: "drame", label: "Drame" },
  { value: "sci-fi", label: "Sci-Fi" },
  { value: "policier", label: "Policier" },
  { value: "fantastique", label: "Fantastique" },
];

export function SessionCreateWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [classLabels, setClassLabels] = useState<string[]>([]);
  const [data, setData] = useState<WizardData>({
    title: "",
    classLabel: "",
    level: "college",
    scheduledAt: "",
    template: "",
    thematique: "",
    repeat: false,
    repeatFrequency: "weekly",
    repeatCount: 4,
  });

  // Pre-fill thematique from ?module= query param (from library CTA)
  useEffect(() => {
    const moduleParam = searchParams.get("module");
    if (moduleParam) {
      update({ thematique: moduleParam });
    }
  }, [searchParams]);

  // Fetch distinct class labels for autocomplete
  useEffect(() => {
    fetch("/api/sessions/class-labels")
      .then((res) => (res.ok ? res.json() : { labels: [] }))
      .then((json) => setClassLabels(json.labels || []))
      .catch(() => {});
  }, []);

  const update = (partial: Partial<WizardData>) =>
    setData((d) => ({ ...d, ...partial }));

  // Validation (#20)
  const titleError = data.title.trim().length > 0 && data.title.trim().length > 100
    ? "100 caractères maximum"
    : undefined;
  const classLabelError = data.classLabel.length > 50
    ? "50 caractères maximum"
    : undefined;
  const thematiqueError = data.thematique.length > 200
    ? "200 caractères maximum"
    : undefined;
  const scheduledAtError = (() => {
    if (!data.scheduledAt) return undefined;
    const scheduled = new Date(data.scheduledAt).getTime();
    const tolerance = Date.now() - 5 * 60 * 1000; // 5 min tolerance
    if (scheduled < tolerance) return "La date ne peut pas être dans le passé";
    return undefined;
  })();
  const hasErrors = !!titleError || !!classLabelError || !!thematiqueError || !!scheduledAtError;

  const canProceed = step === 0
    ? data.title.trim().length > 0 && !hasErrors
    : !hasErrors;

  async function handleCreate() {
    setSaving(true);
    try {
      const count =
        data.repeat && data.scheduledAt ? data.repeatCount : 1;
      const dayIncrement =
        data.repeatFrequency === "biweekly" ? 14 : 7;
      let firstSessionId: string | null = null;

      for (let i = 0; i < count; i++) {
        let scheduledAt = data.scheduledAt || null;
        if (scheduledAt && i > 0) {
          const d = new Date(scheduledAt);
          d.setDate(d.getDate() + i * dayIncrement);
          scheduledAt = d.toISOString();
        }

        const sessionTitle =
          count > 1
            ? `${data.title.trim()} (${i + 1}/${count})`
            : data.title.trim();

        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: sessionTitle,
            level: data.level,
            template: data.template || null,
            thematique: data.thematique || null,
            scheduled_at: scheduledAt,
            class_label: data.classLabel || null,
          }),
        });
        if (!res.ok) throw new Error("Erreur creation");
        const session = await res.json();
        if (i === 0) firstSessionId = session.id;
      }

      if (count > 1) {
        toast.success(`${count} seances creees !`);
        router.push(ROUTES.seances);
      } else {
        toast.success("Seance creee !");
        router.push(ROUTES.seancePrepare(firstSessionId!));
      }
    } catch {
      toast.error("Erreur lors de la creation de la seance");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {["Infos", "Options", "Confirmer"].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                i <= step
                  ? "bg-bw-primary text-white"
                  : "bg-[var(--color-bw-surface-dim)] text-bw-muted"
              )}
            >
              {i + 1}
            </div>
            <span
              className={cn(
                "text-xs font-medium",
                i <= step ? "text-bw-heading" : "text-bw-muted"
              )}
            >
              {label}
            </span>
            {i < 2 && (
              <div
                className={cn(
                  "h-0.5 w-8 rounded-full",
                  i < step ? "bg-bw-primary" : "bg-[var(--color-bw-border-subtle)]"
                )}
              />
            )}
          </div>
        ))}
      </div>

      <GlassCardV2 className="p-6 overflow-hidden">
        <AnimatePresence mode="wait">
        {/* Step 0: Basic info */}
        {step === 0 && (
          <motion.div
            key="step-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            <h2 className="text-lg font-bold text-bw-heading">
              Créer une séance
            </h2>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="wizard-title" className="text-xs font-medium text-bw-muted">
                Titre de la séance
              </label>
              <input
                id="wizard-title"
                type="text"
                value={data.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="Ex: Séance 3 - Imagination"
                enterKeyHint="next"
                maxLength={100}
                className={cn(
                  "h-10 rounded-lg border bg-card px-3 text-sm text-bw-heading placeholder:text-bw-placeholder focus:outline-none focus:ring-2 focus:ring-bw-primary/30 focus:border-bw-primary transition-colors",
                  titleError ? "border-red-400" : "border-[var(--color-bw-border)]"
                )}
                autoFocus
              />
              {titleError && <span className="text-xs text-red-500">{titleError}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="wizard-class" className="text-xs font-medium text-bw-muted">
                Classe
              </label>
              <input
                id="wizard-class"
                type="text"
                list="class-label-options"
                value={data.classLabel}
                onChange={(e) => update({ classLabel: e.target.value })}
                placeholder="Ex: 4ème B"
                enterKeyHint="next"
                maxLength={50}
                autoComplete="off"
                className={cn(
                  "h-10 rounded-lg border bg-card px-3 text-sm text-bw-heading placeholder:text-bw-placeholder focus:outline-none focus:ring-2 focus:ring-bw-primary/30 focus:border-bw-primary transition-colors",
                  classLabelError ? "border-red-400" : "border-[var(--color-bw-border)]"
                )}
              />
              {classLabels.length > 0 && (
                <datalist id="class-label-options">
                  {classLabels.map((label) => (
                    <option key={label} value={label} />
                  ))}
                </datalist>
              )}
              {classLabelError && <span className="text-xs text-red-500">{classLabelError}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-bw-muted">
                Niveau
              </label>
              <div className="flex gap-2">
                {LEVELS.map((l) => (
                  <button
                    key={l.value}
                    type="button"
                    onClick={() => update({ level: l.value })}
                    className={cn(
                      "flex-1 rounded-lg border py-2 text-sm font-medium transition-colors",
                      data.level === l.value
                        ? "border-bw-primary bg-bw-primary/5 text-bw-primary"
                        : "border-[var(--color-bw-border)] text-bw-muted hover:text-bw-heading"
                    )}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <DatePicker
                label="Date et heure"
                value={data.scheduledAt}
                onChange={(v) => update({ scheduledAt: v })}
              />
              {scheduledAtError && <span className="text-xs text-red-500">{scheduledAtError}</span>}
            </div>

            {/* Repeat toggle — only shown when a date is set */}
            {data.scheduledAt && (
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={data.repeat}
                    onClick={() => update({ repeat: !data.repeat })}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
                      data.repeat
                        ? "bg-bw-primary"
                        : "bg-[var(--color-bw-surface-dim)] border border-[var(--color-bw-border)]"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform",
                        data.repeat ? "translate-x-[18px]" : "translate-x-[3px]"
                      )}
                    />
                  </button>
                  <span className="text-xs font-medium text-bw-heading">
                    Repeter
                  </span>
                </label>

                {data.repeat && (
                  <div className="flex flex-col gap-2 pl-0.5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-bw-muted">
                        Frequence
                      </label>
                      <div className="flex gap-2">
                        {([
                          { value: "weekly", label: "Chaque semaine" },
                          { value: "biweekly", label: "Toutes les 2 semaines" },
                        ] as const).map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() =>
                              update({ repeatFrequency: opt.value })
                            }
                            className={cn(
                              "flex-1 rounded-lg border py-2 text-xs font-medium transition-colors",
                              data.repeatFrequency === opt.value
                                ? "border-bw-primary bg-bw-primary/5 text-bw-primary"
                                : "border-[var(--color-bw-border)] text-bw-muted hover:text-bw-heading"
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="wizard-repeat-count"
                        className="text-xs font-medium text-bw-muted"
                      >
                        Nombre de seances
                      </label>
                      <select
                        id="wizard-repeat-count"
                        value={data.repeatCount}
                        onChange={(e) =>
                          update({ repeatCount: parseInt(e.target.value) })
                        }
                        className="h-10 rounded-lg border border-[var(--color-bw-border)] bg-card px-3 text-sm text-bw-heading focus:outline-none focus:ring-2 focus:ring-bw-primary/30 focus:border-bw-primary transition-colors"
                      >
                        {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                          <option key={n} value={n}>
                            {n} seances
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Step 1: Options */}
        {step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            <h2 className="text-lg font-bold text-bw-heading">
              Options
            </h2>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-bw-muted">
                Template de genre
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => update({ template: t.value })}
                    className={cn(
                      "rounded-lg border py-2 text-xs font-medium transition-colors",
                      data.template === t.value
                        ? "border-bw-primary bg-bw-primary/5 text-bw-primary"
                        : "border-[var(--color-bw-border)] text-bw-muted hover:text-bw-heading"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="wizard-thematique" className="text-xs font-medium text-bw-muted">
                Thématique libre
              </label>
              <input
                id="wizard-thematique"
                type="text"
                value={data.thematique}
                onChange={(e) => update({ thematique: e.target.value })}
                placeholder="Ex: Le quartier, Les rêves..."
                enterKeyHint="next"
                maxLength={200}
                className={cn(
                  "h-10 rounded-lg border bg-card px-3 text-sm text-bw-heading placeholder:text-bw-placeholder focus:outline-none focus:ring-2 focus:ring-bw-primary/30 focus:border-bw-primary transition-colors",
                  thematiqueError ? "border-red-400" : "border-[var(--color-bw-border)]"
                )}
              />
              {thematiqueError && <span className="text-xs text-red-500">{thematiqueError}</span>}
            </div>
          </motion.div>
        )}

        {/* Step 2: Confirm */}
        {step === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            <h2 className="text-lg font-bold text-bw-heading">
              Récapitulatif
            </h2>
            <div className="flex flex-col gap-2 text-sm">
              <Row label="Titre" value={data.title} />
              <Row label="Classe" value={data.classLabel || "—"} />
              <Row
                label="Niveau"
                value={LEVELS.find((l) => l.value === data.level)?.label || data.level}
              />
              <Row
                label="Date"
                value={
                  data.scheduledAt
                    ? new Date(data.scheduledAt).toLocaleString("fr-FR")
                    : "Non planifiée"
                }
              />
              <Row
                label="Template"
                value={TEMPLATES.find((t) => t.value === data.template)?.label || "Aucun"}
              />
              {data.thematique && <Row label="Thematique" value={data.thematique} />}
              {data.repeat && data.scheduledAt && (
                <>
                  <Row
                    label="Repetition"
                    value={
                      data.repeatFrequency === "biweekly"
                        ? "Toutes les 2 semaines"
                        : "Chaque semaine"
                    }
                  />
                  <Row
                    label="Nombre de seances"
                    value={String(data.repeatCount)}
                  />
                </>
              )}
            </div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--color-bw-border-subtle)]">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="rounded-lg border border-[var(--color-bw-border)] px-4 py-2 text-sm font-medium text-bw-muted hover:text-bw-heading transition-colors"
            >
              Retour
            </button>
          ) : (
            <Link
              href={ROUTES.seances}
              className="rounded-lg border border-[var(--color-bw-border)] px-4 py-2 text-sm font-medium text-bw-muted hover:text-bw-heading transition-colors"
            >
              Annuler
            </Link>
          )}

          {step < 2 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed}
              className="rounded-lg bg-bw-primary px-4 py-2 text-sm font-semibold text-white hover:bg-bw-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Suivant
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCreate}
              disabled={saving}
              className="rounded-lg bg-bw-primary px-4 py-2 text-sm font-semibold text-white hover:bg-bw-primary-500 disabled:opacity-50 transition-colors btn-glow"
            >
              {saving
                ? "Creation..."
                : data.repeat && data.scheduledAt
                  ? `Creer ${data.repeatCount} seances`
                  : "Creer la seance"}
            </button>
          )}
        </div>
      </GlassCardV2>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[var(--color-bw-border-subtle)] last:border-0">
      <span className="text-bw-muted">{label}</span>
      <span className="font-medium text-bw-heading">{value}</span>
    </div>
  );
}
