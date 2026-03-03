import { NextResponse } from "next/server";
import { listCharacters } from "@/lib/storage/character-store";
import { listRelationships } from "@/lib/storage/relationship-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const characters = await listCharacters(slug);
  const relationships = await listRelationships(slug);

  const charCount = characters.length;
  const maxPossibleRelations = (charCount * (charCount - 1)) / 2;
  const density =
    maxPossibleRelations > 0
      ? Math.round((relationships.length / maxPossibleRelations) * 100)
      : 0;

  // Type distribution
  const typeCount: Record<string, number> = {};
  for (const r of relationships) {
    typeCount[r.type] = (typeCount[r.type] || 0) + 1;
  }

  // Tension analysis
  const avgTension =
    relationships.length > 0
      ? Math.round(
          (relationships.reduce((s, r) => s + r.tension, 0) /
            relationships.length) *
            10
        ) / 10
      : 0;

  const highTension = relationships.filter((r) => r.tension >= 7);
  const lowTrust = relationships.filter((r) => r.trust <= 3);

  // Connection count per character
  const connectionCount: Record<string, number> = {};
  for (const r of relationships) {
    connectionCount[r.characterA] =
      (connectionCount[r.characterA] || 0) + 1;
    connectionCount[r.characterB] =
      (connectionCount[r.characterB] || 0) + 1;
  }

  const isolated = characters.filter(
    (c) => !connectionCount[c.id]
  );

  const mostConnected = characters
    .map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      connections: connectionCount[c.id] || 0,
    }))
    .sort((a, b) => b.connections - a.connections)
    .slice(0, 5);

  // Power imbalances
  const powerImbalances = relationships
    .filter((r) => Math.abs(r.power) >= 7)
    .map((r) => {
      const charA = characters.find((c) => c.id === r.characterA);
      const charB = characters.find((c) => c.id === r.characterB);
      return {
        dominant: r.power > 0 ? charA?.name : charB?.name,
        dominated: r.power > 0 ? charB?.name : charA?.name,
        power: Math.abs(r.power),
        type: r.type,
      };
    });

  return NextResponse.json({
    density,
    totalRelationships: relationships.length,
    maxPossible: maxPossibleRelations,
    typeDistribution: typeCount,
    tension: {
      average: avgTension,
      highTensionPairs: highTension.map((r) => ({
        a: characters.find((c) => c.id === r.characterA)?.name || r.characterA,
        b: characters.find((c) => c.id === r.characterB)?.name || r.characterB,
        tension: r.tension,
        type: r.type,
      })),
      lowTrustPairs: lowTrust.map((r) => ({
        a: characters.find((c) => c.id === r.characterA)?.name || r.characterA,
        b: characters.find((c) => c.id === r.characterB)?.name || r.characterB,
        trust: r.trust,
      })),
    },
    isolated: isolated.map((c) => ({ id: c.id, name: c.name, color: c.color })),
    mostConnected,
    powerImbalances,
  });
}
