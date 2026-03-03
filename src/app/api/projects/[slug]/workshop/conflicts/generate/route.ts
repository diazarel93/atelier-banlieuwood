import { NextResponse } from "next/server";
import { listCharacters } from "@/lib/storage/character-store";
import { generateText } from "@/lib/ai/claude-provider";
import { conflictAnalysisSystemPrompt } from "@/lib/ai/prompts";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { characterIds, tensionPoint } = await request.json();

    if (!characterIds?.length || !tensionPoint) {
      return NextResponse.json(
        { error: "characterIds and tensionPoint required" },
        { status: 400 }
      );
    }

    const allCharacters = await listCharacters(slug);
    const characters = allCharacters.filter((c) =>
      characterIds.includes(c.id)
    );

    if (characters.length < 2) {
      return NextResponse.json(
        { error: "At least 2 valid characters required" },
        { status: 400 }
      );
    }

    const systemPrompt = conflictAnalysisSystemPrompt(characters);
    const userPrompt = `POINT DE TENSION : ${tensionPoint}\n\nAnalyse ce conflit entre ${characters.map((c) => c.name).join(" et ")} en 4 phases.`;

    const result = await generateText(systemPrompt, userPrompt, {
      maxTokens: 4096,
    });

    // Try to parse the JSON from the response
    let phases;
    try {
      // Extract JSON from possible markdown code blocks
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        phases = parsed.phases || [];
      }
    } catch {
      // If parsing fails, return raw text
      return NextResponse.json({ rawText: result, phases: [] });
    }

    return NextResponse.json({ phases, rawText: result });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Generation failed",
      },
      { status: 500 }
    );
  }
}
