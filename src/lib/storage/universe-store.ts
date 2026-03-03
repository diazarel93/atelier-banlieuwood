import { nanoid } from "nanoid";
import { readJson, writeJson, universePath } from "./fs-adapter";
import {
  UniverseData,
  UniverseDataSchema,
  Location,
  WorldRule,
  TimelineEvent,
} from "../models/universe";
import path from "path";

async function loadUniverse(slug: string): Promise<UniverseData> {
  const dir = universePath(slug);
  const locations =
    (await readJson<Location[]>(path.join(dir, "locations", "_index.json"))) ||
    [];
  const rules =
    (await readJson<WorldRule[]>(path.join(dir, "rules.json"))) || [];
  const timeline =
    (await readJson<TimelineEvent[]>(path.join(dir, "timeline.json"))) || [];

  return UniverseDataSchema.parse({ locations, rules, timeline });
}

export async function getUniverse(slug: string): Promise<UniverseData> {
  return loadUniverse(slug);
}

// Locations
export async function addLocation(
  slug: string,
  data: Omit<Location, "id">
): Promise<Location> {
  const dir = universePath(slug);
  const filePath = path.join(dir, "locations", "_index.json");
  const locations = (await readJson<Location[]>(filePath)) || [];
  const location: Location = { id: nanoid(10), ...data };
  locations.push(location);
  await writeJson(filePath, locations);
  return location;
}

export async function updateLocation(
  slug: string,
  locId: string,
  data: Partial<Omit<Location, "id">>
): Promise<Location | null> {
  const dir = universePath(slug);
  const filePath = path.join(dir, "locations", "_index.json");
  const locations = (await readJson<Location[]>(filePath)) || [];
  const index = locations.findIndex((l) => l.id === locId);
  if (index === -1) return null;
  locations[index] = { ...locations[index], ...data };
  await writeJson(filePath, locations);
  return locations[index];
}

export async function deleteLocation(
  slug: string,
  locId: string
): Promise<boolean> {
  const dir = universePath(slug);
  const filePath = path.join(dir, "locations", "_index.json");
  const locations = (await readJson<Location[]>(filePath)) || [];
  const filtered = locations.filter((l) => l.id !== locId);
  if (filtered.length === locations.length) return false;
  await writeJson(filePath, filtered);
  return true;
}

// Rules
export async function addRule(
  slug: string,
  data: Omit<WorldRule, "id">
): Promise<WorldRule> {
  const dir = universePath(slug);
  const filePath = path.join(dir, "rules.json");
  const rules = (await readJson<WorldRule[]>(filePath)) || [];
  const rule: WorldRule = { id: nanoid(10), ...data };
  rules.push(rule);
  await writeJson(filePath, rules);
  return rule;
}

export async function deleteRule(
  slug: string,
  ruleId: string
): Promise<boolean> {
  const dir = universePath(slug);
  const filePath = path.join(dir, "rules.json");
  const rules = (await readJson<WorldRule[]>(filePath)) || [];
  const filtered = rules.filter((r) => r.id !== ruleId);
  if (filtered.length === rules.length) return false;
  await writeJson(filePath, filtered);
  return true;
}

// Timeline
export async function addTimelineEvent(
  slug: string,
  data: Omit<TimelineEvent, "id">
): Promise<TimelineEvent> {
  const dir = universePath(slug);
  const filePath = path.join(dir, "timeline.json");
  const timeline = (await readJson<TimelineEvent[]>(filePath)) || [];
  const event: TimelineEvent = { id: nanoid(10), ...data };
  timeline.push(event);
  await writeJson(filePath, timeline);
  return event;
}

export async function deleteTimelineEvent(
  slug: string,
  eventId: string
): Promise<boolean> {
  const dir = universePath(slug);
  const filePath = path.join(dir, "timeline.json");
  const timeline = (await readJson<TimelineEvent[]>(filePath)) || [];
  const filtered = timeline.filter((e) => e.id !== eventId);
  if (filtered.length === timeline.length) return false;
  await writeJson(filePath, filtered);
  return true;
}
