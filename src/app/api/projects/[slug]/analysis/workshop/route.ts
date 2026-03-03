import { NextResponse } from "next/server";
import { listCharacters } from "@/lib/storage/character-store";
import {
  listTableReads,
  listScenes,
  listScripts,
  listConflicts,
} from "@/lib/storage/workshop-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const [characters, tableReads, scenes, scripts, conflicts] =
    await Promise.all([
      listCharacters(slug),
      listTableReads(slug),
      listScenes(slug),
      listScripts(slug),
      listConflicts(slug),
    ]);

  // Character usage across workshop items
  const charUsage: Record<string, { tableReads: number; scenes: number; conflicts: number }> = {};
  for (const c of characters) {
    charUsage[c.id] = { tableReads: 0, scenes: 0, conflicts: 0 };
  }

  for (const tr of tableReads) {
    for (const cid of tr.characterIds) {
      if (charUsage[cid]) charUsage[cid].tableReads++;
    }
  }
  for (const s of scenes) {
    for (const cid of s.characterIds) {
      if (charUsage[cid]) charUsage[cid].scenes++;
    }
  }
  for (const cf of conflicts) {
    for (const cid of cf.characterIds) {
      if (charUsage[cid]) charUsage[cid].conflicts++;
    }
  }

  const characterActivity = characters
    .map((c) => {
      const u = charUsage[c.id] || { tableReads: 0, scenes: 0, conflicts: 0 };
      return {
        id: c.id,
        name: c.name,
        color: c.color,
        total: u.tableReads + u.scenes + u.conflicts,
        ...u,
      };
    })
    .sort((a, b) => b.total - a.total);

  const totalBlocks = scripts.reduce((s, sc) => s + sc.blocks.length, 0);

  // Script block type distribution
  const blockTypes: Record<string, number> = {};
  for (const sc of scripts) {
    for (const b of sc.blocks) {
      blockTypes[b.type] = (blockTypes[b.type] || 0) + 1;
    }
  }

  const unusedCharacters = characterActivity.filter(
    (c) => c.total === 0
  );

  return NextResponse.json({
    counts: {
      tableReads: tableReads.length,
      scenes: scenes.length,
      scripts: scripts.length,
      conflicts: conflicts.length,
      totalBlocks,
    },
    characterActivity,
    unusedCharacters,
    blockTypeDistribution: blockTypes,
    generatedContent: {
      tableReadsWithText: tableReads.filter((tr) => tr.rawText).length,
      scenesWithText: scenes.filter((s) => s.rawText).length,
      conflictsWithPhases: conflicts.filter((c) => c.phases?.length > 0).length,
    },
  });
}
