"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { Module10Data } from "@/hooks/use-session-polling";

export interface IdeaBankStateProps {
  module10: Module10Data;
  sessionId: string;
  studentId: string;
  onDone: () => void;
}

export function IdeaBankState({
  module10, sessionId, studentId, onDone,
}: IdeaBankStateProps) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const ideas = module10.ideaBankItems || [];

  async function handleSubmit() {
    if (!text.trim() || text.trim().length < 5) return;
    setSubmitting(true);
    try {
      await fetch(`/api/sessions/${sessionId}/idea-bank`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, text: text.trim() }),
      });
      setText("");
      onDone();
    } catch { toast.error("Erreur"); }
    finally { setSubmitting(false); }
  }

  async function handleVote(ideaId: string) {
    if (voted.has(ideaId)) return;
    setVoted((prev) => new Set(prev).add(ideaId));
    try {
      const res = await fetch(`/api/sessions/${sessionId}/idea-bank`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId, studentId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.alreadyVoted) return; // Already voted server-side, no error
        setVoted((prev) => { const next = new Set(prev); next.delete(ideaId); return next; });
      }
    } catch {
      setVoted((prev) => { const next = new Set(prev); next.delete(ideaId); return next; });
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center gap-4 w-full max-w-md mx-auto px-4">
      <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-bw-teal/20 text-bw-teal">
        Banque d&apos;idées
      </span>
      {ideas.length > 0 && (
        <div className="w-full space-y-2 max-h-60 overflow-y-auto">
          {ideas.map((idea) => (
            <div key={idea.id} className="flex items-start gap-2 p-2 rounded-lg bg-bw-elevated border border-white/[0.06]">
              <p className="flex-1 text-xs text-bw-text">{idea.text}</p>
              <button onClick={() => handleVote(idea.id)} disabled={voted.has(idea.id)}
                className="shrink-0 px-2 py-1 text-[10px] rounded-lg bg-bw-teal/10 text-bw-teal hover:bg-bw-teal/20 disabled:opacity-40 transition-colors cursor-pointer">
                ❤️ {idea.votes + (voted.has(idea.id) ? 1 : 0)}
              </button>
            </div>
          ))}
        </div>
      )}
      {!module10.submitted && (
        <>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Partage ton « Et si... » préféré..." rows={2} maxLength={300}
            className="w-full rounded-xl bg-bw-elevated border border-white/[0.06] p-3 text-sm text-bw-text placeholder:text-bw-muted resize-none focus:border-bw-teal focus:outline-none transition-colors" />
          <button onClick={handleSubmit} disabled={submitting || text.trim().length < 5}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-bw-teal to-bw-teal text-white font-medium text-sm disabled:opacity-40 transition-opacity cursor-pointer">
            {submitting ? "Envoi..." : "Partager mon idée"}
          </button>
        </>
      )}
    </motion.div>
  );
}
