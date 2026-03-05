"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { SuccessCheck } from "@/components/play/success-check";
import { ETSI_IMAGES } from "@/lib/module10-data";
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
  const [phase, setPhase] = useState<"select3" | "narrow1" | "write">(
    module10.etsiText ? "write" : "select3"
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [finalId, setFinalId] = useState<string | null>(module10.image?.id || null);
  const [text, setText] = useState(module10.etsiText || "");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [helpLoading, setHelpLoading] = useState(false);
  const [helpHint, setHelpHint] = useState<string | null>(null);
  const [helpCount, setHelpCount] = useState(0);

  const finalImage = finalId ? ETSI_IMAGES.find((i) => i.id === finalId) : null;

  function toggleSelect(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  async function handleSubmit() {
    if (!text.trim() || text.trim().length < 5 || !finalId) return;
    setSubmitting(true);
    try {
      await fetch(`/api/sessions/${sessionId}/etsi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, imageId: finalId, etsiText: text.trim(), helpUsed: helpCount > 0 }),
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
        body: JSON.stringify({ studentId, step: "etsi", helpType: type, context: text || finalImage?.description }),
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

      <AnimatePresence mode="wait">
        {/* ── Phase 1: Select 3 images from 10 ── */}
        {phase === "select3" && (
          <motion.div key="select3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}
            className="w-full space-y-3">
            <p className="text-sm text-bw-muted text-center">Choisis <strong className="text-bw-text">3 images</strong> qui t&apos;inspirent</p>
            <div className="grid grid-cols-2 gap-2">
              {ETSI_IMAGES.map((img) => {
                const isChosen = selected.includes(img.id);
                return (
                  <motion.button key={img.id} whileTap={{ scale: 0.95 }}
                    onClick={() => toggleSelect(img.id)}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      isChosen ? "border-bw-teal ring-2 ring-bw-teal/30" : "border-white/[0.06] hover:border-white/20"
                    }`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.title} className="w-full aspect-[4/3] object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-[10px] text-white font-medium">{img.title}</p>
                    </div>
                    {isChosen && (
                      <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-bw-teal flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
            <button onClick={() => setPhase("narrow1")} disabled={selected.length !== 3}
              className="w-full py-3 rounded-xl bg-bw-teal text-white font-medium text-sm disabled:opacity-40 transition-opacity cursor-pointer">
              Valider mes 3 images ({selected.length}/3)
            </button>
          </motion.div>
        )}

        {/* ── Phase 2: Narrow down to 1 ── */}
        {phase === "narrow1" && (
          <motion.div key="narrow1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}
            className="w-full space-y-3">
            <p className="text-sm text-bw-muted text-center">Maintenant, choisis <strong className="text-bw-text">1 seule image</strong> pour écrire</p>
            <div className="grid grid-cols-1 gap-3">
              {selected.map((imgId) => {
                const img = ETSI_IMAGES.find((i) => i.id === imgId);
                if (!img) return null;
                const isFinal = finalId === imgId;
                return (
                  <motion.button key={imgId} whileTap={{ scale: 0.97 }}
                    onClick={() => setFinalId(imgId)}
                    className={`flex gap-3 items-center p-2 rounded-xl border-2 transition-all cursor-pointer text-left ${
                      isFinal ? "border-bw-teal bg-bw-teal/10" : "border-white/[0.06] hover:border-white/20"
                    }`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.title} className="w-20 h-14 rounded-lg object-cover flex-shrink-0" />
                    <div>
                      <p className="text-sm text-bw-text font-medium">{img.title}</p>
                      <p className="text-[10px] text-bw-muted">{img.description}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setPhase("select3"); setFinalId(null); }}
                className="px-4 py-3 rounded-xl border border-white/[0.06] text-bw-muted text-sm cursor-pointer hover:border-white/20 transition-colors">
                Retour
              </button>
              <button onClick={() => setPhase("write")} disabled={!finalId}
                className="flex-1 py-3 rounded-xl bg-bw-teal text-white font-medium text-sm disabled:opacity-40 transition-opacity cursor-pointer">
                Écrire sur cette image
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Phase 3: Write "Et si..." ── */}
        {phase === "write" && (
          <motion.div key="write" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}
            className="w-full space-y-4">
            {finalImage && (
              <div className="w-full rounded-xl overflow-hidden border border-white/[0.06]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={finalImage.url} alt={finalImage.title} className="w-full object-contain" />
                <p className="text-xs text-bw-muted px-3 py-2">{finalImage.description}</p>
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
            <div className="flex gap-2">
              {!module10.etsiText && (
                <button onClick={() => setPhase("narrow1")}
                  className="px-4 py-3 rounded-xl border border-white/[0.06] text-bw-muted text-sm cursor-pointer hover:border-white/20 transition-colors">
                  Retour
                </button>
              )}
              <button onClick={handleSubmit} disabled={submitting || text.trim().length < 5}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-bw-teal to-bw-teal text-white font-medium text-sm disabled:opacity-40 transition-opacity cursor-pointer">
                {submitting ? "Envoi..." : "Envoyer mon « Et si... »"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
