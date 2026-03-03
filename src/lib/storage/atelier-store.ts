import { nanoid } from "nanoid";
import path from "path";
import {
  readJson,
  writeJson,
  deleteFile,
  listJsonFiles,
  atelierDir,
  atelierPath,
  achievementsPath,
} from "./fs-adapter";
import type { AchievementsData } from "../models/achievements";
import {
  AtelierSession,
  AtelierSessionSchema,
  CreateAtelier,
  initChapters,
} from "../models/atelier";

function migrateSession(raw: unknown): AtelierSession | null {
  try {
    return AtelierSessionSchema.parse(raw);
  } catch {
    // Zod .default() handles missing exchanges/currentFollowUp on steps
    // but if the raw data is truly broken, return null
    return null;
  }
}

export async function listAtelierSessions(
  slug: string
): Promise<AtelierSession[]> {
  const dir = atelierDir(slug);
  const files = await listJsonFiles(dir);
  const items: AtelierSession[] = [];
  for (const file of files) {
    const raw = await readJson<Record<string, unknown>>(path.join(dir, file));
    if (!raw) continue;
    const item = migrateSession(raw);
    if (item) items.push(item);
  }
  return items.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getAtelierSession(
  slug: string,
  id: string
): Promise<AtelierSession | null> {
  const raw = await readJson<Record<string, unknown>>(atelierPath(slug, id));
  if (!raw) return null;
  return migrateSession(raw);
}

export async function createAtelierSession(
  slug: string,
  data: CreateAtelier
): Promise<AtelierSession> {
  const id = nanoid(10);
  const now = new Date().toISOString();
  const chapters = initChapters();
  const maxScore = chapters.reduce((sum, ch) => sum + ch.maxScore, 0);
  const session = AtelierSessionSchema.parse({
    id,
    projectSlug: slug,
    module: 1,
    level: data.level,
    chapters,
    totalScore: 0,
    maxScore,
    currentChapter: "idea",
    createdAt: now,
    updatedAt: now,
  });
  await writeJson(atelierPath(slug, id), session);
  return session;
}

export async function updateAtelierSession(
  slug: string,
  id: string,
  data: Partial<AtelierSession>
): Promise<AtelierSession | null> {
  const existing = await getAtelierSession(slug, id);
  if (!existing) return null;
  const updated = AtelierSessionSchema.parse({
    ...existing,
    ...data,
    id: existing.id,
    projectSlug: existing.projectSlug,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  });
  await writeJson(atelierPath(slug, id), updated);
  return updated;
}

export async function deleteAtelierSession(
  slug: string,
  id: string
): Promise<boolean> {
  return deleteFile(atelierPath(slug, id));
}

// ── Achievements ──────────────────────────────────────────────────

const EMPTY_ACHIEVEMENTS: AchievementsData = { achievements: [] };

export async function getAchievements(slug: string): Promise<AchievementsData> {
  const data = await readJson<AchievementsData>(achievementsPath(slug));
  return data || EMPTY_ACHIEVEMENTS;
}

export async function unlockAchievement(
  slug: string,
  achievementId: string
): Promise<void> {
  const data = await getAchievements(slug);
  if (data.achievements.some((a) => a.id === achievementId)) return;
  data.achievements.push({
    id: achievementId,
    unlockedAt: new Date().toISOString(),
  });
  await writeJson(achievementsPath(slug), data);
}
