/**
 * AI provider — Gemini (free) → Ollama (local) → fallback.
 * Used for relances, bilan de session, and fiche de cours.
 */

import type { SessionFullData } from "@/lib/session-data";
import {
  type BilanResult,
  type FicheCoursResult,
  type BibleResult,
  BILAN_SYSTEM_PROMPT,
  FICHE_COURS_SYSTEM_PROMPT,
  BIBLE_SYSTEM_PROMPT,
  buildBilanUserPrompt,
  buildFicheCoursUserPrompt,
  buildBibleUserPrompt,
  buildFallbackBilan,
  buildFallbackFicheCours,
  buildFallbackBible,
} from "@/lib/prompts";

// ——— RELANCE CONSTANTS (unchanged) ———

const RELANCE_TIMEOUT = 8_000;
const RELANCE_MAX_TOKENS = 150;

const RELANCE_SYSTEM_PROMPT = `Tu es un mentor cinéma bienveillant. Un élève crée un film.
Règles STRICTES :
- Pose UNE SEULE question de relance qui creuse SA réponse spécifique
- Ne suggère JAMAIS d'élément narratif (pas de nom, lieu, objet)
- Ne juge pas, ne corrige pas
- Invite à préciser, visualiser, ou approfondir ce que l'élève a déjà imaginé
- Maximum 2 phrases
- Réponds uniquement avec la question, sans introduction ni commentaire`;

function buildRelanceUserPrompt(opts: {
  question: string;
  studentAnswer: string;
  level: string;
  previousAnswers?: string[];
}): string {
  const levelLabel: Record<string, string> = {
    college: "collège (11-15 ans)",
    lycee: "lycée (15-18 ans)",
    adulte: "adulte",
  };
  const lvl = levelLabel[opts.level] || opts.level;

  let prompt = `Niveau de l'élève : ${lvl}
La question posée était : "${opts.question}"
L'élève a répondu : "${opts.studentAnswer}"`;

  if (opts.previousAnswers?.length) {
    prompt += `\n\nContexte — ses réponses précédentes :\n${opts.previousAnswers.map((a, i) => `${i + 1}. ${a}`).join("\n")}`;
  }

  prompt += `\n\nPose UNE question de relance adaptée au niveau ${lvl}.`;
  return prompt;
}

// ——— GENERIC AI CALL ———

type AIProvider = "gemini" | "ollama" | "fallback";

async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
  timeout: number,
  temperature: number,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("no_key");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: { maxOutputTokens: maxTokens, temperature },
        }),
        signal: controller.signal,
      },
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Gemini API ${res.status}: ${body}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  } finally {
    clearTimeout(timer);
  }
}

async function callOllama(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
  timeout: number,
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2",
        stream: false,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        options: { num_predict: maxTokens },
      }),
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`Ollama ${res.status}`);

    const data = await res.json();
    return data.message?.content?.trim() || "";
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Generic AI text generation with Gemini → Ollama fallback chain.
 * Returns the generated text and which provider succeeded.
 */
export async function generateAIText(opts: {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  timeout?: number;
  temperature?: number;
}): Promise<{ text: string; provider: AIProvider }> {
  const maxTokens = opts.maxTokens ?? 1500;
  const timeout = opts.timeout ?? 20_000;
  const temperature = opts.temperature ?? 0.6;

  // 1. Try Gemini
  try {
    const result = await callGemini(opts.systemPrompt, opts.userPrompt, maxTokens, timeout, temperature);
    if (result) return { text: result, provider: "gemini" };
  } catch {
    // Fall through
  }

  // 2. Try Ollama
  try {
    const result = await callOllama(opts.systemPrompt, opts.userPrompt, maxTokens, timeout);
    if (result) return { text: result, provider: "ollama" };
  } catch {
    // Fall through
  }

  return { text: "", provider: "fallback" };
}

// ——— RELANCE (existing API — unchanged behavior) ———

export async function generateRelance(opts: {
  question: string;
  studentAnswer: string;
  level: string;
  previousAnswers?: string[];
  staticFallback?: string | null;
}): Promise<string> {
  const userPrompt = buildRelanceUserPrompt(opts);

  const { text } = await generateAIText({
    systemPrompt: RELANCE_SYSTEM_PROMPT,
    userPrompt,
    maxTokens: RELANCE_MAX_TOKENS,
    timeout: RELANCE_TIMEOUT,
    temperature: 0.7,
  });

  return text || opts.staticFallback || "Peux-tu m'en dire un peu plus sur ton idée ?";
}

// ——— BILAN DE SESSION ———

export async function generateBilanSession(
  data: SessionFullData,
): Promise<{ bilan: BilanResult; provider: AIProvider }> {
  const userPrompt = buildBilanUserPrompt(data);

  const { text, provider } = await generateAIText({
    systemPrompt: BILAN_SYSTEM_PROMPT,
    userPrompt,
    maxTokens: 2000,
    timeout: 30_000,
    temperature: 0.6,
  });

  if (provider === "fallback" || !text) {
    return { bilan: buildFallbackBilan(data), provider: "fallback" };
  }

  try {
    // Strip potential markdown code fences
    const cleaned = text.replace(/^```json?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
    const parsed = JSON.parse(cleaned) as BilanResult;
    return { bilan: parsed, provider };
  } catch {
    // JSON parse failed — use algorithmic fallback
    return { bilan: buildFallbackBilan(data), provider: "fallback" };
  }
}

// ——— FICHE DE COURS ———

export async function generateFicheCours(opts: {
  level: string;
  template?: string | null;
  sessionRecap?: string | null;
}): Promise<{ fiche: FicheCoursResult; provider: AIProvider }> {
  const userPrompt = buildFicheCoursUserPrompt(opts);

  const { text, provider } = await generateAIText({
    systemPrompt: FICHE_COURS_SYSTEM_PROMPT,
    userPrompt,
    maxTokens: 2000,
    timeout: 30_000,
    temperature: 0.5,
  });

  if (provider === "fallback" || !text) {
    return { fiche: buildFallbackFicheCours(opts.level, opts.sessionRecap), provider: "fallback" };
  }

  try {
    const cleaned = text.replace(/^```json?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
    const parsed = JSON.parse(cleaned) as FicheCoursResult;
    return { fiche: parsed, provider };
  } catch {
    return { fiche: buildFallbackFicheCours(opts.level, opts.sessionRecap), provider: "fallback" };
  }
}

// ——— BIBLE DU FILM ———

export async function generateBibleFilm(data: SessionFullData): Promise<{ bible: BibleResult; provider: AIProvider }> {
  const userPrompt = buildBibleUserPrompt(data);

  const { text, provider } = await generateAIText({
    systemPrompt: BIBLE_SYSTEM_PROMPT,
    userPrompt,
    maxTokens: 3000,
    timeout: 40_000,
    temperature: 0.7,
  });

  if (provider === "fallback" || !text) {
    return { bible: buildFallbackBible(data), provider: "fallback" };
  }

  try {
    const cleaned = text.replace(/^```json?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
    const parsed = JSON.parse(cleaned) as BibleResult;
    return { bible: parsed, provider };
  } catch {
    return { bible: buildFallbackBible(data), provider: "fallback" };
  }
}
