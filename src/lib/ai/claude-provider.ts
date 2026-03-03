import Anthropic from "@anthropic-ai/sdk";

// ── Provider detection ───────────────────────────────────────────

const OLLAMA_BASE = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

function hasClaudeKey(): boolean {
  const key = process.env.ANTHROPIC_API_KEY;
  return !!key && key !== "your-api-key-here" && key.startsWith("sk-");
}

function useOllama(): boolean {
  return !hasClaudeKey();
}

// ── Claude client ────────────────────────────────────────────────

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

// ── Ollama helpers ───────────────────────────────────────────────

const OLLAMA_TIMEOUT_MS = 30_000; // 30s max per request

async function ollamaGenerate(
  systemPrompt: string,
  userPrompt: string,
  options?: { maxTokens?: number; temperature?: number }
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  try {
    const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        options: {
          num_predict: options?.maxTokens ?? 1024,
          temperature: options?.temperature ?? 0.8,
        },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Ollama error: ${res.status} ${err}`);
    }

    const data = await res.json();
    return data.message?.content || "";
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Ollama timeout: le mod\u00e8le a mis trop de temps \u00e0 r\u00e9pondre");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

const OLLAMA_STREAM_TIMEOUT_MS = 60_000; // 60s for streaming (longer since it yields progressively)

async function* ollamaStream(
  systemPrompt: string,
  userPrompt: string,
  options?: { maxTokens?: number; temperature?: number }
): AsyncGenerator<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OLLAMA_STREAM_TIMEOUT_MS);

  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: controller.signal,
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: true,
      options: {
        num_predict: options?.maxTokens ?? 1024,
        temperature: options?.temperature ?? 0.8,
      },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    clearTimeout(timer);
    throw new Error(`Ollama stream error: ${res.status}`);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    clearTimeout(timer);
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line);
          if (json.message?.content) {
            yield json.message.content;
          }
        } catch {
          // skip malformed lines
        }
      }
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Ollama stream timeout: le modèle a mis trop de temps à répondre");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// ── Public API (auto-selects provider) ───────────────────────────

export async function generateText(
  systemPrompt: string,
  userPrompt: string,
  options?: { maxTokens?: number; temperature?: number }
): Promise<string> {
  if (useOllama()) {
    return ollamaGenerate(systemPrompt, userPrompt, options);
  }

  const anthropic = getClient();
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: options?.maxTokens ?? 1024,
    temperature: options?.temperature ?? 0.8,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const block = response.content[0];
  if (block.type === "text") return block.text;
  return "";
}

export async function* streamText(
  systemPrompt: string,
  userPrompt: string,
  options?: { maxTokens?: number; temperature?: number }
): AsyncGenerator<string> {
  if (useOllama()) {
    yield* ollamaStream(systemPrompt, userPrompt, options);
    return;
  }

  const anthropic = getClient();
  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: options?.maxTokens ?? 1024,
    temperature: options?.temperature ?? 0.8,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}
