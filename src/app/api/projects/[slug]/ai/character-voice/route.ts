import { NextResponse } from "next/server";
import { getCharacter } from "@/lib/storage/character-store";
import { generateText } from "@/lib/ai/claude-provider";
import {
  characterVoiceSystemPrompt,
  suggestFlawPrompt,
  generateBackstoryPrompt,
  developConceptPrompt,
} from "@/lib/ai/prompts";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { action, characterId, prompt } = body as {
      action: string;
      characterId?: string;
      prompt?: string;
    };

    // "develop-concept" doesn't need a character
    if (action === "develop-concept") {
      if (!prompt) {
        return NextResponse.json(
          { error: "prompt is required" },
          { status: 400 }
        );
      }
      const result = await generateText(
        "Tu es un scénariste expert. Réponds toujours en JSON valide.",
        developConceptPrompt(prompt),
        { maxTokens: 2048 }
      );
      return NextResponse.json({ result });
    }

    // All other actions need a character
    if (!characterId) {
      return NextResponse.json(
        { error: "characterId is required" },
        { status: 400 }
      );
    }

    const character = await getCharacter(slug, characterId);
    if (!character) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 }
      );
    }

    let result: string;

    switch (action) {
      case "speak": {
        const systemPrompt = characterVoiceSystemPrompt(character);
        result = await generateText(systemPrompt, prompt || "Présente-toi.");
        break;
      }
      case "suggest-flaw": {
        result = await generateText(
          "Tu es un consultant en écriture de scénario.",
          suggestFlawPrompt(character),
          { maxTokens: 1500 }
        );
        break;
      }
      case "generate-backstory": {
        result = await generateText(
          "Tu es un scénariste expert en création de personnages.",
          generateBackstoryPrompt(character),
          { maxTokens: 2048 }
        );
        break;
      }
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("AI error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI generation failed" },
      { status: 500 }
    );
  }
}
