"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useSound } from "@/hooks/use-sound";

interface BroadcastState {
  broadcastHistory: { text: string; sentAt: Date }[];
  handleBroadcast: (message: string) => void;
  handleNudgeAllStuck: (notRespondedCount: number) => void;
}

export function useCockpitBroadcast(
  updateSession: { mutate: (updates: Record<string, unknown>) => void },
  closeModal: () => void,
): BroadcastState {
  const [broadcastHistory, setBroadcastHistory] = useState<{ text: string; sentAt: Date }[]>([]);
  const { play } = useSound();

  const handleBroadcast = useCallback(
    (message: string) => {
      updateSession.mutate({ broadcast_message: message, broadcast_at: new Date().toISOString() });
      setBroadcastHistory((prev) => [{ text: message, sentAt: new Date() }, ...prev].slice(0, 10));
      closeModal();
      play("send");
      toast.success("Message envoyé à toute la classe");
    },
    [updateSession, closeModal, play],
  );

  const handleNudgeAllStuck = useCallback(
    (notRespondedCount: number) => {
      updateSession.mutate({
        broadcast_message: "N'oubliez pas de répondre à la question !",
        broadcast_at: new Date().toISOString(),
      });
      play("send");
      toast.success(`Relance envoyée à la classe (${notRespondedCount} en attente)`);
    },
    [updateSession, play],
  );

  return { broadcastHistory, handleBroadcast, handleNudgeAllStuck };
}
