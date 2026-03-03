"use client";

import { useQuery } from "@tanstack/react-query";
import type { OverviewData } from "@/lib/models/overview";

export function useOverview(slug: string) {
  return useQuery<OverviewData>({
    queryKey: ["overview", slug],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${slug}/overview`);
      if (!res.ok) throw new Error("Failed to fetch overview");
      return res.json();
    },
    enabled: !!slug,
  });
}
