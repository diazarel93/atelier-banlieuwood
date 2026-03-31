"use client";

import { useCockpitData } from "@/components/pilot/cockpit-context";
import { ResponseStream } from "@/components/pilot/response-stream";
import type { ResponseCardResponse } from "@/components/pilot/response-card";

export function ProjectionResponsesDrawer() {
  const { responses } = useCockpitData();

  const streamResponses = responses as ResponseCardResponse[];

  return (
    <div className="h-full overflow-y-auto">
      <ResponseStream responses={streamResponses} />
    </div>
  );
}
