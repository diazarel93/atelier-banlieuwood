"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { useOnlineStatus } from "@/hooks/use-online-status";
import {
  enqueue,
  flush,
  count as queueCount,
  clearStale,
  type QueuedAction,
} from "@/lib/offline-queue";

let idCounter = 0;

function getStudentToken(url: string): string | null {
  try {
    const match = url.match(/\/sessions\/([^/]+)\//);
    if (!match) return null;
    return localStorage.getItem(`bw-student-token-${match[1]}`);
  } catch {
    return null;
  }
}

async function executeAction(action: QueuedAction): Promise<boolean> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getStudentToken(action.url);
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(action.url, {
    method: "POST",
    headers,
    body: action.body,
  });
  return res.ok;
}

export function useOfflineQueue() {
  const isOnline = useOnlineStatus();
  const wasOnline = useRef(true);
  const [pendingCount, setPendingCount] = useState(0);

  // Sync count on mount + clear stale entries
  useEffect(() => {
    clearStale();
    setPendingCount(queueCount());
  }, []);

  const retryFlush = useCallback(() => {
    const pending = queueCount();
    if (pending === 0) return;
    flush(executeAction).then(({ sent, failed }) => {
      setPendingCount(queueCount());
      if (sent > 0) {
        toast.success(
          sent === 1
            ? "Réponse envoyée !"
            : `${sent} réponses envoyées !`
        );
      }
      if (failed > 0) {
        toast.error(`${failed} réponse(s) n'ont pas pu être envoyées`, {
          action: {
            label: "Réessayer",
            onClick: () => retryFlush(),
          },
          duration: 8000,
        });
      }
    });
  }, []);

  // Auto-flush when coming back online
  useEffect(() => {
    if (isOnline && !wasOnline.current) {
      const pending = queueCount();
      if (pending > 0) {
        flush(executeAction).then(({ sent, failed }) => {
          setPendingCount(queueCount());
          if (sent > 0) {
            toast.success(
              sent === 1
                ? "Réponse envoyée !"
                : `${sent} réponses envoyées !`
            );
          }
          if (failed > 0) {
            toast.error(`${failed} réponse(s) n'ont pas pu être envoyées`, {
              action: {
                label: "Réessayer",
                onClick: () => retryFlush(),
              },
              duration: 8000,
            });
          }
        });
      }
    }
    wasOnline.current = isOnline;
  }, [isOnline, retryFlush]);

  const submitWithQueue = useCallback(
    async (
      url: string,
      body: Record<string, unknown>,
      type: "respond" | "vote"
    ): Promise<{ ok: boolean; data?: unknown }> => {
      const jsonBody = JSON.stringify(body);

      if (!navigator.onLine) {
        // Offline — enqueue directly
        enqueue({
          id: `${Date.now()}-${++idCounter}`,
          type,
          url,
          body: jsonBody,
          timestamp: Date.now(),
        });
        setPendingCount(queueCount());
        toast.info("Réponse enregistrée, envoi dès le retour du réseau", {
          duration: 3000,
        });
        return { ok: true };
      }

      // Online — try normal fetch
      try {
        const fetchHeaders: Record<string, string> = { "Content-Type": "application/json" };
        const token = getStudentToken(url);
        if (token) fetchHeaders["Authorization"] = `Bearer ${token}`;
        const res = await fetch(url, {
          method: "POST",
          headers: fetchHeaders,
          body: jsonBody,
        });

        if (res.ok) {
          const data = await res.json().catch(() => null);
          return { ok: true, data };
        }

        // Rate limited — friendly feedback
        if (res.status === 429) {
          toast.warning("Doucement ! Attends quelques secondes avant de réessayer.", {
            duration: 4000,
          });
          return { ok: false, data: { error: "rate_limited" } };
        }

        // 409 Conflict — session advanced past this question
        if (res.status === 409) {
          const errData = await res.json().catch(() => null);
          toast.info("La question a changé, ta réponse arrive sur la nouvelle question", {
            duration: 4000,
          });
          return { ok: false, data: { ...errData, code: "SITUATION_ADVANCED" } };
        }

        // Server error (not network) — don't queue, let caller handle
        const errData = await res.json().catch(() => null);
        return { ok: false, data: errData };
      } catch {
        // Network error — enqueue
        enqueue({
          id: `${Date.now()}-${++idCounter}`,
          type,
          url,
          body: jsonBody,
          timestamp: Date.now(),
        });
        setPendingCount(queueCount());
        toast.info("Réponse enregistrée, envoi dès le retour du réseau", {
          duration: 3000,
        });
        return { ok: true };
      }
    },
    []
  );

  return { submitWithQueue, pendingCount };
}
