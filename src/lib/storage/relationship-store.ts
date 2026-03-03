import { nanoid } from "nanoid";
import { readJson, writeJson, relationshipsPath } from "./fs-adapter";
import {
  Relationship,
  RelationshipSchema,
  CreateRelationship,
} from "../models/relationship";

async function loadRelationships(slug: string): Promise<Relationship[]> {
  return (await readJson<Relationship[]>(relationshipsPath(slug))) || [];
}

async function saveRelationships(
  slug: string,
  relationships: Relationship[]
): Promise<void> {
  await writeJson(relationshipsPath(slug), relationships);
}

export async function listRelationships(slug: string): Promise<Relationship[]> {
  return loadRelationships(slug);
}

export async function createRelationship(
  slug: string,
  data: CreateRelationship
): Promise<Relationship> {
  const relationships = await loadRelationships(slug);
  const id = nanoid(10);

  const relationship: Relationship = RelationshipSchema.parse({
    id,
    characterA: data.characterA,
    characterB: data.characterB,
    type: data.type || "neutre",
    label: data.label || "",
    power: data.power ?? 0,
    trust: data.trust ?? 5,
    tension: data.tension ?? 0,
    notes: data.notes || "",
  });

  relationships.push(relationship);
  await saveRelationships(slug, relationships);
  return relationship;
}

export async function updateRelationship(
  slug: string,
  relId: string,
  data: Partial<CreateRelationship>
): Promise<Relationship | null> {
  const relationships = await loadRelationships(slug);
  const index = relationships.findIndex((r) => r.id === relId);
  if (index === -1) return null;

  const updated: Relationship = RelationshipSchema.parse({
    ...relationships[index],
    ...data,
  });

  relationships[index] = updated;
  await saveRelationships(slug, relationships);
  return updated;
}

export async function deleteRelationship(
  slug: string,
  relId: string
): Promise<boolean> {
  const relationships = await loadRelationships(slug);
  const filtered = relationships.filter((r) => r.id !== relId);
  if (filtered.length === relationships.length) return false;
  await saveRelationships(slug, filtered);
  return true;
}
