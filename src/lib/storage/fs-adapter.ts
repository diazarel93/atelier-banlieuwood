import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

export async function writeJson<T>(filePath: string, data: T): Promise<void> {
  const dir = path.dirname(filePath);
  await ensureDir(dir);
  const tmpPath = filePath + ".tmp";
  await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), "utf-8");
  await fs.rename(tmpPath, filePath);
}

export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    await fs.unlink(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function deleteDir(dirPath: string): Promise<boolean> {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
    return true;
  } catch {
    return false;
  }
}

export async function listDirs(dirPath: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
}

export async function listJsonFiles(dirPath: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dirPath);
    return entries.filter((e) => e.endsWith(".json") && !e.startsWith("_"));
  } catch {
    return [];
  }
}

export function projectPath(slug: string): string {
  return path.join(DATA_DIR, "projects", slug);
}

export function characterPath(slug: string, charId: string): string {
  return path.join(projectPath(slug), "bible", "characters", `${charId}.json`);
}

export function charactersDir(slug: string): string {
  return path.join(projectPath(slug), "bible", "characters");
}

export function universePath(slug: string): string {
  return path.join(projectPath(slug), "bible", "universe");
}

export function relationshipsPath(slug: string): string {
  return path.join(projectPath(slug), "bible", "relationships", "_index.json");
}

export function overviewPath(slug: string): string {
  return path.join(projectPath(slug), "bible", "overview.json");
}

// Workshop paths
export function workshopDir(slug: string): string {
  return path.join(projectPath(slug), "workshop");
}

export function tableReadsDir(slug: string): string {
  return path.join(workshopDir(slug), "table-reads");
}

export function tableReadPath(slug: string, id: string): string {
  return path.join(tableReadsDir(slug), `${id}.json`);
}

export function scenesDir(slug: string): string {
  return path.join(workshopDir(slug), "scenes");
}

export function scenePath(slug: string, id: string): string {
  return path.join(scenesDir(slug), `${id}.json`);
}

export function scriptsDir(slug: string): string {
  return path.join(workshopDir(slug), "scripts");
}

export function scriptPath(slug: string, id: string): string {
  return path.join(scriptsDir(slug), `${id}.json`);
}

export function conflictsDir(slug: string): string {
  return path.join(workshopDir(slug), "conflicts");
}

export function conflictPath(slug: string, id: string): string {
  return path.join(conflictsDir(slug), `${id}.json`);
}

// War Room paths
export function warRoomDir(slug: string): string {
  return path.join(projectPath(slug), "war-room");
}

export function episodesDir(slug: string): string {
  return path.join(warRoomDir(slug), "episodes");
}

export function episodePath(slug: string, id: string): string {
  return path.join(episodesDir(slug), `${id}.json`);
}

export function notesDir(slug: string): string {
  return path.join(warRoomDir(slug), "notes");
}

export function notePath(slug: string, id: string): string {
  return path.join(notesDir(slug), `${id}.json`);
}

// Dashboard paths
export function dashboardDir(slug: string): string {
  return path.join(projectPath(slug), "dashboard");
}

export function classesDir(slug: string): string {
  return path.join(dashboardDir(slug), "classes");
}

export function classPath(slug: string, classId: string): string {
  return path.join(classesDir(slug), `${classId}.json`);
}

export function studentsDir(slug: string, classId: string): string {
  return path.join(classesDir(slug), classId, "students");
}

export function studentPath(slug: string, classId: string, studentId: string): string {
  return path.join(studentsDir(slug, classId), `${studentId}.json`);
}

export function messagesDir(slug: string, classId: string): string {
  return path.join(classesDir(slug), classId, "messages");
}

export function messagePath(slug: string, classId: string, messageId: string): string {
  return path.join(messagesDir(slug, classId), `${messageId}.json`);
}

export function annotationsDir(slug: string, classId: string): string {
  return path.join(classesDir(slug), classId, "annotations");
}

export function annotationPath(slug: string, classId: string, annotationId: string): string {
  return path.join(annotationsDir(slug, classId), `${annotationId}.json`);
}

// Atelier paths
export function atelierDir(slug: string): string {
  return path.join(projectPath(slug), "atelier");
}

export function atelierPath(slug: string, id: string): string {
  return path.join(atelierDir(slug), `${id}.json`);
}

export function achievementsPath(slug: string): string {
  return path.join(atelierDir(slug), "achievements.json");
}
