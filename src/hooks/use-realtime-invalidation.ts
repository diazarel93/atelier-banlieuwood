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
    ["session-state", sid],
    ["screen-votes", sid],
    ["pilot-votes", sid],
  ],
  students: (sid) => [
    ["session-state", sid],
    ["session", sid],
  ],
  collective_choices: (sid) => [
    ["session-state", sid],
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

/**
 * Tables that use postgres_changes (child tables with session_id FK).
 * The `sessions` table is handled via broadcast instead (RLS blocks
 * postgres_changes for unauthenticated student clients).
 */
const CHILD_TABLES = Object.keys(TABLE_INVALIDATION_MAP).filter((t) => t !== "sessions");

/**
 * Subscribe to Supabase Realtime changes for a session.
 *
 * Two mechanisms:
 * 1. **postgres_changes** for child tables (responses, votes, students, etc.)
 *    — filtered by session_id, works for authenticated clients.
 * 2. **broadcast** for session-level changes (status, question, timer, etc.)
 *    — sent by the PATCH API route, received by ALL clients (no RLS).
 *
 * Fallback: 30s polling via refetchInterval on each query.
 */
export function useRealtimeInvalidation(sessionId: string) {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const supabase = createClient();
    const channel = supabase.channel(`session-${sessionId}`);

    // 1. postgres_changes for child tables (filtered by session_id)
    for (const table of CHILD_TABLES) {
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

    // 2. Broadcast for session-level changes (bypasses RLS — works for students)
    channel.on("broadcast", { event: "session-update" }, () => {
      const keys = TABLE_INVALIDATION_MAP.sessions(sessionId);
      for (const key of keys) {
        queryClient.invalidateQueries({ queryKey: key });
      }
    });

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [sessionId, queryClient]);
}
