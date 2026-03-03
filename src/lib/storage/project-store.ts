import path from "path";
import {
  readJson,
  writeJson,
  listDirs,
  projectPath,
  ensureDir,
} from "./fs-adapter";
import {
  ProjectMeta,
  ProjectMetaSchema,
  CreateProject,
} from "../models/project";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function listProjects(): Promise<ProjectMeta[]> {
  const dataDir = path.join(process.cwd(), "data", "projects");
  const slugs = await listDirs(dataDir);
  const projects: ProjectMeta[] = [];

  for (const slug of slugs) {
    const meta = await readJson<ProjectMeta>(
      path.join(projectPath(slug), "meta.json")
    );
    if (meta) projects.push(meta);
  }

  return projects.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function getProject(slug: string): Promise<ProjectMeta | null> {
  return readJson<ProjectMeta>(path.join(projectPath(slug), "meta.json"));
}

export async function createProject(data: CreateProject): Promise<ProjectMeta> {
  const slug = slugify(data.title) || "projet";
  const now = new Date().toISOString();

  const meta: ProjectMeta = ProjectMetaSchema.parse({
    slug,
    title: data.title,
    genre: data.genre || "",
    logline: data.logline || "",
    createdAt: now,
    updatedAt: now,
  });

  const dir = projectPath(slug);
  await ensureDir(dir);
  await ensureDir(path.join(dir, "bible", "characters"));
  await ensureDir(path.join(dir, "bible", "universe", "locations"));
  await ensureDir(path.join(dir, "bible", "relationships"));
  await ensureDir(path.join(dir, "memory"));

  await writeJson(path.join(dir, "meta.json"), meta);

  return meta;
}

export async function updateProject(
  slug: string,
  data: Partial<CreateProject>
): Promise<ProjectMeta | null> {
  const existing = await getProject(slug);
  if (!existing) return null;

  const updated: ProjectMeta = {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
  };

  await writeJson(path.join(projectPath(slug), "meta.json"), updated);
  return updated;
}

export async function deleteProject(slug: string): Promise<boolean> {
  const { promises: fs } = await import("fs");
  try {
    await fs.rm(projectPath(slug), { recursive: true, force: true });
    return true;
  } catch {
    return false;
  }
}
