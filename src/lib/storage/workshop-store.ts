import { nanoid } from "nanoid";
import path from "path";
import {
  readJson,
  writeJson,
  deleteFile,
  listJsonFiles,
  tableReadsDir,
  tableReadPath,
  scenesDir,
  scenePath,
  scriptsDir,
  scriptPath,
  conflictsDir,
  conflictPath,
} from "./fs-adapter";
import {
  TableReadSession,
  TableReadSessionSchema,
  CreateTableRead,
  Scene,
  SceneSchema,
  CreateScene,
  Script,
  ScriptSchema,
  CreateScript,
  ConflictAnalysis,
  ConflictAnalysisSchema,
  CreateConflict,
} from "../models/workshop";

// ── Table Reads ─────────────────────────────────────────────────

export async function listTableReads(
  slug: string
): Promise<TableReadSession[]> {
  const dir = tableReadsDir(slug);
  const files = await listJsonFiles(dir);
  const items: TableReadSession[] = [];
  for (const file of files) {
    const item = await readJson<TableReadSession>(path.join(dir, file));
    if (item) items.push(item);
  }
  return items.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getTableRead(
  slug: string,
  id: string
): Promise<TableReadSession | null> {
  return readJson<TableReadSession>(tableReadPath(slug, id));
}

export async function createTableRead(
  slug: string,
  data: CreateTableRead
): Promise<TableReadSession> {
  const id = nanoid(10);
  const now = new Date().toISOString();
  const session = TableReadSessionSchema.parse({
    id,
    projectSlug: slug,
    title: data.title,
    characterIds: data.characterIds,
    situation: data.situation,
    lines: [],
    redirections: [],
    rawText: "",
    createdAt: now,
    updatedAt: now,
  });
  await writeJson(tableReadPath(slug, id), session);
  return session;
}

export async function updateTableRead(
  slug: string,
  id: string,
  data: Partial<TableReadSession>
): Promise<TableReadSession | null> {
  const existing = await getTableRead(slug, id);
  if (!existing) return null;
  const updated = TableReadSessionSchema.parse({
    ...existing,
    ...data,
    id: existing.id,
    projectSlug: existing.projectSlug,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  });
  await writeJson(tableReadPath(slug, id), updated);
  return updated;
}

export async function deleteTableRead(
  slug: string,
  id: string
): Promise<boolean> {
  return deleteFile(tableReadPath(slug, id));
}

// ── Scenes ──────────────────────────────────────────────────────

export async function listScenes(slug: string): Promise<Scene[]> {
  const dir = scenesDir(slug);
  const files = await listJsonFiles(dir);
  const items: Scene[] = [];
  for (const file of files) {
    const item = await readJson<Scene>(path.join(dir, file));
    if (item) items.push(item);
  }
  return items.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getScene(
  slug: string,
  id: string
): Promise<Scene | null> {
  return readJson<Scene>(scenePath(slug, id));
}

export async function createScene(
  slug: string,
  data: CreateScene
): Promise<Scene> {
  const id = nanoid(10);
  const now = new Date().toISOString();
  const scene = SceneSchema.parse({
    id,
    projectSlug: slug,
    title: data.title,
    characterIds: data.characterIds,
    context: data.context || "",
    tone: data.tone || "",
    location: data.location || "",
    stakes: data.stakes || "",
    blocks: [],
    rawText: "",
    createdAt: now,
    updatedAt: now,
  });
  await writeJson(scenePath(slug, id), scene);
  return scene;
}

export async function updateScene(
  slug: string,
  id: string,
  data: Partial<Scene>
): Promise<Scene | null> {
  const existing = await getScene(slug, id);
  if (!existing) return null;
  const updated = SceneSchema.parse({
    ...existing,
    ...data,
    id: existing.id,
    projectSlug: existing.projectSlug,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  });
  await writeJson(scenePath(slug, id), updated);
  return updated;
}

export async function deleteScene(
  slug: string,
  id: string
): Promise<boolean> {
  return deleteFile(scenePath(slug, id));
}

// ── Scripts ─────────────────────────────────────────────────────

export async function listScripts(slug: string): Promise<Script[]> {
  const dir = scriptsDir(slug);
  const files = await listJsonFiles(dir);
  const items: Script[] = [];
  for (const file of files) {
    const item = await readJson<Script>(path.join(dir, file));
    if (item) items.push(item);
  }
  return items.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getScript(
  slug: string,
  id: string
): Promise<Script | null> {
  return readJson<Script>(scriptPath(slug, id));
}

export async function createScript(
  slug: string,
  data: CreateScript
): Promise<Script> {
  const id = nanoid(10);
  const now = new Date().toISOString();
  const script = ScriptSchema.parse({
    id,
    projectSlug: slug,
    title: data.title,
    blocks: [],
    createdAt: now,
    updatedAt: now,
  });
  await writeJson(scriptPath(slug, id), script);
  return script;
}

export async function updateScript(
  slug: string,
  id: string,
  data: Partial<Script>
): Promise<Script | null> {
  const existing = await getScript(slug, id);
  if (!existing) return null;
  const updated = ScriptSchema.parse({
    ...existing,
    ...data,
    id: existing.id,
    projectSlug: existing.projectSlug,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  });
  await writeJson(scriptPath(slug, id), updated);
  return updated;
}

export async function deleteScript(
  slug: string,
  id: string
): Promise<boolean> {
  return deleteFile(scriptPath(slug, id));
}

// ── Conflicts ───────────────────────────────────────────────────

export async function listConflicts(
  slug: string
): Promise<ConflictAnalysis[]> {
  const dir = conflictsDir(slug);
  const files = await listJsonFiles(dir);
  const items: ConflictAnalysis[] = [];
  for (const file of files) {
    const item = await readJson<ConflictAnalysis>(path.join(dir, file));
    if (item) items.push(item);
  }
  return items.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getConflict(
  slug: string,
  id: string
): Promise<ConflictAnalysis | null> {
  return readJson<ConflictAnalysis>(conflictPath(slug, id));
}

export async function createConflict(
  slug: string,
  data: CreateConflict
): Promise<ConflictAnalysis> {
  const id = nanoid(10);
  const now = new Date().toISOString();
  const conflict = ConflictAnalysisSchema.parse({
    id,
    projectSlug: slug,
    title: data.title,
    characterIds: data.characterIds,
    tensionPoint: data.tensionPoint,
    phases: [],
    rawText: "",
    createdAt: now,
    updatedAt: now,
  });
  await writeJson(conflictPath(slug, id), conflict);
  return conflict;
}

export async function updateConflict(
  slug: string,
  id: string,
  data: Partial<ConflictAnalysis>
): Promise<ConflictAnalysis | null> {
  const existing = await getConflict(slug, id);
  if (!existing) return null;
  const updated = ConflictAnalysisSchema.parse({
    ...existing,
    ...data,
    id: existing.id,
    projectSlug: existing.projectSlug,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  });
  await writeJson(conflictPath(slug, id), updated);
  return updated;
}

export async function deleteConflict(
  slug: string,
  id: string
): Promise<boolean> {
  return deleteFile(conflictPath(slug, id));
}
