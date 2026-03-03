import { NextResponse } from "next/server";
import { listCharacters } from "@/lib/storage/character-store";
import { listRelationships } from "@/lib/storage/relationship-store";
import {
  listTableReads,
  listScenes,
  listConflicts,
} from "@/lib/storage/workshop-store";
import { generateText } from "@/lib/ai/claude-provider";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const [characters, relationships, tableReads, scenes, conflicts] =
      await Promise.all([
        listCharacters(slug),
        listRelationships(slug),
        listTableReads(slug),
        listScenes(slug),
        listConflicts(slug),
      ]);

    if (characters.length === 0) {
      return NextResponse.json({
        issues: [],
        summary: "Aucun personnage defini. Commencez par creer des personnages dans la Bible.",
      });
    }

    // Build context summary for AI
    const charSummary = characters
      .map(
        (c) =>
          `- ${c.name} (${c.role || "?"}): faille=${c.psychology.flaw || "?"}, objectif=${c.psychology.goal || "?"}, peur=${c.psychology.fear || "?"}`
      )
      .join("\n");

    const relSummary = relationships
      .map((r) => {
        const a = characters.find((c) => c.id === r.characterA)?.name || "?";
        const b = characters.find((c) => c.id === r.characterB)?.name || "?";
        return `- ${a} <-> ${b}: ${r.type}, tension=${r.tension}/10, confiance=${r.trust}/10`;
      })
      .join("\n");

    const workshopSummary = [
      ...tableReads
        .filter((tr) => tr.rawText)
        .slice(0, 3)
        .map(
          (tr) =>
            `Table Read "${tr.title}": ${tr.rawText.slice(0, 300)}...`
        ),
      ...scenes
        .filter((s) => s.rawText)
        .slice(0, 3)
        .map(
          (s) =>
            `Scene "${s.title}": ${s.rawText.slice(0, 300)}...`
        ),
      ...conflicts
        .filter((c) => c.phases?.length > 0)
        .slice(0, 3)
        .map(
          (c) =>
            `Conflit "${c.title}": ${c.phases.map((p) => p.title).join(" -> ")}`
        ),
    ].join("\n\n");

    const systemPrompt = `Tu es un script doctor expert. Tu analyses la coherence d'un projet de scenario. Reponds en JSON.`;

    const userPrompt = `Analyse la coherence de ce projet :

PERSONNAGES :
${charSummary}

RELATIONS :
${relSummary || "Aucune relation definie"}

CONTENU GENERE :
${workshopSummary || "Aucun contenu genere dans le workshop"}

Identifie les problemes de coherence. Reponds en JSON :
{
  "issues": [
    {
      "type": "contradiction|gap|weakness|opportunity",
      "severity": "high|medium|low",
      "title": "Titre court du probleme",
      "description": "Description detaillee",
      "characters": ["Noms des personnages concernes"],
      "suggestion": "Suggestion pour resoudre"
    }
  ],
  "strengths": ["Points forts du projet"],
  "summary": "Resume en 2-3 phrases de l'etat du projet"
}

Sois precis et actionnable. Maximum 8 issues. Reponds UNIQUEMENT avec le JSON.`;

    const result = await generateText(systemPrompt, userPrompt, {
      maxTokens: 4096,
      temperature: 0.7,
    });

    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json(parsed);
      }
    } catch {
      // fallback
    }

    return NextResponse.json({
      issues: [],
      strengths: [],
      summary: result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Analysis failed",
      },
      { status: 500 }
    );
  }
}
