/**
 * Pollinations.ai — 100% free AI image generation via URL.
 * No API key, no backend, no signup.
 * Simple: <img src={url} /> triggers generation.
 */

const BASE = "https://image.pollinations.ai/prompt";

interface StoryboardParams {
  prenom: string;
  trait?: string;
  objectif?: string;
  obstacle?: string;
  pitchText?: string;
}

/** Build a storyboard prompt for a single panel */
function buildPrompt(params: StoryboardParams, moment: string): string {
  const { prenom, trait, objectif, obstacle } = params;
  const parts = [
    `cinematic movie storyboard panel, ${moment}`,
    `character: ${prenom}`,
    trait && `personality: ${trait}`,
    objectif && `goal: ${objectif}`,
    obstacle && `obstacle: ${obstacle}`,
    "urban French banlieue setting, dramatic lighting, manga-inspired style, no text, 16:9 aspect ratio",
  ].filter(Boolean);
  return parts.join(", ");
}

/** Generate 3-4 storyboard panel URLs from character + pitch data */
export function generateStoryboardUrls(params: StoryboardParams): string[] {
  const moments = [
    `opening scene, ${params.prenom} in their neighborhood, establishing shot`,
    `${params.prenom} discovers their mission${params.objectif ? ` to ${params.objectif}` : ""}, close-up reaction`,
    `confrontation scene, ${params.prenom} faces ${params.obstacle || "their biggest challenge"}, dramatic angle`,
    `climactic moment, ${params.prenom} overcomes the obstacle, triumphant, golden hour lighting`,
  ];

  return moments.map((moment) => {
    const prompt = encodeURIComponent(buildPrompt(params, moment));
    return `${BASE}/${prompt}?width=768&height=432&model=flux&nologo=true&seed=${hashCode(moment + params.prenom)}`;
  });
}

/** Simple string hash for consistent seeds */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
