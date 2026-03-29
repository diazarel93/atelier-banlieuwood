"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { BreadcrumbV2 } from "@/components/v2/breadcrumb";
import { LevelSelector } from "@/components/v2/fiche-cours/level-selector";
import { FicheCoursSection } from "@/components/v2/results/fiche-cours-section";
import type { FicheData } from "@/hooks/use-results-data";

export default function FicheCoursPageV2() {
  const [level, setLevel] = useState("college");
  const [fiche, setFiche] = useState<FicheData | null>(null);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setFiche(null);
    try {
      const res = await fetch("/api/fiche-cours/generic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur");
      }
      const data = await res.json();
      setFiche(data.fiche);
      setProvider(data.provider);
      toast.success("Fiche générée !");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, [level]);

  function downloadMarkdown(f: FicheData) {
    const lines = [
      `# ${f.title}`,
      "",
      `**Durée :** ${f.duration}`,
      "",
      "## Objectifs",
      ...f.objectives.map((o) => `- [${o.socleCommun}] ${o.objective}`),
      "",
      "## Compétences",
      "",
      `### ${f.competencies.domaine1.title}`,
      ...f.competencies.domaine1.skills.map((s) => `- ${s}`),
      "",
      `### ${f.competencies.domaine3.title}`,
      ...f.competencies.domaine3.skills.map((s) => `- ${s}`),
      "",
      `### ${f.competencies.domaine5.title}`,
      ...f.competencies.domaine5.skills.map((s) => `- ${s}`),
      "",
      "## Conseils d'animation",
      ...f.animationTips.map((t) => `- **${t.phase}** (${t.timing}) : ${t.tip}`),
      "",
      "## Relance",
      ...f.relaunchTips.map((t) => `- ${t}`),
      "",
      "## Adaptation par niveau",
      `- **Primaire :** ${f.adaptationByLevel.primaire}`,
      `- **Collège :** ${f.adaptationByLevel.college}`,
      `- **Lycée :** ${f.adaptationByLevel.lycee}`,
      "",
      "## Évaluation",
      ...f.evaluation.map((e) =>
        typeof e === "string" ? `- ${e}` : `- ${Object.values(e as Record<string, string>).join(" — ")}`,
      ),
    ];
    const md = lines.join("\n");
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fiche-cours-${level}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 pt-16 lg:pt-8 pb-8">
      <BreadcrumbV2 items={[{ label: "Fiche de cours" }]} />

      <div className="max-w-2xl mx-auto mt-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-heading-xl text-bw-heading">Fiche de Cours</h1>
          <p className="text-sm text-bw-muted">Générez une fiche pédagogique adaptée au niveau de vos élèves</p>
        </div>

        {/* Level selector + generate button */}
        <LevelSelector level={level} onLevelChange={setLevel} onGenerate={handleGenerate} loading={loading} />

        {/* Loading spinner */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-8">
            <div className="w-5 h-5 border-2 border-bw-violet border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-bw-muted">L&apos;IA prépare la fiche pédagogique...</span>
          </div>
        )}

        {/* Fiche content — reuse V2 results component */}
        {fiche && !loading && (
          <FicheCoursSection
            fiche={fiche}
            loading={false}
            provider={provider}
            onGenerate={handleGenerate}
            onDownload={() => downloadMarkdown(fiche)}
          />
        )}
      </div>
    </div>
  );
}
