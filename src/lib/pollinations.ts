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

// ── Module 7 — Scene storyboard panel image ──

interface SceneStoryboardParams {
  sceneTitle: string;
  sceneDescription: string;
  planType: string; // plan-large, plan-moyen, gros-plan, plan-reaction
  planDescription: string;
  tone?: string;
}

const PLAN_SHOT_MAP: Record<string, string> = {
  "plan-large": "wide establishing shot",
  "plan-moyen": "medium shot",
  "gros-plan": "close-up shot",
  "plan-reaction": "reaction close-up shot",
};

/** Generate a single storyboard panel URL for a specific shot in a scene */
export function generateSceneStoryboardUrl(params: SceneStoryboardParams): string {
  const shotType = PLAN_SHOT_MAP[params.planType] || "medium shot";
  const tone = params.tone || "dramatic";
  const parts = [
    `cinematic storyboard panel`,
    `${shotType}`,
    params.sceneDescription,
    params.planDescription,
    `urban French setting`,
    `${tone} lighting`,
    `manga-inspired style`,
    `no text`,
    `16:9`,
  ];
  const prompt = encodeURIComponent(parts.join(", "));
  const seed = hashCode(params.sceneTitle + params.planType);
  return `${BASE}/${prompt}?width=768&height=432&model=flux&nologo=true&seed=${seed}`;
}

/** Simple string hash for consistent seeds */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
