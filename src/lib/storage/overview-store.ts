import { readJson, overviewPath } from "./fs-adapter";
import { OverviewData, OverviewDataSchema } from "../models/overview";

export async function getOverview(slug: string): Promise<OverviewData> {
  const filePath = overviewPath(slug);
  const raw = await readJson<OverviewData>(filePath);
  if (!raw) {
    return { sections: [] };
  }
  return OverviewDataSchema.parse(raw);
}
