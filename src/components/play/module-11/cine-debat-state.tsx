"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useTypewriter } from "@/hooks/use-typewriter";
import type { Module11Data } from "@/hooks/use-session-polling";

interface CineDebatStateProps {
  module11: Module11Data;
  prompt: string;
  nudgeText: string | null;
  onSubmit: (text: string) => void;
  submitting: boolean;
}

// ── Theme colors ──
const THEME_COLORS: Record<string, string> = {
  raconter: "var(--color-bw-violet)",
  émotion: "#EC4899",
  héros: "var(--color-bw-primary)",
  coulisses: "#06B6D4",
};

const THEME_LABELS: Record<string, string> = {
  raconter: "L'Art de Raconter",
  émotion: "Émotions",
  héros: "Héros",
  coulisses: "Coulisses",
};

// ── Citation card ──
function CitationStimulus({ module11 }: { module11: Module11Data }) {
  return (
    <div className="space-y-3">
      {/* Quote */}
      <motion.blockquote
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative px-5 py-4 rounded-xl border border-white/[0.08]"
        style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(26,26,26,0.9))" }}
      >
        <span className="absolute top-2 left-3 text-3xl opacity-20" style={{ color: THEME_COLORS[module11.theme] }}>
          &ldquo;
        </span>
        <p className="text-base sm:text-lg font-medium text-bw-heading italic pl-4 pr-2">{module11.text}</p>
      </motion.blockquote>

      {/* Author card */}
      {module11.author && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-bw-elevated border border-white/[0.06]"
        >
          {module11.authorImageUrl && (
            <Image
              src={module11.authorImageUrl}
              alt={module11.author}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover border-2"
              style={{ borderColor: THEME_COLORS[module11.theme] }}
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-bw-heading text-sm">{module11.author}</p>
            {module11.authorRole && <p className="text-xs text-bw-muted">{module11.authorRole}</p>}
            {module11.authorBio && <p className="text-xs text-bw-text mt-0.5 line-clamp-2">{module11.authorBio}</p>}
          </div>
        </motion.div>
      )}

      {/* Filmography */}
      {module11.filmography && module11.filmography.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
        >
          {module11.filmography.map((film, i) => (
            <div key={i} className="flex-shrink-0 w-16 text-center">
              <Image
                src={`https://image.tmdb.org/t/p/w154${film.posterPath}`}
                alt={film.title}
                width={64}
                height={96}
                className="w-16 h-24 rounded-lg object-cover border border-white/[0.06]"
              />
              <p className="text-xs text-bw-muted mt-1 line-clamp-1">{film.title}</p>
              <p className="text-xs text-bw-muted/60">{film.year}</p>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ── Scene (YouTube) stimulus ──
function SceneStimulus({ module11 }: { module11: Module11Data }) {
  const src = module11.videoId
    ? `https://www.youtube.com/embed/${module11.videoId}?rel=0&modestbranding=1${
        module11.videoStart ? `&start=${module11.videoStart}` : ""
      }${module11.videoEnd ? `&end=${module11.videoEnd}` : ""}`
    : null;

  return (
    <div className="space-y-2">
      {src && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/[0.08]"
        >
          <iframe
            src={src}
            title={module11.sourceTitle || "Scène"}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </motion.div>
      )}
      {module11.sourceTitle && (
        <p className="text-xs text-bw-muted text-center">
          {module11.sourceTitle}
          {module11.sourceYear && <span className="ml-1">({module11.sourceYear})</span>}
        </p>
      )}
    </div>
  );
}

// ── Poster stimulus ──
function PosterStimulus({ module11 }: { module11: Module11Data }) {
  return (
    <div className="space-y-2">
      {module11.imageUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center"
        >
          <Image
            src={module11.imageUrl}
            alt={module11.sourceTitle || "Affiche"}
            width={300}
            height={450}
            className="max-h-[280px] sm:max-h-[340px] rounded-xl border border-white/[0.08] shadow-lg object-contain"
          />
        </motion.div>
      )}
      {module11.sourceTitle && (
        <p className="text-xs text-bw-muted text-center">
          {module11.sourceTitle}
          {module11.sourceYear && <span className="ml-1">({module11.sourceYear})</span>}
        </p>
      )}
    </div>
  );
}

// ── Debat (QCM) input ──
function DebatInput({
  module11,
  onSubmit,
  submitting,
}: {
  module11: Module11Data;
  onSubmit: (text: string) => void;
  submitting: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [justification, setJustification] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSelect(key: string) {
    setSelected(key);
    setTimeout(() => textareaRef.current?.focus({ preventScroll: true }), 100);
  }

  function handleSubmit() {
    if (!selected || !justification.trim() || submitting) return;
    const label = module11.debatOptions?.find((o) => o.key === selected)?.label || selected;
    onSubmit(`[${label}] ${justification.trim()}`);
  }

  return (
    <div className="space-y-3">
      {/* Options */}
      <div className="grid grid-cols-3 gap-2">
        {module11.debatOptions?.map((opt) => (
          <motion.button
            key={opt.key}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect(opt.key)}
            className={`px-3 py-3 rounded-xl text-sm font-medium transition-all border cursor-pointer ${
              selected === opt.key
                ? "border-bw-primary bg-bw-primary/10 text-bw-primary"
                : "border-white/[0.08] bg-bw-elevated text-bw-text hover:border-white/20"
            }`}
          >
            <span className="text-lg block mb-1">
              {opt.key === "daccord" ? "👍" : opt.key === "pasdaccord" ? "👎" : "🤔"}
            </span>
            <span className="text-xs">{opt.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Justification */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            <p className="text-xs text-bw-muted">Justifie ton choix :</p>
            <textarea
              ref={textareaRef}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Parce que..."
              maxLength={500}
              rows={2}
              className="w-full bw-script bg-bw-elevated border border-white/[0.06] rounded-xl p-3 text-bw-heading placeholder:text-bw-muted focus:border-bw-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-bw-primary/40 transition-colors resize-none"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-bw-muted">{justification.length}/500</span>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={!justification.trim() || submitting}
                className={`px-6 py-2.5 rounded-xl font-bold transition-all ${
                  justification.trim() && !submitting
                    ? "btn-glow text-white cursor-pointer shadow-lg"
                    : "bg-bw-elevated text-bw-muted cursor-not-allowed"
                }`}
                style={
                  justification.trim() && !submitting
                    ? {
                        background: "linear-gradient(135deg, var(--color-bw-primary), var(--color-bw-gold))",
                        boxShadow: "0 4px 15px rgba(255,107,53,0.3)",
                      }
                    : undefined
                }
              >
                {submitting ? "Envoi..." : "Envoyer"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Open text input (for citation, scene, poster) ──
function OpenInput({ onSubmit, submitting }: { onSubmit: (text: string) => void; submitting: boolean }) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  }

  return (
    <div className="space-y-2">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        placeholder="Ecris ta réponse ici..."
        rows={2}
        maxLength={500}
        className="w-full bw-script bg-bw-elevated border border-white/[0.06] rounded-xl p-4 text-bw-heading placeholder:text-bw-muted focus:border-bw-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-bw-primary/40 transition-colors resize-none overflow-hidden"
      />
      <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          animate={{
            width: `${(text.length / 500) * 100}%`,
            backgroundColor:
              text.length >= 480 ? "#EF4444" : text.length >= 400 ? "#F59E0B" : "var(--color-bw-primary)",
          }}
          transition={{ duration: 0.2 }}
        />
      </div>
      <div className="flex justify-between items-center">
        <span
          className={`text-xs transition-colors ${
            text.length >= 480 ? "text-bw-danger" : text.length >= 400 ? "text-bw-amber" : "text-bw-muted"
          }`}
        >
          {text.length}/500
        </span>
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={text.trim() && !submitting ? { scale: 1.03 } : undefined}
          onClick={() => {
            if (text.trim() && !submitting) onSubmit(text.trim());
          }}
          disabled={!text.trim() || submitting}
          className={`btn-glow px-6 py-2.5 sm:px-8 sm:py-3 rounded-xl font-bold transition-all ${
            text.trim() && !submitting
              ? "text-white cursor-pointer shadow-lg"
              : "bg-bw-elevated text-bw-muted cursor-not-allowed"
          }`}
          style={
            text.trim() && !submitting
              ? {
                  background: "linear-gradient(135deg, var(--color-bw-primary), var(--color-bw-gold))",
                  boxShadow: "0 4px 15px rgba(255,107,53,0.3)",
                }
              : undefined
          }
        >
          {submitting ? "Envoi..." : "Envoyer"}
        </motion.button>
      </div>
    </div>
  );
}

// ── Main component ──
export function CineDebatState({ module11, prompt, nudgeText, onSubmit, submitting }: CineDebatStateProps) {
  const { displayed, done, skip } = useTypewriter(prompt);
  const themeColor = THEME_COLORS[module11.theme] || "var(--color-bw-primary)";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-4 w-full"
    >
      {/* Theme badge */}
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
          style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
        >
          {module11.type === "citation"
            ? "💬 Citation"
            : module11.type === "scene"
              ? "🎬 Scène"
              : module11.type === "poster"
                ? "🖼️ Affiche"
                : "⚖️ Débat"}
        </span>
        <span className="text-xs text-bw-muted">{THEME_LABELS[module11.theme] || ""}</span>
      </div>

      {/* Stimulus */}
      {module11.type === "citation" && <CitationStimulus module11={module11} />}
      {module11.type === "scene" && <SceneStimulus module11={module11} />}
      {module11.type === "poster" && <PosterStimulus module11={module11} />}

      {/* Prompt */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Cliquer pour accelerer le texte"
        className="rounded-xl p-3 sm:p-4 min-h-[60px] text-base sm:text-lg leading-relaxed cursor-pointer border border-white/[0.06]"
        style={{ background: `linear-gradient(135deg, ${themeColor}08, rgba(26,26,26,0.8))` }}
        onClick={() => !done && skip()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            !done && skip();
          }
        }}
      >
        <p>{displayed}</p>
        {!done && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.6 }}
            className="inline-block w-0.5 h-5 bg-bw-primary ml-0.5 align-text-bottom"
          />
        )}
      </div>

      {/* Input — debat QCM or open text */}
      {done && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {module11.type === "debat" ? (
            <DebatInput module11={module11} onSubmit={onSubmit} submitting={submitting} />
          ) : (
            <OpenInput onSubmit={onSubmit} submitting={submitting} />
          )}
        </motion.div>
      )}

      {/* Nudge */}
      {nudgeText && done && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="glass-card border-bw-teal/20 px-4 py-3 flex items-start gap-2"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-bw-teal)"
            strokeWidth="2"
            strokeLinecap="round"
            className="mt-0.5 flex-shrink-0"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <p className="text-sm text-bw-teal italic">{nudgeText}</p>
        </motion.div>
      )}
    </motion.div>
  );
}
