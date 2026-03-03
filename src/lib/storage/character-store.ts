import { nanoid } from "nanoid";
import {
  readJson,
  writeJson,
  deleteFile,
  listJsonFiles,
  characterPath,
  charactersDir,
} from "./fs-adapter";
import {
  Character,
  CharacterSchema,
  CreateCharacter,
} from "../models/character";
import path from "path";

export async function listCharacters(slug: string): Promise<Character[]> {
  const dir = charactersDir(slug);
  const files = await listJsonFiles(dir);
  const characters: Character[] = [];

  for (const file of files) {
    const char = await readJson<Character>(path.join(dir, file));
    if (char) characters.push(char);
  }

  return characters.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export async function getCharacter(
  slug: string,
  charId: string
): Promise<Character | null> {
  return readJson<Character>(characterPath(slug, charId));
}

export async function createCharacter(
  slug: string,
  data: CreateCharacter
): Promise<Character> {
  const id = nanoid(10);
  const now = new Date().toISOString();

  const character: Character = CharacterSchema.parse({
    id,
    projectSlug: slug,
    name: data.name,
    age: data.age || "",
    occupation: data.occupation || "",
    role: data.role || "",
    color: data.color || "#6366f1",
    backstory: data.backstory || "",
    psychology: data.psychology || {},
    traits: data.traits || [],
    voice: data.voice || {},
    arc: data.arc || [],
    notes: data.notes || "",
    createdAt: now,
    updatedAt: now,
  });

  await writeJson(characterPath(slug, id), character);
  return character;
}

export async function updateCharacter(
  slug: string,
  charId: string,
  data: Partial<CreateCharacter>
): Promise<Character | null> {
  const existing = await getCharacter(slug, charId);
  if (!existing) return null;

  const updated: Character = CharacterSchema.parse({
    ...existing,
    ...data,
    // Deep merge psychology and voice
    psychology: { ...existing.psychology, ...(data.psychology || {}) },
    voice: { ...existing.voice, ...(data.voice || {}) },
    updatedAt: new Date().toISOString(),
  });

  await writeJson(characterPath(slug, charId), updated);
  return updated;
}

export async function deleteCharacter(
  slug: string,
  charId: string
): Promise<boolean> {
  return deleteFile(characterPath(slug, charId));
}
