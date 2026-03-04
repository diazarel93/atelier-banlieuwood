"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Map of Supabase table names → TanStack Query keys to invalidate.
 * When a row changes in the table (filtered by session_id), all listed
 * query keys are invalidated, triggering a refetch.
 */
const TABLE_INVALIDATION_MAP: Record<string, (sessionId: string) => string[][]> = {
  sessions: (sid) => [
    ["session-state", sid],
    ["pilot-session", sid],
    ["session", sid],
  ],
  responses: (sid) => [
    ["session-state", sid],
    ["pilot-responses", sid],
  ],
  votes: (sid) => [
    ["screen-votes", sid],
    ["pilot-votes", sid],
  ],
  students: (sid) => [
    ["session-state", sid],
    ["session", sid],
  ],
  collective_choices: (sid) => [
    ["screen-all-choices", sid],
    ["pilot-choices", sid],
  ],
  module2_budgets: (sid) => [
    ["budget", sid],
  ],
  response_reactions: (sid) => [
    ["screen-reactions", sid],
  ],
  teams: (sid) => [
    ["pilot-teams", sid],
    ["session-state", sid],
  ],
};

const SUBSCRIBED_TABLES = Object.keys(TABLE_INVALIDATION_MAP);

/**
 * Subscribe to Supabase Realtime changes for a session.
 * On any INSERT/UPDATE/DELETE in the subscribed tables (filtered by session_id),
 * the corresponding TanStack Query keys are invalidated for an instant refetch.
 *
 * This replaces aggressive polling (3-10s) with a 30s fallback safety net.
 */
export function useRealtimeInvalidation(sessionId: string) {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const supabase = createClient();
    const channel = supabase.channel(`session-${sessionId}`);

    // Subscribe to each table's changes filtered by session_id
    for (const table of SUBSCRIBED_TABLES) {
      channel.on(
        "postgres_changes" as "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          const keys = TABLE_INVALIDATION_MAP[table](sessionId);
          for (const key of keys) {
            queryClient.invalidateQueries({ queryKey: key });
          }
        }
      );
    }

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [sessionId, queryClient]);
}
