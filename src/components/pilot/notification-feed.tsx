"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

export interface FeedNotification {
  id: string;
  text: string;
  icon: string;
  category: "response" | "vote" | "system" | "technique";
  timestamp: Date;
}

interface NotificationFeedProps {
  notifications: FeedNotification[];
  onClear: () => void;
}

export function NotificationFeed({ notifications, onClear }: NotificationFeedProps) {
  const [soundOn, setSoundOn] = useState(true);

  const toggleSound = useCallback(() => setSoundOn((s) => !s), []);

  const formatTime = (date: Date) => {
    const diff = Math.round((Date.now() - date.getTime()) / 1000);
    if (diff < 10) return "maintenant";
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}min`;
    return `${Math.floor(diff / 3600)}h`;
  };

  const catColor: Record<string, string> = {
    response: "var(--color-bw-primary)",
    vote: "var(--color-bw-gold, var(--color-bw-gold))",
    system: "var(--color-bw-green, #10B981)",
    technique: "var(--color-bw-danger, #EF4444)",
  };

  return (
    <div className="rounded-2xl border border-[var(--color-bw-border)] bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-bw-border)]">
        <div className="flex items-center gap-2">
          <span className="text-sm">📻</span>
          <span className="text-xs font-bold text-bw-heading">Activite</span>
          {notifications.length > 0 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-bw-primary/10 text-bw-primary">
              {notifications.length}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleSound}
            className="text-[10px] font-semibold px-2 py-1 rounded-md border border-[var(--color-bw-border)] bg-[var(--color-bw-surface-dim)] cursor-pointer transition-colors"
            style={{ color: soundOn ? "var(--color-bw-green, #10B981)" : "var(--color-bw-muted)" }}
          >
            {soundOn ? "🔊 Son" : "🔇 Muet"}
          </button>
          {notifications.length > 0 && (
            <button
              onClick={onClear}
              className="text-[10px] font-semibold px-2 py-1 rounded-md border cursor-pointer transition-colors"
              style={{
                background: "var(--color-bw-danger, #EF4444)10",
                borderColor: "var(--color-bw-danger, #EF4444)33",
                color: "var(--color-bw-danger, #EF4444)",
              }}
            >
              Effacer
            </button>
          )}
        </div>
      </div>

      <div className="max-h-[200px] overflow-y-auto">
        {notifications.length === 0 && (
          <div className="py-6 text-center text-xs text-bw-muted">Aucune activite recente</div>
        )}
        <AnimatePresence initial={false}>
          {notifications.slice(0, 8).map((n, i) => (
            <motion.div
              key={n.id}
              initial={i === 0 ? { opacity: 0, y: -10 } : false}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 px-4 py-2 text-xs border-b border-[var(--color-bw-border-subtle)] last:border-0"
              style={{
                borderLeftWidth: 3,
                borderLeftStyle: "solid",
                borderLeftColor: catColor[n.category] || catColor.system,
              }}
            >
              <span className="text-sm shrink-0">{n.icon}</span>
              <span className="flex-1 text-bw-heading truncate">{n.text}</span>
              <span className="text-[10px] text-bw-muted shrink-0">{formatTime(n.timestamp)}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
