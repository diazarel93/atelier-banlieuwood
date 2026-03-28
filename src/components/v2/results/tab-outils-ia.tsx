"use client";

import { useCallback } from "react";
import type { BilanData, FicheData, BibleData } from "@/hooks/use-results-data";
import { BilanIaSection } from "./bilan-ia-section";
import { FicheCoursSection } from "./fiche-cours-section";
import { BibleFilmSection } from "./bible-film-section";

interface TabOutilsIaProps {
  bilan: BilanData | null;
  bilanLoading: boolean;
  bilanProvider: string | null;
  generateBilan: () => void;

  fiche: FicheData | null;
  ficheLoading: boolean;
  ficheProvider: string | null;
  generateFiche: () => void;

  bible: BibleData | null;
  bibleLoading: boolean;
  bibleProvider: string | null;
  generateBible: (force?: boolean) => void;
}

function bilanToMarkdown(b: BilanData): string {
  return [
    "# Bilan de Session IA",
    "",
    "## Résumé narratif",
    b.narrativeSummary,
    "",
    "## Dynamique de groupe",
    b.groupDynamics.summary,
    `**Collaboration :** ${b.groupDynamics.collaborationLevel}`,
    `**Influenceurs :** ${b.groupDynamics.influencers.join(", ")}`,
    "",
    "## Moments clés",
    ...b.keyMoments.map((m) => `- [${m.category}] ${m.description}`),
    "",
    "## Engagement",
    b.engagement.summary,
    `**Tendance :** ${b.engagement.participationTrend} | **Profondeur :** ${b.engagement.depth}`,
    "",
    "## Recommandations pédagogiques",
    ...b.pedagogicalRecommendations.map((r, i) => `${i + 1}. ${r}`),
  ].join("\n");
}

function ficheToMarkdown(f: FicheData): string {
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
    ...f.evaluation.map(
      (e) => `- ${typeof e === "string" ? e : Object.values(e as Record<string, string>).join(" — ")}`,
    ),
  ];
  if (f.sessionRecap) {
    lines.push("", "## Résumé de session", f.sessionRecap);
  }
  return lines.join("\n");
}

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function TabOutilsIa({
  bilan,
  bilanLoading,
  bilanProvider,
  generateBilan,
  fiche,
  ficheLoading,
  ficheProvider,
  generateFiche,
  bible,
  bibleLoading,
  bibleProvider,
  generateBible,
}: TabOutilsIaProps) {
  const handleDownloadBilan = useCallback(() => {
    if (bilan) downloadFile(bilanToMarkdown(bilan), "bilan-session.md");
  }, [bilan]);

  const handleDownloadFiche = useCallback(() => {
    if (fiche) downloadFile(ficheToMarkdown(fiche), "fiche-de-cours.md");
  }, [fiche]);

  return (
    <div className="space-y-10">
      <BilanIaSection
        bilan={bilan}
        loading={bilanLoading}
        provider={bilanProvider}
        onGenerate={generateBilan}
        onDownload={handleDownloadBilan}
      />
      <FicheCoursSection
        fiche={fiche}
        loading={ficheLoading}
        provider={ficheProvider}
        onGenerate={generateFiche}
        onDownload={handleDownloadFiche}
      />
      <BibleFilmSection bible={bible} loading={bibleLoading} provider={bibleProvider} onGenerate={generateBible} />
    </div>
  );
}
