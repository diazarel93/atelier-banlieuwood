import { nanoid } from "nanoid";
import path from "path";
import {
  readJson,
  writeJson,
  deleteFile,
  listJsonFiles,
  episodesDir,
  episodePath,
  notesDir,
  notePath,
} from "./fs-adapter";
import {
  Episode,
  EpisodeSchema,
  CreateEpisode,
  ProductionNote,
  ProductionNoteSchema,
  CreateProductionNote,
} from "../models/war-room";

// ── Episodes ────────────────────────────────────────────────────

export async function listEpisodes(slug: string): Promise<Episode[]> {
  const dir = episodesDir(slug);
  const files = await listJsonFiles(dir);
  const items: Episode[] = [];
  for (const file of files) {
    const item = await readJson<Episode>(path.join(dir, file));
    if (item) items.push(item);
  }
  return items.sort((a, b) => a.number - b.number);
}

export async function getEpisode(
  slug: string,
  id: string
): Promise<Episode | null> {
  return readJson<Episode>(episodePath(slug, id));
}

export async function createEpisode(
  slug: string,
  data: CreateEpisode
): Promise<Episode> {
  const id = nanoid(10);
  const now = new Date().toISOString();
  const existing = await listEpisodes(slug);
  const episode = EpisodeSchema.parse({
    id,
    projectSlug: slug,
    title: data.title,
    number: data.number ?? existing.length + 1,
    synopsis: data.synopsis || "",
    sceneIds: [],
    status: "draft",
    notes: "",
    createdAt: now,
    updatedAt: now,
  });
  await writeJson(episodePath(slug, id), episode);
  return episode;
}

export async function updateEpisode(
  slug: string,
  id: string,
  data: Partial<Episode>
): Promise<Episode | null> {
  const existing = await getEpisode(slug, id);
  if (!existing) return null;
  const updated = EpisodeSchema.parse({
    ...existing,
    ...data,
    id: existing.id,
    projectSlug: existing.projectSlug,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  });
  await writeJson(episodePath(slug, id), updated);
  return updated;
}

export async function deleteEpisode(
  slug: string,
  id: string
): Promise<boolean> {
  return deleteFile(episodePath(slug, id));
}

// ── Production Notes ────────────────────────────────────────────

export async function listNotes(slug: string): Promise<ProductionNote[]> {
  const dir = notesDir(slug);
  const files = await listJsonFiles(dir);
  const items: ProductionNote[] = [];
  for (const file of files) {
    const item = await readJson<ProductionNote>(path.join(dir, file));
    if (item) items.push(item);
  }
  return items.sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function getNote(
  slug: string,
  id: string
): Promise<ProductionNote | null> {
  return readJson<ProductionNote>(notePath(slug, id));
}

export async function createNote(
  slug: string,
  data: CreateProductionNote
): Promise<ProductionNote> {
  const id = nanoid(10);
  const now = new Date().toISOString();
  const note = ProductionNoteSchema.parse({
    id,
    projectSlug: slug,
    title: data.title,
    content: data.content || "",
    category: data.category || "todo",
    priority: data.priority || "medium",
    createdAt: now,
    updatedAt: now,
  });
  await writeJson(notePath(slug, id), note);
  return note;
}

export async function updateNote(
  slug: string,
  id: string,
  data: Partial<ProductionNote>
): Promise<ProductionNote | null> {
  const existing = await getNote(slug, id);
  if (!existing) return null;
  const updated = ProductionNoteSchema.parse({
    ...existing,
    ...data,
    id: existing.id,
    projectSlug: existing.projectSlug,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  });
  await writeJson(notePath(slug, id), updated);
  return updated;
}

export async function deleteNote(
  slug: string,
  id: string
): Promise<boolean> {
  return deleteFile(notePath(slug, id));
}
