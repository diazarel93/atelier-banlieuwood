"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type ConnectionStatus = "connected" | "connecting" | "disconnected";

/**
 * Returns the appropriate polling interval based on realtime connection status.
 * When connected, use a slow interval (heartbeat). When disconnected, poll faster.
 */
export function getPollingInterval(
  status: ConnectionStatus | undefined,
  fastMs: number,
  slowMs: number
): number {
  return status === "connected" ? slowMs : fastMs;
}

const TABLE_INVALIDATION_MAP: Record<string, (sessionId: string) => string[][]> = {
  sessions: (sid) => [
    ["session-state", sid],
    ["pilot-session", sid],
    ["session", sid],
    ["screen-reveal", sid],
  ],
  responses: (sid) => [
    ["session-state", sid],
    ["pilot-responses", sid],
    ["screen-highlighted", sid],
    ["screen-wordcloud", sid],
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
  module6_scenes: (sid) => [["session-state", sid], ["m6-scenes", sid]],
  module6_missions: (sid) => [["session-state", sid], ["m6-missions", sid]],
  module6_scenario: (sid) => [["session-state", sid], ["m6-scenario", sid]],
  module7_comparisons: (sid) => [["session-state", sid], ["m7-comparisons", sid]],
  module7_decoupages: (sid) => [["session-state", sid], ["m7-decoupages", sid]],
  module7_storyboard: (sid) => [["session-state", sid], ["m7-storyboard", sid]],
  module8_quiz: (sid) => [["session-state", sid], ["m8-quiz", sid]],
  module8_roles: (sid) => [["session-state", sid], ["m8-roles", sid]],
  module8_points: (sid) => [["session-state", sid], ["m8-points", sid]],
  module8_talent_cards: (sid) => [["session-state", sid], ["m8-talent-cards", sid]],
};

const CHILD_TABLES = Object.keys(TABLE_INVALIDATION_MAP).filter((t) => t !== "sessions");

const MAX_RETRIES = 5;
const BACKOFF_BASE_MS = 2000;
const BACKOFF_MAX_MS = 30000;

/**
 * Subscribe to Supabase Realtime changes for a session.
 *
 * Two mechanisms:
 * 1. **postgres_changes** for child tables (responses, votes, students, etc.)
 * 2. **broadcast** for session-level changes (status, question, timer, etc.)
 *
 * Features:
 * - Exponential backoff reconnection (2s → 4s → 8s → 16s → 30s, max 5 retries)
 * - Granular M6/M7/M8 query keys for targeted invalidation
 * - Clean channel unsubscribe + removal on cleanup
 *
 * Returns `{ status }` — the current connection status.
 */
export function useRealtimeInvalidation(sessionId: string): { status: ConnectionStatus } {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const retryRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  // Bump to trigger re-subscription via useEffect
  const [epoch, setEpoch] = useState(0);

  useEffect(() => {
    if (!sessionId) return;

    setStatus("connecting");

    let supabase: ReturnType<typeof createClient>;
    let channel: RealtimeChannel;

    try {
      supabase = createClient();
      channel = supabase.channel(`session-${sessionId}`);
    } catch (err) {
      // WebSocket not available (iPad Safari insecure context) — fallback to polling
      console.warn("[Realtime] WebSocket unavailable, falling back to polling:", (err as Error).message);
      setStatus("disconnected");
      return;
    }

    // postgres_changes for child tables (filtered by session_id)
    for (const table of CHILD_TABLES) {
      channel.on(
        "postgres_changes" as const,
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

    // Broadcast for session-level changes (bypasses RLS)
    channel.on("broadcast", { event: "session-update" }, () => {
      const keys = TABLE_INVALIDATION_MAP.sessions(sessionId);
      for (const key of keys) {
        queryClient.invalidateQueries({ queryKey: key });
      }
    });

    try {
      channel.subscribe((channelStatus) => {
        if (channelStatus === "SUBSCRIBED") {
          setStatus("connected");
          retryRef.current = 0;
        } else if (
          channelStatus === "CLOSED" ||
          channelStatus === "CHANNEL_ERROR" ||
          channelStatus === "TIMED_OUT"
        ) {
          setStatus("disconnected");
          // Schedule reconnect with exponential backoff
          if (retryRef.current < MAX_RETRIES) {
            const delay = Math.min(
              BACKOFF_BASE_MS * Math.pow(2, retryRef.current),
              BACKOFF_MAX_MS
            );
            retryRef.current += 1;
            retryTimerRef.current = setTimeout(() => setEpoch((e) => e + 1), delay);
          }
        }
      });
    } catch (err) {
      // WebSocket subscribe threw (iPad Safari "The operation is insecure")
      console.warn("[Realtime] Subscribe failed, falling back to polling:", (err as Error).message);
      setStatus("disconnected");
      return;
    }

    channelRef.current = channel;

    return () => {
      // Clear pending retry timer
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      // Unsubscribe then remove channel
      try {
        channel.unsubscribe();
        supabase.removeChannel(channel);
      } catch {
        // Ignore cleanup errors
      }
      channelRef.current = null;
    };
  }, [sessionId, queryClient, epoch]);

  // Reset retries when tab becomes visible again (student picks up phone)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && retryRef.current >= MAX_RETRIES) {
        retryRef.current = 0;
        setEpoch((e) => e + 1);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return { status };
}
