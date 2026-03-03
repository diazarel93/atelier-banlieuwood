import { z } from "zod";

export const OverviewSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  icon: z.string(),
  content: z.string(),
});

export type OverviewSection = z.infer<typeof OverviewSectionSchema>;

export const OverviewDataSchema = z.object({
  sections: z.array(OverviewSectionSchema).default([]),
});

export type OverviewData = z.infer<typeof OverviewDataSchema>;
