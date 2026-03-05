"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { SuccessCheck } from "@/components/play/success-check";
import type { Module10Data } from "@/hooks/use-session-polling";

export interface EtsiWriterStateProps {
  module10: Module10Data;
  sessionId: string;
  studentId: string;
  onDone: () => void;
}

export function EtsiWriterState({
  module10, sessionId, studentId, onDone,
}: EtsiWriterStateProps) {
  const [text, setText] = useState(module10.etsiText || "");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [helpLoading, setHelpLoading] = useState(false);
  const [helpHint, setHelpHint] = useState<string | null>(null);
  const [helpCount, setHelpCount] = useState(0);

  const image = module10.image;

  async function handleSubmit() {
    if (!text.trim() || text.trim().length < 5) return;
    setSubmitting(true);
    try {
      await fetch(`/api/sessions/${sessionId}/etsi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, imageId: image?.id, etsiText: text.trim(), helpUsed: helpCount > 0 }),
      });
      setSuccess(true);
      setTimeout(() => onDone(), 600);
    } catch { toast.error("Erreur d'envoi"); setSubmitting(false); }
  }

  if (success) return <SuccessCheck />;

  async function handleHelp(type: string) {
    setHelpLoading(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/help-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, step: "etsi", helpType: type, context: text || image?.description }),
      });
      const data = await res.json();
      if (data.hint) { setHelpHint(data.hint); setHelpCount((c) => c + 1); }
      else if (data.error) toast.error(data.error);
    } catch { toast.error("Erreur"); }
    finally { setHelpLoading(false); }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center gap-4 w-full max-w-md mx-auto px-4">
      <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-bw-teal/20 text-bw-teal">
        Et si...
      </span>
      {image && (
        <div className="w-full rounded-xl overflow-hidden border border-white/[0.06]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.url} alt={image.title} className="w-full object-contain" />
          <p className="text-xs text-bw-muted px-3 py-2">{image.description}</p>
        </div>
      )}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Et si..."
        rows={4}
        maxLength={500}
        className="w-full rounded-xl bg-bw-elevated border border-white/[0.06] p-3 text-sm text-bw-text placeholder:text-bw-muted resize-none focus:border-bw-teal focus:outline-none transition-colors"
      />
      <div className="flex items-center gap-2 w-full">
        <div className="flex gap-1">
          {["example", "starter", "reformulate"].map((type) => (
            <button key={type} onClick={() => handleHelp(type)} disabled={helpLoading || helpCount >= 3}
              className="px-2 py-1 text-[10px] rounded-lg bg-bw-elevated border border-white/[0.06] text-bw-muted hover:text-bw-teal hover:border-bw-teal/30 disabled:opacity-30 transition-colors cursor-pointer">
              {type === "example" ? "💡 Exemple" : type === "starter" ? "✏️ Amorce" : "🔄 Reformuler"}
            </button>
          ))}
        </div>
        {helpCount > 0 && <span className="text-[10px] text-bw-muted">{3 - helpCount} aide(s) restante(s)</span>}
      </div>
      <AnimatePresence>
        {helpHint && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="w-full p-3 rounded-xl bg-bw-teal/10 border border-bw-teal/20 text-xs text-bw-teal">
            {helpHint}
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={handleSubmit} disabled={submitting || text.trim().length < 5}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-bw-teal to-bw-teal text-white font-medium text-sm disabled:opacity-40 transition-opacity cursor-pointer">
        {submitting ? "Envoi..." : "Envoyer mon « Et si... »"}
      </button>
    </motion.div>
  );
}
