import { listCharacters } from "@/lib/storage/character-store";
import { streamText } from "@/lib/ai/claude-provider";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { slug } = await params;
    const { action, text, characterName } = await request.json();

    if (!action || !text) {
      return new Response(
        JSON.stringify({ error: "action and text required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const allCharacters = await listCharacters(slug);

    let systemPrompt =
      "Tu es un assistant d'écriture de scénario professionnel. Réponds en français.";
    let userPrompt = "";

    switch (action) {
      case "reformulate": {
        systemPrompt +=
          " Tu reformules des passages de scénario en gardant le même sens mais avec un style plus percutant.";
        userPrompt = `Reformule ce passage de scénario :\n\n${text}\n\nGarde le même format (dialogue, action, etc.) et le même sens, mais améliore le style.`;
        break;
      }
      case "adapt-character": {
        const char = allCharacters.find(
          (c) => c.name.toLowerCase() === characterName?.toLowerCase()
        );
        if (char) {
          const v = char.voice;
          systemPrompt += ` Tu adaptes un dialogue pour qu'il corresponde à la voix de ${char.name} : vocabulaire=${v.vocabulary || "standard"}, registre=${v.register || "courant"}, tics=[${v.verbalTics?.join(", ") || ""}].`;
        }
        userPrompt = `Adapte ce texte pour qu'il sonne comme ${characterName || "le personnage"} parlerait :\n\n${text}`;
        break;
      }
      case "suggest-next": {
        systemPrompt +=
          " Tu suggères la suite logique d'un scénario au format standard.";
        userPrompt = `Voici ce qui précède dans le scénario :\n\n${text}\n\nSuggère la suite (2-3 blocs : action, dialogue, ou transition).`;
        break;
      }
      default:
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of streamText(systemPrompt, userPrompt, {
            maxTokens: 2048,
          })) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`)
            );
          }
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
          );
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: (err as Error).message })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "AI failed",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
