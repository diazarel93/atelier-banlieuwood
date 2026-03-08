"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
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
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<WizardData>({
    title: "",
    classLabel: "",
    level: "college",
    scheduledAt: "",
    template: "",
    thematique: "",
  });

  const update = (partial: Partial<WizardData>) =>
    setData((d) => ({ ...d, ...partial }));

  const canProceed = step === 0
    ? data.title.trim().length > 0
    : true;

  async function handleCreate() {
    setSaving(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title.trim(),
          level: data.level,
          template: data.template || null,
          thematique: data.thematique || null,
          scheduled_at: data.scheduledAt || null,
          class_label: data.classLabel || null,
        }),
      });
      if (!res.ok) throw new Error("Erreur création");
      const session = await res.json();
      toast.success("Séance créée !");
      router.push(`/v2/seances/${session.id}/prepare`);
    } catch {
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

      <GlassCardV2 className="p-6">
        {/* Step 0: Basic info */}
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-bw-heading">
              Créer une séance
            </h2>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-bw-muted">
                Titre de la séance
              </label>
              <input
                type="text"
                value={data.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="Ex: Séance 3 - Imagination"
                className="h-10 rounded-lg border border-[var(--color-bw-border)] bg-white px-3 text-sm text-bw-heading placeholder:text-bw-placeholder focus:outline-none focus:ring-2 focus:ring-bw-primary/30 focus:border-bw-primary transition-colors"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-bw-muted">
                Classe
              </label>
              <input
                type="text"
                value={data.classLabel}
                onChange={(e) => update({ classLabel: e.target.value })}
                placeholder="Ex: 4ème B"
                className="h-10 rounded-lg border border-[var(--color-bw-border)] bg-white px-3 text-sm text-bw-heading placeholder:text-bw-placeholder focus:outline-none focus:ring-2 focus:ring-bw-primary/30 focus:border-bw-primary transition-colors"
              />
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
            <DatePicker
              label="Date et heure"
              value={data.scheduledAt}
              onChange={(v) => update({ scheduledAt: v })}
            />
          </div>
        )}

        {/* Step 1: Options */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
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
              <label className="text-xs font-medium text-bw-muted">
                Thématique libre
              </label>
              <input
                type="text"
                value={data.thematique}
                onChange={(e) => update({ thematique: e.target.value })}
                placeholder="Ex: Le quartier, Les rêves..."
                className="h-10 rounded-lg border border-[var(--color-bw-border)] bg-white px-3 text-sm text-bw-heading placeholder:text-bw-placeholder focus:outline-none focus:ring-2 focus:ring-bw-primary/30 focus:border-bw-primary transition-colors"
              />
            </div>
          </div>
        )}

        {/* Step 2: Confirm */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
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
              {data.thematique && <Row label="Thématique" value={data.thematique} />}
            </div>
          </div>
        )}

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
              href="/v2/seances"
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
              {saving ? "Création..." : "Créer la séance"}
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
