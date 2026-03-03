import { NextResponse } from "next/server";
import { getProject } from "@/lib/storage/project-store";
import { listCharacters } from "@/lib/storage/character-store";
import { listRelationships } from "@/lib/storage/relationship-store";
import { listEpisodes } from "@/lib/storage/war-room-store";
import {
  listTableReads,
  listScenes,
  listScripts,
} from "@/lib/storage/workshop-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const [project, characters, relationships, episodes, tableReads, scenes, scripts] =
      await Promise.all([
        getProject(slug),
        listCharacters(slug),
        listRelationships(slug),
        listEpisodes(slug),
        listTableReads(slug),
        listScenes(slug),
        listScripts(slug),
      ]);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    let doc = `# ${project.title}\n`;
    doc += `Genre: ${project.genre || "Non defini"}\n`;
    doc += `Logline: ${project.logline || "Non definie"}\n\n`;

    // Characters
    doc += `---\n\n## BIBLE — PERSONNAGES\n\n`;
    for (const c of characters) {
      doc += `### ${c.name}\n`;
      doc += `Role: ${c.role || "?"} | Age: ${c.age || "?"} | Occupation: ${c.occupation || "?"}\n\n`;
      if (c.backstory) doc += `**Backstory:** ${c.backstory}\n\n`;
      const p = c.psychology;
      doc += `**Psychologie:**\n`;
      doc += `- Objectif: ${p.goal || "?"}\n`;
      doc += `- Besoin: ${p.need || "?"}\n`;
      doc += `- Faille: ${p.flaw || "?"}\n`;
      doc += `- Peur: ${p.fear || "?"}\n`;
      doc += `- Secret: ${p.secret || "?"}\n\n`;
      if (c.traits.length > 0) {
        doc += `**Traits:** ${c.traits.map((t) => `${t.name} (${t.intensity}/10)`).join(", ")}\n\n`;
      }
      const v = c.voice;
      doc += `**Voix:** Vocabulaire=${v.vocabulary || "?"}, Registre=${v.register || "?"}\n`;
      if (v.verbalTics?.length) doc += `Tics: ${v.verbalTics.join(", ")}\n`;
      if (v.examplePhrases?.length)
        doc += `Phrases: ${v.examplePhrases.join(" | ")}\n`;
      doc += `\n`;
    }

    // Relationships
    if (relationships.length > 0) {
      doc += `---\n\n## RELATIONS\n\n`;
      for (const r of relationships) {
        const a = characters.find((c) => c.id === r.characterA)?.name || "?";
        const b = characters.find((c) => c.id === r.characterB)?.name || "?";
        doc += `- ${a} <-> ${b}: ${r.type} (tension: ${r.tension}/10, confiance: ${r.trust}/10)\n`;
        if (r.notes) doc += `  Notes: ${r.notes}\n`;
      }
      doc += `\n`;
    }

    // Episodes
    if (episodes.length > 0) {
      doc += `---\n\n## EPISODES\n\n`;
      for (const ep of episodes) {
        doc += `### Episode ${ep.number}: ${ep.title}\n`;
        doc += `Status: ${ep.status}\n`;
        if (ep.synopsis) doc += `Synopsis: ${ep.synopsis}\n`;
        if (ep.notes) doc += `Notes: ${ep.notes}\n`;
        doc += `\n`;
      }
    }

    // Scenes
    const scenesWithText = scenes.filter((s) => s.rawText);
    if (scenesWithText.length > 0) {
      doc += `---\n\n## SCENES GENEREES\n\n`;
      for (const s of scenesWithText) {
        doc += `### ${s.title}\n`;
        doc += `Personnages: ${s.characterIds.map((cid) => characters.find((c) => c.id === cid)?.name || cid).join(", ")}\n\n`;
        doc += `${s.rawText}\n\n`;
      }
    }

    // Scripts
    if (scripts.length > 0) {
      doc += `---\n\n## SCRIPTS\n\n`;
      for (const sc of scripts) {
        doc += `### ${sc.title}\n\n`;
        for (const block of sc.blocks) {
          switch (block.type) {
            case "scene-header":
              doc += `\n${block.text.toUpperCase()}\n\n`;
              break;
            case "action":
              doc += `${block.text}\n\n`;
              break;
            case "dialogue":
              doc += `        ${block.characterName.toUpperCase()}\n`;
              if (block.parenthetical)
                doc += `    ${block.parenthetical}\n`;
              doc += `    ${block.text}\n\n`;
              break;
            case "transition":
              doc += `                    ${block.text.toUpperCase()}\n\n`;
              break;
          }
        }
      }
    }

    // Table Reads
    const trsWithText = tableReads.filter((tr) => tr.rawText);
    if (trsWithText.length > 0) {
      doc += `---\n\n## TABLE READS\n\n`;
      for (const tr of trsWithText) {
        doc += `### ${tr.title}\n`;
        doc += `Situation: ${tr.situation}\n\n`;
        doc += `${tr.rawText}\n\n`;
      }
    }

    return new Response(doc, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${slug}-export.md"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Export failed" },
      { status: 500 }
    );
  }
}
