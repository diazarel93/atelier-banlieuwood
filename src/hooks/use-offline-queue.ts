"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { useOnlineStatus } from "@/hooks/use-online-status";
import {
  enqueue,
  flush,
  count as queueCount,
  type QueuedAction,
} from "@/lib/offline-queue";

let idCounter = 0;

async function executeAction(action: QueuedAction): Promise<boolean> {
  const res = await fetch(action.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: action.body,
  });
  return res.ok;
}

export function useOfflineQueue() {
  const isOnline = useOnlineStatus();
  const wasOnline = useRef(true);
  const [pendingCount, setPendingCount] = useState(0);

  // Sync count on mount
  useEffect(() => {
    setPendingCount(queueCount());
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
            toast.error(`${failed} réponse(s) n'ont pas pu être envoyées`);
          }
        });
      }
    }
    wasOnline.current = isOnline;
  }, [isOnline]);

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
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
