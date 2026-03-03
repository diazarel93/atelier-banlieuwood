import { listCharacters } from "@/lib/storage/character-store";
import { streamText } from "@/lib/ai/claude-provider";
import { multiCharacterTableReadSystemPrompt } from "@/lib/ai/prompts";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { characterIds, situation } = await request.json();

    if (!characterIds?.length || !situation) {
      return new Response(
        JSON.stringify({ error: "characterIds and situation required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const allCharacters = await listCharacters(slug);
    const characters = allCharacters.filter((c) =>
      characterIds.includes(c.id)
    );

    if (characters.length < 2) {
      return new Response(
        JSON.stringify({ error: "At least 2 valid characters required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = multiCharacterTableReadSystemPrompt(characters);
    const userPrompt = `SITUATION : ${situation}\n\nGénère le dialogue entre ces personnages dans cette situation.`;

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of streamText(systemPrompt, userPrompt, {
            maxTokens: 4096,
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
        error: error instanceof Error ? error.message : "Generation failed",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
