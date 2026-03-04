"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { useSessionPolling, SessionState, Module1Data, Module5Data, Module10Data } from "@/hooks/use-session-polling";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useSound } from "@/hooks/use-sound";
import { CATEGORY_COLORS, SEANCE_SITUATIONS, MODULE_SEANCE_SITUATIONS, PRODUCTION_CATEGORIES, BUDGET_TOTAL, BUDGET_RESERVE_MIN, generateBudgetSummary, TOTAL_SITUATIONS, getSeanceMax } from "@/lib/constants";
import { CountdownTimer } from "@/components/countdown-timer";
import { BrandLogo } from "@/components/brand-logo";
import { DiceBearAvatar } from "@/components/avatar-dicebear";
import {
  AVATAR_SKIN_COLOR, AVATAR_TOP, AVATAR_HAIR_COLOR, AVATAR_EYES, AVATAR_EYEBROWS,
  AVATAR_MOUTH, AVATAR_CLOTHING, AVATAR_CLOTHES_COLOR, AVATAR_ACCESSORIES,
  AVATAR_FACIAL_HAIR, AVATAR_HEADWEAR, AVATAR_GRAPHIC, AVATAR_BACKGROUND,
} from "@/lib/module10-data";
import type { AvatarOptions } from "@/components/avatar-dicebear";
import { CharacterCard } from "@/components/module10/character-card";
import { StoryboardViewer } from "@/components/module10/storyboard-viewer";


// ——— Confetti helper ———
function fireConfetti() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#FF6B35", "#4ECDC4", "#D4A843", "#8B5CF6", "#F59E0B"],
  });
  if (navigator.vibrate) navigator.vibrate([15, 50, 15]);
}

function haptic(ms = 10) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

/** Micro-celebration: animated green checkmark shown between situations */
function SuccessCheck() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex flex-col items-center justify-center gap-3 py-12"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center"
      >
        <motion.svg
          width="32" height="32" viewBox="0 0 24 24" fill="none"
          stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <polyline points="20 6 9 17 4 12" />
        </motion.svg>
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-emerald-400 font-medium"
      >
        Envoyé !
      </motion.p>
    </motion.div>
  );
}

// ——— Cinematic Title Screen ———
function CinematicIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"clap" | "title" | "fade">("clap");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("title"), 800);
    const t2 = setTimeout(() => setPhase("fade"), 2200);
    const t3 = setTimeout(onComplete, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-bw-bg flex items-center justify-center"
      animate={phase === "fade" ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Clap board */}
      <AnimatePresence mode="wait">
        {phase === "clap" && (
          <motion.div
            key="clap"
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className="flex flex-col items-center gap-4"
          >
            {/* Clap board SVG */}
            <div className="relative w-28 h-28">
              {/* Board body */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-bw-elevated to-[#08090E] border-2 border-bw-gold/40 flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M2 8h20" />
                  <path d="M8 4l-2 4" /><path d="M14 4l-2 4" /><path d="M20 4l-2 4" />
                </svg>
              </div>
              {/* Clap top — animated */}
              <motion.div
                className="absolute -top-3 left-2 right-2 h-6 rounded-t-lg bg-bw-gold origin-bottom-left"
                initial={{ rotate: -30 }}
                animate={{ rotate: [null, 0] }}
                transition={{ delay: 0.3, duration: 0.15, ease: "easeIn" }}
              >
                <div className="h-full flex items-center justify-center">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="w-3 h-1 bg-bw-bg rounded-full" />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {(phase === "title" || phase === "fade") && (
          <motion.div
            key="title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-3"
          >
            <h1 className="text-4xl font-bold tracking-wider font-cinema">
              BANLIEU<span className="text-bw-primary">WOOD</span>
            </h1>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.3, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="h-px bg-gradient-to-r from-transparent via-bw-gold to-transparent mx-auto max-w-[200px]"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xs text-bw-gold tracking-[0.3em] uppercase"
            >
              Action !
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ——— Cinema Fade Transition wrapper ———
function CinemaFade({ children, viewKey }: { children: React.ReactNode; viewKey: string }) {
  return (
    <motion.div
      key={viewKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Brief black flash on enter */}
      <motion.div
        className="fixed inset-0 z-30 bg-bw-bg pointer-events-none"
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      />
      {children}
    </motion.div>
  );
}

// ——— Typewriter Hook (per-word, not per-letter) ———
function useTypewriter(text: string, msPerWord = 30) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    if (!text) return;

    const words = text.split(/(\s+)/); // Split keeping whitespace
    let wordIndex = 0;
    const interval = setInterval(() => {
      wordIndex++;
      setDisplayed(words.slice(0, wordIndex).join(""));
      if (wordIndex >= words.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, msPerWord);

    return () => clearInterval(interval);
  }, [text, msPerWord]);

  function skip() {
    setDisplayed(text);
    setDone(true);
  }

  return { displayed, done, skip };
}

// ——— State: WAITING ———
function WaitingState({ session, connectedCount }: { session: SessionState["session"]; connectedCount: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center gap-6 text-center"
    >
      {/* Animated film reel */}
      <div className="relative">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, rgba(255,107,53,0.2), rgba(212,168,67,0.15))" }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
              <circle cx="12" cy="5" r="1" fill="#D4A843" stroke="none" />
              <circle cx="17.5" cy="9" r="1" fill="#D4A843" stroke="none" />
              <circle cx="17.5" cy="15" r="1" fill="#D4A843" stroke="none" />
              <circle cx="12" cy="19" r="1" fill="#D4A843" stroke="none" />
              <circle cx="6.5" cy="15" r="1" fill="#D4A843" stroke="none" />
              <circle cx="6.5" cy="9" r="1" fill="#D4A843" stroke="none" />
            </svg>
          </motion.div>
        </motion.div>
        {/* Glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: "2px solid rgba(255,107,53,0.2)" }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
        />
      </div>

      <div className="space-y-2">
        <h2
          className="text-3xl tracking-wider font-cinema"
        >
          EN ATTENTE
        </h2>
        <div className="h-0.5 w-12 mx-auto rounded-full bg-gradient-to-r from-bw-primary to-bw-gold" />
        <p className="text-bw-muted text-sm">
          Le facilitateur va bientôt lancer la question...
        </p>
      </div>

      <div className="rounded-xl px-6 py-3 flex items-center gap-3" style={{ background: "linear-gradient(135deg, rgba(78,205,196,0.08), rgba(78,205,196,0.03))", border: "1px solid rgba(78,205,196,0.15)" }}>
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-2.5 h-2.5 rounded-full bg-bw-teal"
        />
        <span className="text-sm text-bw-teal font-medium">
          {connectedCount} connecté{connectedCount > 1 ? "s" : ""}
        </span>
      </div>

      {session.title && (
        <p className="text-xs text-bw-gold tracking-[0.2em] uppercase font-medium">{session.title}</p>
      )}

      {/* Library link */}
      <a
        href={`/play/${session.id}/bibliotheque`}
        className="flex items-center gap-2 text-xs text-bw-muted hover:text-white/60 transition-colors mt-2"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
        Ma bibliothèque
      </a>
    </motion.div>
  );
}

// ——— State: SITUATION (responding) ———
function SituationState({
  situation,
  onSubmit,
  submitting,
}: {
  situation: NonNullable<SessionState["situation"]>;
  onSubmit: (text: string) => void;
  submitting: boolean;
}) {
  const [text, setText] = useState("");
  const { displayed, done, skip } = useTypewriter(situation.prompt);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus when typewriter finishes
  useEffect(() => {
    if (done && textareaRef.current) {
      textareaRef.current.focus({ preventScroll: true });
    }
  }, [done]);

  // Auto-resize textarea
  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  }

  function handleSubmit() {
    if (!text.trim() || submitting) return;
    onSubmit(text.trim());
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-5 w-full"
    >
      {/* Prompt with typewriter */}
      <div
        className="rounded-xl p-5 min-h-[120px] text-lg leading-relaxed cursor-pointer border border-white/[0.06]"
        style={{ background: "linear-gradient(135deg, rgba(255,107,53,0.06), rgba(26,26,26,0.8))" }}
        onClick={() => !done && skip()}
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

      {/* Text input area */}
      <div className="space-y-3">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          placeholder="Écris ta réponse ici..."
          rows={2}
          maxLength={500}
          className="w-full bw-script bg-bw-elevated border border-white/[0.06] rounded-xl p-4 text-bw-heading placeholder:text-bw-muted focus:border-bw-primary focus:outline-none transition-colors resize-none overflow-hidden"
        />

        {/* Character progress bar */}
        <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            animate={{
              width: `${(text.length / 500) * 100}%`,
              backgroundColor: text.length >= 480 ? "#EF4444" : text.length >= 400 ? "#F59E0B" : "#FF6B35",
            }}
            transition={{ duration: 0.2 }}
          />
        </div>

        <div className="flex justify-between items-center">
          <span className={`text-xs transition-colors ${
            text.length >= 480 ? "text-red-400" : text.length >= 400 ? "text-bw-amber" : "text-bw-muted"
          }`}>
            {text.length}/500
          </span>
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={text.trim() && !submitting ? { scale: 1.03 } : undefined}
            onClick={handleSubmit}
            disabled={!text.trim() || submitting}
            className={`btn-glow px-8 py-3 rounded-xl font-bold transition-all ${
              text.trim() && !submitting
                ? "text-white cursor-pointer shadow-lg"
                : "bg-bw-elevated text-bw-muted cursor-not-allowed"
            }`}
            style={text.trim() && !submitting ? { background: "linear-gradient(135deg, #FF6B35, #D4A843)", boxShadow: "0 4px 15px rgba(255,107,53,0.3)" } : undefined}
          >
            {submitting ? "Envoi..." : "Envoyer"}
          </motion.button>
        </div>
      </div>

      {/* Nudge */}
      {situation.nudgeText && done && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="glass-card border-bw-teal/20 px-4 py-3 flex items-start gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="2" strokeLinecap="round" className="mt-0.5 flex-shrink-0">
            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
          </svg>
          <p className="text-sm text-bw-teal italic">{situation.nudgeText}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

// ——— State: RELANCE (AI follow-up) ———
function RelanceState({
  relanceText,
  onSubmit,
  onSkip,
}: {
  relanceText: string;
  onSubmit: (text: string) => void;
  onSkip: () => void;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const { displayed, done, skip } = useTypewriter(relanceText, 40);
  const relanceTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus when typewriter finishes
  useEffect(() => {
    if (done && relanceTextareaRef.current) {
      relanceTextareaRef.current.focus({ preventScroll: true });
    }
  }, [done]);

  function handleRelanceChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  }

  function handleSubmit() {
    if (!text.trim() || sending) return;
    setSending(true);
    onSubmit(text.trim());
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-5 w-full"
    >
      {/* Mentor avatar + label */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-bw-teal/20 flex items-center justify-center flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="2" strokeLinecap="round">
            <path d="M12 2a3 3 0 0 0-3 3v1a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 13c0-3.87-3.13-7-7-7s-7 3.13-7 7c0 2.06.89 3.92 2.3 5.2L5 21h14l-2.3-2.8A6.97 6.97 0 0 0 19 13Z" />
          </svg>
        </div>
        <span className="text-sm font-medium text-bw-teal">Le mentor rebondit...</span>
      </div>

      {/* Relance with typewriter */}
      <div
        className="glass-card border-bw-teal/20 p-5 min-h-[80px] text-lg leading-relaxed cursor-pointer"
        onClick={() => !done && skip()}
      >
        <p className="text-bw-heading">{displayed}</p>
        {!done && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.6 }}
            className="inline-block w-0.5 h-5 bg-bw-teal ml-0.5 align-text-bottom"
          />
        )}
      </div>

      {/* Response area (optional) */}
      {done && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <textarea
            ref={relanceTextareaRef}
            value={text}
            onChange={handleRelanceChange}
            placeholder="Ta réponse (optionnel)..."
            rows={2}
            maxLength={500}
            className="w-full bw-script bg-bw-elevated border border-white/[0.06] rounded-xl p-4 text-bw-heading placeholder:text-bw-muted focus:border-bw-teal focus:outline-none transition-colors resize-none overflow-hidden"
          />

          <div className="flex justify-between items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onSkip}
              className="px-6 py-3 rounded-xl font-medium text-bw-muted hover:text-white transition-colors cursor-pointer"
            >
              Passer
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={!text.trim() || sending}
              className={`btn-glow px-8 py-3 rounded-xl font-semibold transition-all ${
                text.trim() && !sending
                  ? "bg-bw-teal text-bw-bg cursor-pointer"
                  : "bg-bw-elevated text-bw-muted cursor-not-allowed"
              }`}
            >
              {sending ? "Envoi..." : "Répondre"}
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ——— Cinema Fun Facts ———
const CINEMA_FACTS = [
  "Le premier film de l'histoire durait... 2 secondes !",
  "Le son « Wilhelm Scream » est utilisé dans +400 films.",
  "Un film moyen utilise entre 1 000 et 2 000 plans.",
  "Le clap de cinéma sert à synchroniser l'image et le son.",
  "Le mot « cinéma » vient du grec « kinêma » = mouvement.",
  "Hitchcock a tourné « La Corde » en seulement 10 plans.",
  "Les figurants sont appelés des « silhouettes » en France.",
  "Le record du plus long film ? 857 heures (The Cure for Insomnia).",
  "L'effet « bullet time » de Matrix a nécessité 120 caméras.",
  "Le premier film en couleur date de 1902, par Méliès.",
  "Pixar a mis 4 ans à créer Toy Story... le premier film 100% 3D.",
  "Stanley Kubrick exigeait parfois +70 prises pour une scène.",
];

// ——— State: SENT ———
function SentState({ responsesCount, connectedCount, streak }: { responsesCount?: number; connectedCount?: number; streak?: number }) {
  const [factIndex, setFactIndex] = useState(() => Math.floor(Math.random() * CINEMA_FACTS.length));

  // Rotate facts every 5s
  useEffect(() => {
    const timer = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % CINEMA_FACTS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center gap-6 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
        className="w-24 h-24 rounded-full flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, rgba(78,205,196,0.25), rgba(16,185,129,0.15))" }}
      >
        <motion.svg
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4ECDC4"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-12 h-12"
        >
          <motion.path d="M5 13l4 4L19 7" />
        </motion.svg>
      </motion.div>

      <div className="space-y-2">
        <h2
          className="text-2xl tracking-wider font-cinema"
        >
          ENVOYÉ !
        </h2>
        <div className="h-0.5 w-10 mx-auto rounded-full bg-gradient-to-r from-bw-teal to-bw-green" />
        <p className="text-bw-muted text-sm">
          En attente des autres joueurs...
        </p>
      </div>

      {/* Streak badge */}
      {(streak ?? 0) >= 2 && (
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="flex items-center gap-1.5 bg-gradient-to-r from-bw-amber/20 to-bw-primary/20 border border-bw-amber/40 rounded-full px-4 py-1.5"
        >
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="text-base"
          >
            🔥
          </motion.span>
          <span className="text-sm font-bold text-bw-amber">x{streak}</span>
          <span className="text-xs text-bw-amber/70">streak</span>
        </motion.div>
      )}

      {/* Live counter */}
      {responsesCount != null && connectedCount != null && connectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card px-5 py-3"
        >
          <p className="text-sm text-bw-muted">
            <span className="text-bw-teal font-semibold">{responsesCount}</span>
            <span className="text-bw-muted">/{connectedCount}</span>
            {" "}ont répondu
          </p>
        </motion.div>
      )}

      {/* Cinema fun fact */}
      <motion.div
        className="max-w-xs px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <div className="rounded-xl px-4 py-3" style={{ background: "linear-gradient(135deg, rgba(212,168,67,0.08), rgba(139,92,246,0.05))", border: "1px solid rgba(212,168,67,0.12)" }}>
          <p className="text-[9px] uppercase tracking-widest text-bw-gold mb-1 font-bold">Le saviez-vous ?</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={factIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="text-xs text-bw-text leading-relaxed"
            >
              {CINEMA_FACTS[factIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>

      <motion.div
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="flex gap-1"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
            className="w-2 h-2 rounded-full bg-bw-teal"
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

// ——— State: VOTE (card-based tap) ———
function VoteState({
  voteOptions,
  situation,
  onVote,
  voting,
}: {
  voteOptions: SessionState["voteOptions"];
  situation: NonNullable<SessionState["situation"]>;
  onVote: (responseId: string) => void;
  voting: boolean;
}) {
  const [votedId, setVotedId] = useState<string | null>(null);
  const categoryColor = CATEGORY_COLORS[situation.category] || "#FF6B35";
  const letters = ["A", "B", "C", "D", "E", "F"];

  function handleTap(optionId: string) {
    if (voting) return;
    setVotedId(optionId);
    onVote(optionId);
    if (navigator.vibrate) navigator.vibrate(15);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-5 w-full"
    >
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-14 h-14 rounded-full mx-auto flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${categoryColor}30, ${categoryColor}15)` }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={categoryColor} strokeWidth="2" strokeLinecap="round">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
          </svg>
        </motion.div>
        <h2
          className="text-2xl tracking-wider font-cinema"
        >
          CHOISIS LA MEILLEURE
        </h2>
        <div className="h-0.5 w-12 mx-auto rounded-full" style={{ background: `linear-gradient(90deg, ${categoryColor}, ${categoryColor}60)` }} />
        <p className="text-xs text-bw-muted">Tap pour voter</p>
      </div>

      <div className="space-y-3">
        {voteOptions.map((option, index) => {
          const isVoted = votedId === option.id;
          const hasVoted = votedId !== null;
          const letter = letters[index] || `${index + 1}`;
          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: hasVoted && !isVoted ? 0.4 : 1,
                y: 0,
                scale: isVoted ? 1.02 : 1,
              }}
              transition={{ delay: index * 0.12, type: "spring", stiffness: 300, damping: 25 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTap(option.id)}
              disabled={voting}
              className={`w-full text-left rounded-2xl border-2 transition-all cursor-pointer overflow-hidden ${
                isVoted
                  ? "border-bw-primary shadow-[0_0_20px_rgba(255,107,53,0.15)]"
                  : "border-white/[0.06] hover:border-white/20"
              }`}
            >
              <div className="flex items-start gap-3 p-4">
                {/* Letter badge */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold transition-colors ${
                    isVoted ? "text-white" : "text-bw-muted"
                  }`}
                  style={isVoted ? { backgroundColor: categoryColor } : { backgroundColor: "#15181F" }}
                >
                  {letter}
                </div>
                <p className={`text-sm leading-relaxed pt-1.5 ${isVoted ? "text-white" : "text-bw-text"}`}>
                  {option.text}
                </p>
              </div>
              {/* Selection bar */}
              {isVoted && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  className="h-1 origin-left"
                  style={{ backgroundColor: categoryColor }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {votedId && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2"
        >
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: 1, duration: 0.3 }}
            className="w-2 h-2 rounded-full bg-bw-teal"
          />
          <span className="text-sm text-bw-teal">Vote enregistré — tu peux changer d&apos;avis</span>
        </motion.div>
      )}
    </motion.div>
  );
}

// ——— State: RESULT (with suspense reveal) ———
function ResultState({
  collectiveChoice,
  isMyResponseChosen,
  comboCount,
  onReveal,
}: {
  collectiveChoice: NonNullable<SessionState["collectiveChoice"]>;
  isMyResponseChosen?: boolean;
  comboCount?: number;
  onReveal?: () => void;
}) {
  const categoryColor = CATEGORY_COLORS[collectiveChoice.category] || "#FF6B35";
  const [phase, setPhase] = useState<"suspense" | "revealed">("suspense");

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase("revealed");
      onReveal?.();
    }, 2200);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center gap-6 w-full"
    >
      <AnimatePresence mode="wait">
        {phase === "suspense" ? (
          <motion.div
            key="suspense"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="flex flex-col items-center gap-4 py-8"
          >
            {/* Pulsing envelope icon */}
            <motion.div
              animate={{ scale: [1, 1.15, 1], rotate: [0, -3, 3, 0] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-bw-violet to-bw-primary flex items-center justify-center"
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </motion.div>
            {/* Countdown dots */}
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0.2, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.6, duration: 0.3 }}
                  className="w-3 h-3 rounded-full bg-bw-violet"
                />
              ))}
            </div>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-base tracking-wider text-bw-gold font-cinema"
            >
              LE CHOIX ARRIVE...
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="flex flex-col items-center gap-5 w-full"
          >
            <div className="text-center space-y-2">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-bw-violet to-bw-violet/60 mx-auto flex items-center justify-center"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </motion.div>
              <h2
                className="text-2xl tracking-wider font-cinema"
              >
                CHOIX COLLECTIF
              </h2>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-full rounded-xl p-6 border"
              style={{ backgroundColor: `${categoryColor}10`, borderColor: `${categoryColor}40` }}
            >
              <span
                className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mb-3 inline-block"
                style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
              >
                {collectiveChoice.restitution_label || collectiveChoice.category}
              </span>
              <p className="text-lg leading-relaxed mt-2">{collectiveChoice.chosen_text}</p>
            </motion.div>

            {/* "Ton idée retenue" celebration — with combo */}
            {isMyResponseChosen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="w-full rounded-xl p-4 bg-gradient-to-r from-bw-amber/20 to-bw-primary/20 border border-bw-amber/40 text-center space-y-2"
              >
                {(comboCount ?? 0) >= 2 && (
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.3, 1] }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold text-bw-gold font-cinema"
                  >
                    COMBO x{comboCount}
                  </motion.p>
                )}
                <motion.p
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: 2, duration: 0.4 }}
                  className="text-sm font-bold text-bw-amber"
                >
                  {(comboCount ?? 0) >= 2
                    ? "Encore ton idée retenue !"
                    : "C'est ton idée qui a été retenue !"}
                </motion.p>
              </motion.div>
            )}

            <p className="text-sm text-bw-muted">
              En attente de la prochaine situation...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ——— State: BUDGET (Module 9) ———
function BudgetState({
  sessionId,
  studentId,
  storyContext,
  onDone,
}: {
  sessionId: string;
  studentId: string;
  storyContext?: Record<string, string>; // category -> chosen_text from Module 3
  onDone: () => void;
}) {
  // choices = { acteurs: 15, decors: 0, effets: 40, ... } (cost values, not indices)
  const [choices, setChoices] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const total = Object.values(choices).reduce((a, b) => a + b, 0);
  const remaining = BUDGET_TOTAL - total;
  const reserveOk = remaining >= BUDGET_RESERVE_MIN;
  const allChosen = PRODUCTION_CATEGORIES.every((cat) => choices[cat.key] != null);
  const canSubmit = allChosen && reserveOk && !submitting;

  function selectOption(catKey: string, cost: number) {
    setChoices((prev) => {
      const prevCost = prev[catKey] || 0;
      const newTotal = total - prevCost + cost;
      if (BUDGET_TOTAL - newTotal < BUDGET_RESERVE_MIN) {
        if (cost >= prevCost && prevCost !== cost) {
          toast.error(`Réserve minimum : ${BUDGET_RESERVE_MIN} crédits`);
          return prev;
        }
      }
      return { ...prev, [catKey]: cost };
    });
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/budget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, choices }),
      });
      if (res.ok) {
        toast.success("Choix envoyés !");
        onDone();
      } else {
        const err = await res.json();
        toast.error(err.error || "Erreur");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col gap-5 w-full">
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.3), rgba(255,107,53,0.2))" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v12M8 10h8M8 14h8" />
          </svg>
        </motion.div>
        <h2 className="text-xl font-bold font-cinema tracking-wide">Ton film, tes choix</h2>
        <p className="text-sm text-bw-muted">
          Tu as <strong className="text-white">{BUDGET_TOTAL} crédits</strong> d&apos;énergie créative. Chaque choix coûte — impossible de tout avoir.
        </p>
      </div>

      {/* Credits remaining */}
      <div className="bg-bw-elevated rounded-xl px-5 py-3 flex items-center justify-between border border-white/[0.06]">
        <span className="text-sm text-bw-muted">Crédits restants</span>
        <span className={`text-2xl font-bold ${!reserveOk ? "text-red-400" : remaining <= BUDGET_RESERVE_MIN ? "text-bw-amber" : "text-white"}`}>
          {remaining}
        </span>
      </div>
      {!reserveOk && (
        <p className="text-xs text-red-400 text-center -mt-3">Réserve minimum : {BUDGET_RESERVE_MIN} crédits</p>
      )}

      {/* Category options */}
      <div className="space-y-4">
        {PRODUCTION_CATEGORIES.map((cat, catIdx) => {
          const selected = choices[cat.key];
          // Show story context if available for this category
          const contextText = cat.storyCategory && storyContext?.[cat.storyCategory];
          return (
            <motion.div key={cat.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIdx * 0.06 }}
              className="bg-bw-elevated rounded-xl p-4 border border-white/[0.06]"
            >
              <p className="text-sm font-semibold mb-1" style={{ color: cat.color }}>{cat.label}</p>
              {/* Narrative context from Module 3 */}
              {contextText && (
                <p className="text-xs text-bw-muted italic mb-3 line-clamp-2">
                  &laquo; {contextText} &raquo;
                </p>
              )}
              <div className="grid grid-cols-3 gap-2">
                {cat.options.map((opt) => {
                  const isSelected = selected === opt.cost;
                  return (
                    <motion.button
                      key={opt.cost}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => selectOption(cat.key, opt.cost)}
                      className={`py-2.5 px-2 rounded-xl text-center transition-all cursor-pointer border ${
                        isSelected
                          ? "border-current bg-current/10"
                          : "border-white/[0.06] bg-bw-bg hover:border-white/20"
                      }`}
                      style={isSelected ? { color: cat.color, borderColor: cat.color, backgroundColor: `${cat.color}15` } : {}}
                    >
                      <span className={`text-xs font-medium block ${isSelected ? "" : "text-bw-text"}`}>{opt.label}</span>
                      <span className={`text-[10px] block mt-0.5 ${isSelected ? "" : "text-bw-muted"}`}>
                        {opt.cost === 0 ? "Gratuit" : `${opt.cost} cr.`}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary preview */}
      {allChosen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card border-bw-teal/20 p-4"
        >
          <p className="text-xs text-bw-teal font-medium mb-1">Résumé de ton film</p>
          <p className="text-sm text-bw-text leading-relaxed">{generateBudgetSummary(choices)}</p>
        </motion.div>
      )}

      <motion.button whileTap={{ scale: 0.95 }} whileHover={canSubmit ? { scale: 1.02 } : undefined} onClick={handleSubmit}
        disabled={!canSubmit}
        className={`btn-glow w-full py-4 rounded-xl font-bold transition-all ${
          canSubmit ? "text-white cursor-pointer shadow-lg" : "bg-bw-elevated text-bw-muted cursor-not-allowed"
        }`}
        style={canSubmit ? { background: "linear-gradient(135deg, #FF6B35, #D4A843)", boxShadow: "0 4px 15px rgba(255,107,53,0.3)" } : undefined}>
        {submitting ? "Envoi..." : "Valider mes choix"}
      </motion.button>
    </motion.div>
  );
}

// ——— State: MODULE 1 (Confiance + Diagnostic) ———
// ——— State: POSITIONING (Module 1 séance 1) ———
function PositioningState({
  module1,
  sessionId,
  studentId,
  currentSituationIndex,
  onAnswered,
}: {
  module1: Module1Data;
  sessionId: string;
  studentId: string;
  currentSituationIndex: number;
  onAnswered: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const questions = module1.questions || [];
  const currentQ = questions[currentSituationIndex];
  const totalQ = questions.length;
  const answeredCount = Object.values(module1.answeredQuestions || {}).filter(Boolean).length;
  const allAnswered = answeredCount >= totalQ;

  async function handleSelectOption(optionKey: string) {
    if (!currentQ?.situationId || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          situationId: currentQ.situationId,
          text: optionKey,
        }),
      });
      if (res.ok) {
        onAnswered();
      } else {
        const err = await res.json();
        toast.error(err.error || "Erreur");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setSubmitting(false);
    }
  }

  if (allAnswered) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center gap-4 text-center w-full">
        <div className="w-16 h-16 rounded-full bg-bw-teal/20 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm text-bw-teal font-medium">Positionnement terminé !</p>
        <p className="text-xs text-bw-muted">En attente du facilitateur...</p>
      </motion.div>
    );
  }

  if (!currentQ) return null;

  const isAnswered = module1.answeredQuestions?.[currentSituationIndex + 1];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col gap-5 w-full">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs text-bw-muted">
          <span>Question {currentSituationIndex + 1}/{totalQ}</span>
          <span className="text-bw-violet">{currentQ.measure}</span>
        </div>
        <div className="w-full h-1.5 bg-bw-elevated rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${((currentSituationIndex + 1) / totalQ) * 100}%` }}
            className="h-full rounded-full bg-bw-violet"
          />
        </div>
      </div>

      {/* Question */}
      <motion.p
        key={currentSituationIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-lg font-medium text-bw-heading leading-relaxed text-center px-2"
      >
        {currentQ.text}
      </motion.p>

      {/* Options */}
      {!isAnswered && (
        <motion.div
          key={`opts-${currentSituationIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {(currentQ.options || []).map((opt, i) => (
            <motion.button
              key={opt.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelectOption(opt.key)}
              disabled={submitting}
              className="w-full text-left p-4 rounded-xl border border-white/[0.06] bg-bw-elevated hover:border-bw-violet/50 hover:bg-bw-violet/5 transition-all cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-bw-violet/20 text-bw-violet flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {opt.key.toUpperCase()}
                </span>
                <span className="text-sm text-bw-heading leading-relaxed pt-1">{opt.label}</span>
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}

      {isAnswered && (
        <div className="text-center py-4">
          <p className="text-sm text-bw-teal">Répondu ! En attente de la question suivante...</p>
        </div>
      )}
    </motion.div>
  );
}

// ——— State: IMAGE QUESTION (Module 1 séances 2-4) ———
function ImageQuestionState({
  module1,
  sessionId,
  studentId,
  onAnswered,
}: {
  module1: Module1Data;
  sessionId: string;
  studentId: string;
  onAnswered: () => void;
}) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imageFullscreen, setImageFullscreen] = useState(false);
  const [showRelance, setShowRelance] = useState(false);

  async function handleSubmit() {
    if (!text.trim() || submitting || !module1.question?.situationId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          situationId: module1.question.situationId,
          text: text.trim(),
        }),
      });
      if (res.ok) {
        setText("");
        onAnswered();
      } else {
        const err = await res.json();
        toast.error(err.error || "Erreur");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setSubmitting(false);
    }
  }

  // If confrontation is active, show it
  if (module1.confrontation) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex flex-col gap-5 w-full">
        <p className="text-sm text-bw-violet text-center font-semibold uppercase tracking-wider">Confrontation</p>
        <div className="grid grid-cols-2 gap-4">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            className="bg-[#1E3A5F] rounded-xl p-4 border border-[#3B82F6]/30">
            <p className="text-xs text-[#93C5FD] mb-2 font-semibold uppercase">Réponse A</p>
            <p className="text-sm text-bw-heading leading-relaxed">{module1.confrontation.responseA}</p>
          </motion.div>
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            className="bg-[#5F1E1E] rounded-xl p-4 border border-bw-danger/30">
            <p className="text-xs text-[#FCA5A5] mb-2 font-semibold uppercase">Réponse B</p>
            <p className="text-sm text-bw-heading leading-relaxed">{module1.confrontation.responseB}</p>
          </motion.div>
        </div>
        <p className="text-xs text-bw-muted text-center">Le facilitateur a projeté deux réponses pour le débat.</p>
      </motion.div>
    );
  }

  // If already responded, show waiting
  if (module1.hasResponded) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-bw-teal/20 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm text-bw-teal font-medium">Réponse envoyée !</p>
        <p className="text-xs text-bw-muted">En attente du facilitateur...</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col gap-5 w-full">
      {/* Image */}
      {module1.image && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-bw-violet/20 text-bw-violet">
              {module1.image.title || `Image ${module1.image.position}`}
            </span>
            <button onClick={() => setImageFullscreen(true)}
              className="text-xs text-bw-muted hover:text-white cursor-pointer flex items-center gap-1 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
              </svg>
              Agrandir
            </button>
          </div>
          <div className="relative rounded-xl overflow-hidden border border-white/[0.06] bg-bw-elevated cursor-pointer"
            onClick={() => setImageFullscreen(true)}>
            <div className="aspect-[4/3] w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={module1.image.url} alt={module1.image.title}
                className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-black/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        </div>
      )}

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {imageFullscreen && module1.image && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setImageFullscreen(false)}>
            <button onClick={() => setImageFullscreen(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white cursor-pointer hover:bg-white/20 transition-colors z-10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={module1.image.url} alt={module1.image.title}
              className="max-w-full max-h-full object-contain" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question + answer */}
      {module1.question && (
        <div className="space-y-3">
          <p className="text-base text-bw-heading leading-relaxed">{module1.question.text}</p>

          {module1.question.relance && (
            <div>
              <button onClick={() => setShowRelance(!showRelance)}
                className="text-xs text-bw-teal cursor-pointer flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
                </svg>
                {showRelance ? "Masquer l'aide" : "Un coup de pouce ?"}
              </button>
              <AnimatePresence>
                {showRelance && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-bw-teal italic mt-2 pl-4 border-l-2 border-bw-teal/30">
                    {module1.question.relance}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          )}

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Écris ta réponse ici..."
            rows={3}
            maxLength={500}
            className="w-full bw-script bg-bw-bg border border-white/[0.06] rounded-xl p-3 text-bw-heading placeholder:text-bw-muted focus:border-bw-primary focus:outline-none transition-colors resize-none"
            autoFocus
          />

          <div className="flex justify-between items-center">
            <span className="text-[10px] text-bw-muted">{text.length}/500</span>
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={!text.trim() || submitting}
              className={`btn-glow px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
                text.trim() && !submitting
                  ? "bg-bw-primary text-white cursor-pointer"
                  : "bg-bw-elevated text-bw-muted cursor-not-allowed"
              }`}>
              {submitting ? "..." : "Envoyer"}
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ——— State: NOTEBOOK (Module 1 séance 5) ———
function NotebookState({
  module1,
  sessionId,
  studentId,
  onAnswered,
}: {
  module1: Module1Data;
  sessionId: string;
  studentId: string;
  onAnswered: () => void;
}) {
  const [text, setText] = useState(module1.existingText || "");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(module1.existingText ? "Chargé" : null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save with debounce
  useEffect(() => {
    if (!module1.question?.situationId || !text.trim()) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        const res = await fetch(`/api/sessions/${sessionId}/respond`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId,
            situationId: module1.question!.situationId,
            text: text.trim(),
          }),
        });
        if (res.ok) {
          setLastSaved(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
          onAnswered();
        }
      } catch {
        // Silent fail for auto-save
      } finally {
        setSaving(false);
      }
    }, 1000);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col gap-4 w-full h-full">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-bw-violet/20 text-bw-violet">
          Carnet d&apos;idées
        </span>
        {module1.question && (
          <p className="text-sm text-bw-muted">{module1.question.text}</p>
        )}
      </div>

      {/* Large textarea */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Note tes idées ici... Tout ce qui te vient en tête."
        rows={8}
        maxLength={2000}
        className="w-full bw-script bg-bw-bg border border-white/[0.06] rounded-xl p-4 text-bw-heading placeholder:text-bw-muted focus:border-bw-violet focus:outline-none transition-colors resize-none flex-1"
        autoFocus
      />

      {/* Footer with char count and save status */}
      <div className="flex justify-between items-center text-xs">
        <span className="text-bw-muted">{text.length}/2000 caractères</span>
        <span className={saving ? "text-bw-amber" : lastSaved ? "text-bw-teal" : "text-bw-muted"}>
          {saving ? "Sauvegarde..." : lastSaved ? `Sauvegardé à ${lastSaved}` : ""}
        </span>
      </div>
    </motion.div>
  );
}

// ——— State: CHECKLIST (Module 2 séance 1) ———
function ChecklistState({
  sessionId,
  studentId,
  module5,
  onDone,
}: {
  sessionId: string;
  studentId: string;
  module5: Module5Data;
  onDone: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(module5.checklist?.selected_items || [])
  );
  const [step, setStep] = useState<1 | 2>(module5.checklist?.chosen_item ? 2 : 1);
  const [chosenItem, setChosenItem] = useState<string | null>(module5.checklist?.chosen_item || null);
  const [submitting, setSubmitting] = useState(false);

  // Lazy import content catalog
  const [catalog, setCatalog] = useState<{ key: string; label: string; emoji: string }[]>([]);
  useEffect(() => {
    import("@/lib/module5-data").then((m) => setCatalog(m.CONTENT_CATALOG));
  }, []);

  function toggleItem(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleSubmit() {
    if (submitting) return;
    const items = Array.from(selected);
    if (step === 1 && items.length >= 3) {
      setStep(2);
      return;
    }
    if (step === 2 && chosenItem) {
      setSubmitting(true);
      try {
        const res = await fetch(`/api/sessions/${sessionId}/checklist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId, selectedItems: items, chosenItem }),
        });
        if (res.ok) {
          toast.success("Sélection envoyée !");
          onDone();
        } else {
          const err = await res.json();
          toast.error(err.error || "Erreur");
        }
      } catch {
        toast.error("Erreur de connexion");
      } finally {
        setSubmitting(false);
      }
    }
  }

  if (!catalog.length) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col gap-5 w-full">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-bw-pink to-bw-pink/60 mx-auto flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold">
          {step === 1 ? "Tes contenus préférés" : "Choisis LE contenu"}
        </h2>
        <p className="text-sm text-bw-muted">
          {step === 1
            ? `Sélectionne les films, séries, anime que tu adores (${selected.size}/3 minimum)`
            : "Parmi ta sélection, choisis celui qui t'a le plus marqué"}
        </p>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-4 gap-2">
          {catalog.map((item) => {
            const isSelected = selected.has(item.key);
            return (
              <motion.button
                key={item.key}
                whileTap={{ scale: 0.93 }}
                onClick={() => toggleItem(item.key)}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "border-bw-pink bg-bw-pink/10"
                    : "border-white/[0.06] bg-bw-elevated"
                }`}
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className={`text-[10px] leading-tight text-center ${isSelected ? "text-bw-pink" : "text-bw-muted"}`}>
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-2">
          {Array.from(selected).map((key) => {
            const item = catalog.find((c) => c.key === key);
            if (!item) return null;
            const isChosen = chosenItem === key;
            return (
              <motion.button
                key={key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setChosenItem(key)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                  isChosen
                    ? "border-bw-pink bg-bw-pink/10"
                    : "border-white/[0.06] bg-bw-elevated"
                }`}
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className={`text-sm font-medium ${isChosen ? "text-bw-pink" : "text-bw-text"}`}>
                  {item.label}
                </span>
                {isChosen && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="ml-auto w-6 h-6 rounded-full bg-bw-pink flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
          <button
            onClick={() => { setStep(1); setChosenItem(null); }}
            className="text-xs text-bw-muted hover:text-white cursor-pointer transition-colors"
          >
            ← Modifier ma sélection
          </button>
        </div>
      )}

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleSubmit}
        disabled={(step === 1 && selected.size < 3) || (step === 2 && !chosenItem) || submitting}
        className={`btn-glow w-full py-4 rounded-xl font-semibold transition-all ${
          (step === 1 && selected.size >= 3) || (step === 2 && chosenItem)
            ? "bg-bw-pink text-white cursor-pointer"
            : "bg-bw-elevated text-bw-muted cursor-not-allowed"
        }`}
      >
        {submitting ? "Envoi..." : step === 1 ? `Continuer (${selected.size} sélectionnés)` : "Valider mon choix"}
      </motion.button>
    </motion.div>
  );
}

// ——— State: SCENE BUILDER (Module 2 séance 2) ———
function SceneBuilderState({
  sessionId,
  studentId,
  module5,
  onDone,
}: {
  sessionId: string;
  studentId: string;
  module5: Module5Data;
  onDone: () => void;
}) {
  const [intention, setIntention] = useState(module5.scene?.intention || "");
  const [obstacle, setObstacle] = useState(module5.scene?.obstacle || "");
  const [changement, setChangement] = useState(module5.scene?.changement || "");
  const [selectedElements, setSelectedElements] = useState<Set<string>>(
    new Set(module5.scene?.elements?.map((e) => e.key) || [])
  );
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ strengths: string[]; suggestions: string[]; summary: string } | null>(
    module5.scene?.ai_feedback || null
  );

  // Lazy-load scene elements and emotion
  const [elements, setElements] = useState<{ key: string; label: string; tier: number; cost: number; slots: number }[]>([]);
  const [emotions, setEmotions] = useState<{ key: string; label: string; color: string }[]>([]);
  const [tierColors, setTierColors] = useState<Record<number, string>>({});
  const [tierLabels, setTierLabels] = useState<Record<number, string>>({});
  const [maxSlots, setMaxSlots] = useState(5);
  const [maxTokens, setMaxTokens] = useState(8);

  useEffect(() => {
    import("@/lib/module5-data").then((m) => {
      setElements(m.SCENE_ELEMENTS);
      setEmotions(m.EMOTIONS);
      setTierColors(m.TIER_COLORS);
      setTierLabels(m.TIER_LABELS);
      setMaxSlots(m.MAX_SLOTS);
      setMaxTokens(m.MAX_TOKENS);
    });
  }, []);

  const emotion = module5.chosenEmotion || "";
  const emotionInfo = emotions.find((e) => e.key === emotion);

  // Calculate totals
  const totalSlots = selectedElements.size;
  const totalTokens = Array.from(selectedElements).reduce((sum, key) => {
    const el = elements.find((e) => e.key === key);
    return sum + (el?.cost || 0);
  }, 0);

  function toggleElement(key: string) {
    setSelectedElements((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        const el = elements.find((e) => e.key === key);
        if (!el) return prev;
        if (next.size >= maxSlots) {
          toast.error(`Maximum ${maxSlots} emplacements`);
          return prev;
        }
        const newTokens = totalTokens + el.cost;
        if (newTokens > maxTokens) {
          toast.error(`Pas assez de jetons (${maxTokens - totalTokens} restants)`);
          return prev;
        }
        next.add(key);
      }
      return next;
    });
  }

  const canSubmit = intention.trim().length >= 5 && obstacle.trim().length >= 5 && changement.trim().length >= 5 && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const elArray = Array.from(selectedElements).map((key) => {
        const el = elements.find((e) => e.key === key);
        return { key, tier: el?.tier || 0, cost: el?.cost || 0 };
      });
      const res = await fetch(`/api/sessions/${sessionId}/scene`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          emotion: emotion || "exclusion",
          intention: intention.trim(),
          obstacle: obstacle.trim(),
          changement: changement.trim(),
          elements: elArray,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ai_feedback) {
          setFeedback(data.ai_feedback);
        }
        toast.success("Scène envoyée !");
        if (!data.ai_feedback) onDone();
      } else {
        const err = await res.json();
        toast.error(err.error || "Erreur");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setSubmitting(false);
    }
  }

  if (!elements.length) return null;

  // Group elements by tier
  const tiers = [0, 1, 2, 3];

  // If we have feedback, show it
  if (feedback) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-5 w-full">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-bw-teal/20 mx-auto flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="2" strokeLinecap="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold">Scène validée !</h2>
        </div>

        <div className="glass-card border-bw-teal/20 p-4 space-y-3">
          <p className="text-sm text-bw-teal font-medium">Retour du mentor</p>
          <p className="text-sm text-bw-text italic">{feedback.summary}</p>

          {feedback.strengths.length > 0 && (
            <div>
              <p className="text-xs text-bw-teal font-semibold mb-1">Points forts</p>
              {feedback.strengths.map((s, i) => (
                <p key={i} className="text-xs text-bw-text flex items-start gap-1.5">
                  <span className="text-bw-teal">✓</span> {s}
                </p>
              ))}
            </div>
          )}

          {feedback.suggestions.length > 0 && (
            <div>
              <p className="text-xs text-bw-amber font-semibold mb-1">Pistes</p>
              {feedback.suggestions.map((s, i) => (
                <p key={i} className="text-xs text-bw-text flex items-start gap-1.5">
                  <span className="text-bw-amber">→</span> {s}
                </p>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-bw-muted text-center">En attente des autres joueurs...</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col gap-4 w-full">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-bw-pink to-bw-pink/60 mx-auto flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <rect x="2" y="2" width="20" height="20" rx="2.18" />
            <path d="M7 2v20M17 2v20M2 12h20" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold">Construis ta scène</h2>
        {emotionInfo && (
          <span className="text-xs px-3 py-1 rounded-full inline-block"
            style={{ backgroundColor: `${emotionInfo.color}20`, color: emotionInfo.color }}>
            {emotionInfo.label}
          </span>
        )}
      </div>

      {/* Narrative fields */}
      <div className="space-y-3">
        <div>
          <label className="text-xs text-bw-muted font-medium">🎯 Mon personnage veut...</label>
          <textarea
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            placeholder="Qu'est-ce que ton personnage veut vraiment ?"
            rows={2}
            maxLength={300}
            className="w-full bw-script bg-bw-elevated border border-white/[0.06] rounded-xl p-3 text-bw-heading placeholder:text-bw-muted focus:border-bw-pink focus:outline-none transition-colors resize-none mt-1"
          />
        </div>
        <div>
          <label className="text-xs text-bw-muted font-medium">⚠️ Mais...</label>
          <textarea
            value={obstacle}
            onChange={(e) => setObstacle(e.target.value)}
            placeholder="Qu'est-ce qui l'empêche d'y arriver ?"
            rows={2}
            maxLength={300}
            className="w-full bw-script bg-bw-elevated border border-white/[0.06] rounded-xl p-3 text-bw-heading placeholder:text-bw-muted focus:border-bw-pink focus:outline-none transition-colors resize-none mt-1"
          />
        </div>
        <div>
          <label className="text-xs text-bw-muted font-medium">🔄 À la fin...</label>
          <textarea
            value={changement}
            onChange={(e) => setChangement(e.target.value)}
            placeholder="Comment ça finit pour ton personnage ?"
            rows={2}
            maxLength={300}
            className="w-full bw-script bg-bw-elevated border border-white/[0.06] rounded-xl p-3 text-bw-heading placeholder:text-bw-muted focus:border-bw-pink focus:outline-none transition-colors resize-none mt-1"
          />
        </div>
      </div>

      {/* Counters */}
      <div className="flex gap-3">
        <div className={`flex-1 bg-bw-elevated rounded-xl px-3 py-2 text-center border ${totalSlots >= maxSlots ? "border-bw-amber/40" : "border-white/[0.06]"}`}>
          <span className="text-xs text-bw-muted">Emplacements</span>
          <p className={`text-lg font-bold ${totalSlots >= maxSlots ? "text-bw-amber" : "text-white"}`}>
            {totalSlots}/{maxSlots}
          </p>
        </div>
        <div className={`flex-1 bg-bw-elevated rounded-xl px-3 py-2 text-center border ${totalTokens >= maxTokens ? "border-bw-danger/40" : "border-white/[0.06]"}`}>
          <span className="text-xs text-bw-muted">Jetons</span>
          <p className={`text-lg font-bold ${totalTokens >= maxTokens ? "text-bw-danger" : "text-white"}`}>
            {totalTokens}/{maxTokens}
          </p>
        </div>
      </div>

      {/* Elements grid by tier */}
      <div className="space-y-3">
        {tiers.map((tier) => {
          const tierElements = elements.filter((e) => e.tier === tier);
          if (tierElements.length === 0) return null;
          const color = tierColors[tier] || "#888";
          return (
            <div key={tier}>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color }}>
                {tierLabels[tier] || `Tier ${tier}`}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {tierElements.map((el) => {
                  const isSelected = selectedElements.has(el.key);
                  return (
                    <motion.button
                      key={el.key}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => toggleElement(el.key)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                        isSelected
                          ? "border-current bg-current/10"
                          : "border-white/[0.06] bg-bw-elevated text-bw-muted"
                      }`}
                      style={isSelected ? { color, borderColor: color, backgroundColor: `${color}15` } : {}}
                    >
                      {el.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`btn-glow w-full py-4 rounded-xl font-semibold transition-all ${
          canSubmit ? "bg-bw-pink text-white cursor-pointer" : "bg-bw-elevated text-bw-muted cursor-not-allowed"
        }`}
      >
        {submitting ? "Envoi..." : "Valider ma scène"}
      </motion.button>
    </motion.div>
  );
}

// ——— State: PAUSED ———
function PausedState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center gap-4 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-bw-amber to-bw-amber/40 mx-auto flex items-center justify-center">
        <div className="flex gap-1.5">
          <div className="w-2 h-7 bg-white rounded-sm" />
          <div className="w-2 h-7 bg-white rounded-sm" />
        </div>
      </div>
      <h2
        className="text-2xl tracking-wider text-bw-amber font-cinema"
      >
        PAUSE
      </h2>
      <p className="text-bw-muted text-sm">Le facilitateur a mis la partie en pause</p>
    </motion.div>
  );
}

// ——— Animated Count-Up ———
function CountUp({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return <>{value}</>;
}

// ——— State: DONE ———
function DoneState({ sessionId, stats, characterCard }: { sessionId: string; stats?: { responses: number; retained: number; bestStreak: number }; characterCard?: { personnage: { prenom: string; age: string; trait: string; avatar: AvatarOptions }; objectif?: string; obstacle?: string; pitchText?: string; chronoSeconds?: number; revealLevel: 0 | 1 | 2 | 3 } | null }) {
  useEffect(() => {
    // Fire confetti on mount
    const t = setTimeout(() => fireConfetti(), 500);
    return () => clearTimeout(t);
  }, []);

  const hasStats = stats && stats.responses > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center gap-6 text-center"
    >
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
        className="w-20 h-20 rounded-full bg-gradient-to-br from-bw-gold to-bw-primary mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(212,168,67,0.3)]"
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
          <rect x="2" y="2" width="20" height="20" rx="2.18" />
          <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 7h5M17 17h5" />
        </svg>
      </motion.div>
      <div className="space-y-2">
        <h2
          className="text-3xl tracking-wider font-cinema"
        >
          C&apos;EST DANS LA <span className="text-bw-gold">BOITE</span> !
        </h2>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="h-px bg-gradient-to-r from-transparent via-bw-gold/50 to-transparent mx-auto max-w-[200px]"
        />
        <p className="text-bw-muted">La partie est terminée. Merci !</p>
      </div>

      {/* Personal stats */}
      {hasStats && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-3 gap-3 w-full max-w-xs"
        >
          <div className="glass-card p-3">
            <p className="text-2xl font-bold text-bw-primary">
              <CountUp target={stats.responses} />
            </p>
            <p className="text-[10px] text-bw-muted mt-0.5">Réponses</p>
          </div>
          <div className="glass-card p-3">
            <p className="text-2xl font-bold text-bw-gold">
              <CountUp target={stats.retained} />
            </p>
            <p className="text-[10px] text-bw-muted mt-0.5">Retenues</p>
          </div>
          <div className="glass-card p-3">
            <p className="text-2xl font-bold text-bw-teal">
              <CountUp target={stats.bestStreak} />
            </p>
            <p className="text-[10px] text-bw-muted mt-0.5">Meilleur streak</p>
          </div>
        </motion.div>
      )}

      {/* Character card (Module 10) */}
      {characterCard && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: hasStats ? 1.2 : 0.6 }}
          className="flex justify-center"
        >
          <CharacterCard
            {...characterCard}
            objectif={characterCard.objectif ?? undefined}
            obstacle={characterCard.obstacle ?? undefined}
            pitchText={characterCard.pitchText ?? undefined}
            chronoSeconds={characterCard.chronoSeconds ?? undefined}
            revealLevel={3}
            showDownload
          />
        </motion.div>
      )}

      {/* Storyboard IA (Module 10) */}
      {characterCard && characterCard.pitchText && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: hasStats ? 1.8 : 1.0 }}
          className="w-full max-w-md"
        >
          <StoryboardViewer
            prenom={characterCard.personnage.prenom}
            trait={characterCard.personnage.trait}
            objectif={characterCard.objectif}
            obstacle={characterCard.obstacle}
            pitchText={characterCard.pitchText}
          />
        </motion.div>
      )}

      {/* Film Vivant + Recap links */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: hasStats ? 1.5 : 0.8 }}
        className="flex flex-col gap-3 w-full max-w-xs"
      >
        <a
          href={`/play/${sessionId}/recap`}
          className="btn-glow block w-full py-3.5 rounded-xl bg-gradient-to-r from-bw-gold to-bw-primary text-white font-semibold text-center text-sm cursor-pointer shadow-[0_4px_20px_rgba(212,168,67,0.25)]"
        >
          Voir le film de la classe
        </a>
        <a
          href={`/play/${sessionId}/recap`}
          className="block w-full py-3 rounded-xl bg-bw-elevated border border-bw-gold/20 text-bw-gold font-medium text-center text-sm cursor-pointer hover:border-bw-gold/40 transition-colors"
        >
          Mes contributions
        </a>
        <a
          href={`/play/${sessionId}/bibliotheque`}
          className="flex items-center justify-center gap-2 w-full py-2.5 text-bw-muted text-xs hover:text-white/60 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          </svg>
          Ma bibliothèque complète
        </a>
      </motion.div>
    </motion.div>
  );
}

// ——— Module 10: Et si... Writer ———
function EtsiWriterState({
  module10, sessionId, studentId, onDone,
}: {
  module10: Module10Data; sessionId: string; studentId: string; onDone: () => void;
}) {
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
      <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400">
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
        className="w-full rounded-xl bg-bw-elevated border border-white/[0.06] p-3 text-sm text-bw-text placeholder-bw-muted resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
      />
      <div className="flex items-center gap-2 w-full">
        <div className="flex gap-1">
          {["example", "starter", "reformulate"].map((type) => (
            <button key={type} onClick={() => handleHelp(type)} disabled={helpLoading || helpCount >= 3}
              className="px-2 py-1 text-[10px] rounded-lg bg-bw-elevated border border-white/[0.06] text-bw-muted hover:text-cyan-400 hover:border-cyan-500/30 disabled:opacity-30 transition-colors cursor-pointer">
              {type === "example" ? "💡 Exemple" : type === "starter" ? "✏️ Amorce" : "🔄 Reformuler"}
            </button>
          ))}
        </div>
        {helpCount > 0 && <span className="text-[10px] text-bw-muted">{3 - helpCount} aide(s) restante(s)</span>}
      </div>
      <AnimatePresence>
        {helpHint && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="w-full p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300">
            {helpHint}
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={handleSubmit} disabled={submitting || text.trim().length < 5}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-medium text-sm disabled:opacity-40 transition-opacity cursor-pointer">
        {submitting ? "Envoi..." : "Envoyer mon « Et si... »"}
      </button>
    </motion.div>
  );
}

// ——— Module 10: Idea Bank ———
function IdeaBankState({
  module10, sessionId, studentId, onDone,
}: {
  module10: Module10Data; sessionId: string; studentId: string; onDone: () => void;
}) {
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
      await fetch(`/api/sessions/${sessionId}/idea-bank`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId }),
      });
    } catch { /* ignore */ }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center gap-4 w-full max-w-md mx-auto px-4">
      <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400">
        Banque d&apos;idées
      </span>
      {ideas.length > 0 && (
        <div className="w-full space-y-2 max-h-60 overflow-y-auto">
          {ideas.map((idea) => (
            <div key={idea.id} className="flex items-start gap-2 p-2 rounded-lg bg-bw-elevated border border-white/[0.06]">
              <p className="flex-1 text-xs text-bw-text">{idea.text}</p>
              <button onClick={() => handleVote(idea.id)} disabled={voted.has(idea.id)}
                className="shrink-0 px-2 py-1 text-[10px] rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-40 transition-colors cursor-pointer">
                ❤️ {idea.votes + (voted.has(idea.id) ? 1 : 0)}
              </button>
            </div>
          ))}
        </div>
      )}
      {!module10.submitted && (
        <>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Partage ton « Et si... » préféré..." rows={2} maxLength={300}
            className="w-full rounded-xl bg-bw-elevated border border-white/[0.06] p-3 text-sm text-bw-text placeholder-bw-muted resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/40" />
          <button onClick={handleSubmit} disabled={submitting || text.trim().length < 5}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-medium text-sm disabled:opacity-40 transition-opacity cursor-pointer">
            {submitting ? "Envoi..." : "Partager mon idée"}
          </button>
        </>
      )}
    </motion.div>
  );
}

// ——— Module 10: Avatar Done (show avatar after creation) ———
function AvatarDoneState({ prenom, avatar, responsesCount, connectedCount }: {
  prenom: string; avatar: AvatarOptions; responsesCount?: number; connectedCount?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center gap-5 text-center"
    >
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
      >
        <DiceBearAvatar options={avatar} size={160} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-1">
        <h2 className="text-2xl font-bold text-bw-heading">{prenom}</h2>
        <p className="text-sm text-bw-muted">Personnage créé !</p>
      </motion.div>

      {responsesCount != null && connectedCount != null && connectedCount > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-xs text-bw-muted bg-bw-elevated px-4 py-2 rounded-full border border-white/[0.06]">
          {responsesCount}/{connectedCount} ont répondu
        </motion.div>
      )}
    </motion.div>
  );
}

// ——— Module 10: Avatar Builder (Avataaars — buste diversité) ———
function AvatarBuilderState({
  module10, sessionId, studentId, onDone,
}: {
  module10: Module10Data; sessionId: string; studentId: string; onDone: (data: { prenom: string; age: string; trait: string; avatar: AvatarOptions }) => void;
}) {
  const [prenom, setPrenom] = useState(module10.personnage?.prenom || "");
  const [age, setAge] = useState(module10.personnage?.age || "");
  const [trait, setTrait] = useState(module10.personnage?.trait || "");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tab, setTab] = useState<"peau" | "coiffure" | "visage" | "style">("peau");

  // DiceBear Avataaars state
  const [avatarOpts, setAvatarOpts] = useState<AvatarOptions>(() => {
    const existing = module10.personnage?.avatar;
    if (existing && Array.isArray(existing.top)) return existing as AvatarOptions;
    return {
      top: ["shortFlat"],
      hairColor: ["2c1b18"],
      eyes: ["default"],
      eyebrows: ["default"],
      mouth: ["smile"],
      clothing: ["hoodie"],
      clothesColor: ["65c9ff"],
      skinColor: ["d08b5b"],
      accessoriesProbability: 0,
      facialHairProbability: 0,
      backgroundColor: ["06b6d4"],
    };
  });

  function setOpt(key: keyof AvatarOptions, value: string) {
    // Special: "__bald__" = chauve (topProbability: 0)
    if (key === "top" && value === "__bald__") {
      setAvatarOpts((prev) => ({ ...prev, topProbability: 0 }));
      return;
    }
    if (key === "top") {
      setAvatarOpts((prev) => ({ ...prev, top: [value], topProbability: 100 }));
      return;
    }
    setAvatarOpts((prev) => ({ ...prev, [key]: [value] }));
  }

  function setHeadwear(key: string) {
    if (key === "none") {
      // Remove headwear, keep current hair
      setAvatarOpts((prev) => ({ ...prev, top: prev.topProbability === 0 ? ["shortFlat"] : prev.top, topProbability: 100 }));
    } else {
      setAvatarOpts((prev) => ({ ...prev, top: [key], topProbability: 100 }));
    }
  }

  function setAccessory(key: string) {
    if (key === "none") {
      setAvatarOpts((prev) => ({ ...prev, accessories: undefined, accessoriesProbability: 0 }));
    } else {
      setAvatarOpts((prev) => ({ ...prev, accessories: [key], accessoriesProbability: 100 }));
    }
  }

  function setFacialHairOpt(key: string) {
    if (key === "none") {
      setAvatarOpts((prev) => ({ ...prev, facialHair: undefined, facialHairProbability: 0 }));
    } else {
      setAvatarOpts((prev) => ({ ...prev, facialHair: [key], facialHairProbability: 100 }));
    }
  }

  function randomize() {
    const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
    const hasFacialHair = Math.random() > 0.7;
    const hasAccessories = Math.random() > 0.5;
    const isBald = Math.random() > 0.9;
    const hasHat = !isBald && Math.random() > 0.75;
    const clothingKey = pick(AVATAR_CLOTHING).key;
    const hairOptions = AVATAR_TOP.filter((t) => t.key !== "__bald__");
    const hatOptions = AVATAR_HEADWEAR.filter((h) => h.key !== "none");
    const topChoice = isBald ? undefined : hasHat ? [pick(hatOptions).key] : [pick(hairOptions).key];
    const opts: AvatarOptions = {
      top: topChoice,
      topProbability: isBald ? 0 : 100,
      hairColor: [pick(AVATAR_HAIR_COLOR).key],
      eyes: [pick(AVATAR_EYES).key],
      eyebrows: [pick(AVATAR_EYEBROWS).key],
      mouth: [pick(AVATAR_MOUTH).key],
      clothing: [clothingKey],
      clothesColor: [pick(AVATAR_CLOTHES_COLOR).key],
      clothingGraphic: clothingKey === "graphicShirt" ? [pick(AVATAR_GRAPHIC).key] : undefined,
      skinColor: [pick(AVATAR_SKIN_COLOR).key],
      accessories: hasAccessories ? [pick(AVATAR_ACCESSORIES.slice(1)).key] : undefined,
      accessoriesProbability: hasAccessories ? 100 : 0,
      facialHair: hasFacialHair ? [pick(AVATAR_FACIAL_HAIR.slice(1)).key] : undefined,
      facialHairProbability: hasFacialHair ? 100 : 0,
      backgroundColor: [pick(AVATAR_BACKGROUND).key],
    };
    setAvatarOpts(opts);
    haptic();
  }

  const TRAITS_LOCAL = [
    { key: "courageux", label: "Courageux" }, { key: "timide", label: "Timide" },
    { key: "drole", label: "Drôle" }, { key: "rebelle", label: "Rebelle" },
    { key: "reveur", label: "Rêveur" }, { key: "loyal", label: "Loyal" },
    { key: "malin", label: "Malin" }, { key: "sensible", label: "Sensible" },
  ];

  async function handleSubmit() {
    if (!prenom.trim()) return;
    setSubmitting(true);
    try {
      const finalAvatar: AvatarOptions = { ...avatarOpts };
      await fetch(`/api/sessions/${sessionId}/personnage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, prenom: prenom.trim(), age, traitDominant: trait, avatarData: finalAvatar }),
      });
      setSuccess(true);
      setTimeout(() => onDone({ prenom: prenom.trim(), age, trait, avatar: finalAvatar }), 600);
    } catch { toast.error("Erreur"); setSubmitting(false); }
  }

  if (success) return <SuccessCheck />;

  const TABS = [
    { key: "peau" as const, label: "Peau" },
    { key: "coiffure" as const, label: "Coiffure" },
    { key: "visage" as const, label: "Visage" },
    { key: "style" as const, label: "Style" },
  ];

  const currentKey = (field: keyof AvatarOptions) => {
    // Show "__bald__" as selected when topProbability is 0
    if (field === "top" && avatarOpts.topProbability === 0) return "__bald__";
    const v = avatarOpts[field];
    return Array.isArray(v) ? v[0] : undefined;
  };
  const HEADWEAR_KEYS = new Set(AVATAR_HEADWEAR.filter(h => h.key !== "none").map(h => h.key));
  const currentHeadwear = avatarOpts.top?.[0] && HEADWEAR_KEYS.has(avatarOpts.top[0]) ? avatarOpts.top[0] : "none";
  const currentAccessory = avatarOpts.accessoriesProbability === 0 ? "none" : (avatarOpts.accessories?.[0] || "none");
  const currentFacialHair = avatarOpts.facialHairProbability === 0 ? "none" : (avatarOpts.facialHair?.[0] || "none");

  // Render a color swatch grid
  function SwatchGrid({ options, field }: { options: { key: string; label: string; color?: string }[]; field: keyof AvatarOptions }) {
    return (
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <motion.button key={opt.key} whileTap={{ scale: 0.9 }}
            onClick={() => { setOpt(field, opt.key); haptic(); }}
            title={opt.label}
            className={`w-10 h-10 rounded-full border-2 transition-all cursor-pointer ${
              currentKey(field) === opt.key
                ? "border-cyan-400 ring-2 ring-cyan-400/30 scale-110"
                : "border-white/10 hover:border-cyan-500/30"
            }`}
            style={{ backgroundColor: opt.color }} />
        ))}
      </div>
    );
  }

  // Render a labeled button grid
  function LabelGrid({ options, field, onSelect, selectedKey }: { options: { key: string; label: string }[]; field?: keyof AvatarOptions; onSelect?: (key: string) => void; selectedKey?: string }) {
    const selected = selectedKey ?? (field ? currentKey(field) : undefined);
    return (
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const isActive = selected === opt.key;
          return (
            <motion.button key={opt.key} whileTap={{ scale: 0.95 }}
              onClick={() => { if (onSelect) { onSelect(opt.key); haptic(); } else if (field) { setOpt(field, opt.key); haptic(); } }}
              className={`px-2.5 py-1.5 rounded-lg text-xs border transition-colors cursor-pointer ${
                isActive
                  ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                  : "bg-bw-elevated border-white/[0.06] text-bw-muted hover:border-cyan-500/20"
              }`}>
              {opt.label}
            </motion.button>
          );
        })}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center gap-4 w-full max-w-md mx-auto px-4">
      <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400">
        Mon personnage
      </span>

      {/* Avatar preview + randomize */}
      <div className="relative">
        <DiceBearAvatar options={avatarOpts} size={140} />
        <motion.button whileTap={{ scale: 0.85 }} onClick={randomize}
          className="absolute -right-2 -bottom-1 w-9 h-9 rounded-full bg-bw-elevated border border-white/10 flex items-center justify-center text-lg cursor-pointer hover:border-cyan-500/30 transition-colors"
          title="Aléatoire">
          <span role="img" aria-label="dé">🎲</span>
        </motion.button>
      </div>

      {/* Large randomize button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={randomize}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500/15 to-cyan-500/15 border border-purple-500/20 text-sm font-medium text-purple-300 flex items-center justify-center gap-2 cursor-pointer hover:from-purple-500/20 hover:to-cyan-500/20 hover:border-purple-500/30 transition-all"
      >
        <span className="text-base">🎲</span>
        Personnage aléatoire
      </motion.button>

      {/* Name + Age */}
      <div className="flex gap-2 w-full">
        <input value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Prénom" maxLength={30}
          className="flex-1 rounded-xl bg-bw-elevated border border-white/[0.06] px-3 py-2 text-sm text-bw-text placeholder-bw-muted focus:outline-none focus:ring-2 focus:ring-cyan-500/40" />
        <input value={age} onChange={(e) => setAge(e.target.value)} placeholder="Âge" maxLength={20}
          className="w-20 rounded-xl bg-bw-elevated border border-white/[0.06] px-3 py-2 text-sm text-bw-text placeholder-bw-muted focus:outline-none focus:ring-2 focus:ring-cyan-500/40" />
      </div>

      {/* Tab bar */}
      <div className="w-full overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 min-w-max">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                tab === t.key
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-bw-muted hover:text-bw-text border border-transparent"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="w-full min-h-[120px]">
        <AnimatePresence mode="wait">
          {tab === "peau" && (
            <motion.div key="peau" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-2">
              <p className="text-[10px] text-bw-muted uppercase tracking-wider">Teinte de peau</p>
              <SwatchGrid options={AVATAR_SKIN_COLOR} field="skinColor" />
            </motion.div>
          )}

          {tab === "coiffure" && (
            <motion.div key="coiffure" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-3">
              <div>
                <p className="text-[10px] text-bw-muted uppercase tracking-wider mb-1.5">Coiffure</p>
                <LabelGrid options={AVATAR_TOP} field="top" />
              </div>
              <div>
                <p className="text-[10px] text-bw-muted uppercase tracking-wider mb-1.5">Couleur cheveux</p>
                <SwatchGrid options={AVATAR_HAIR_COLOR} field="hairColor" />
              </div>
              <div>
                <p className="text-[10px] text-bw-muted uppercase tracking-wider mb-1.5">Couvre-chef</p>
                <LabelGrid options={AVATAR_HEADWEAR} onSelect={setHeadwear} selectedKey={currentHeadwear} />
              </div>
            </motion.div>
          )}

          {tab === "visage" && (
            <motion.div key="visage" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-3">
              <div>
                <p className="text-[10px] text-bw-muted uppercase tracking-wider mb-1.5">Yeux</p>
                <LabelGrid options={AVATAR_EYES} field="eyes" />
              </div>
              <div>
                <p className="text-[10px] text-bw-muted uppercase tracking-wider mb-1.5">Sourcils</p>
                <LabelGrid options={AVATAR_EYEBROWS} field="eyebrows" />
              </div>
              <div>
                <p className="text-[10px] text-bw-muted uppercase tracking-wider mb-1.5">Bouche</p>
                <LabelGrid options={AVATAR_MOUTH} field="mouth" />
              </div>
            </motion.div>
          )}

          {tab === "style" && (
            <motion.div key="style" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-3">
              <div>
                <p className="text-[10px] text-bw-muted uppercase tracking-wider mb-1.5">Vêtement</p>
                <LabelGrid options={AVATAR_CLOTHING} field="clothing" />
              </div>
              <div>
                <p className="text-[10px] text-bw-muted uppercase tracking-wider mb-1.5">Couleur vêtement</p>
                <SwatchGrid options={AVATAR_CLOTHES_COLOR} field="clothesColor" />
              </div>
              {currentKey("clothing") === "graphicShirt" && (
                <div>
                  <p className="text-[10px] text-bw-muted uppercase tracking-wider mb-1.5">Motif t-shirt</p>
                  <LabelGrid options={AVATAR_GRAPHIC} field="clothingGraphic" />
                </div>
              )}
              <div>
                <p className="text-[10px] text-bw-muted uppercase tracking-wider mb-1.5">Accessoires</p>
                <LabelGrid options={AVATAR_ACCESSORIES} onSelect={setAccessory} selectedKey={currentAccessory} />
              </div>
              <div>
                <p className="text-[10px] text-bw-muted uppercase tracking-wider mb-1.5">Barbe / Moustache</p>
                <LabelGrid options={AVATAR_FACIAL_HAIR} onSelect={setFacialHairOpt} selectedKey={currentFacialHair} />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Trait dominant */}
      <div className="w-full">
        <p className="text-[10px] text-bw-muted uppercase tracking-wider mb-1.5">Trait dominant</p>
        <div className="flex flex-wrap gap-1.5">
          {TRAITS_LOCAL.map((t) => (
            <motion.button key={t.key} whileTap={{ scale: 0.95 }}
              onClick={() => setTrait(t.key)}
              className={`px-2.5 py-1.5 rounded-lg text-xs border transition-colors cursor-pointer ${
                trait === t.key
                  ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                  : "bg-bw-elevated border-white/[0.06] text-bw-muted hover:border-cyan-500/20"
              }`}>
              {t.label}
            </motion.button>
          ))}
        </div>
      </div>

      <button onClick={handleSubmit} disabled={submitting || !prenom.trim()}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-medium text-sm disabled:opacity-40 transition-opacity cursor-pointer">
        {submitting ? "Envoi..." : "Valider mon personnage"}
      </button>
    </motion.div>
  );
}

// ——— Module 10: Objectif + Obstacle ———
function ObjectifObstacleState({
  module10, sessionId, studentId, onDone,
}: {
  module10: Module10Data; sessionId: string; studentId: string; onDone: (data: { objectif: string; obstacle: string }) => void;
}) {
  const [objectif, setObjectif] = useState(module10.objectif || "");
  const [obstacle, setObstacle] = useState(module10.obstacle || "");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const OBJECTIFS = [
    { key: "sauver", label: "Sauver quelqu'un" }, { key: "prouver", label: "Prouver quelque chose" },
    { key: "fuir", label: "S'échapper" }, { key: "trouver", label: "Trouver la vérité" },
    { key: "gagner", label: "Gagner un défi" }, { key: "proteger", label: "Protéger un secret" },
    { key: "changer", label: "Changer sa vie" }, { key: "venger", label: "Réparer une injustice" },
  ];
  const OBSTACLES = [
    { key: "rival", label: "Un rival puissant" }, { key: "mensonge", label: "Un mensonge" },
    { key: "temps", label: "Le temps qui presse" }, { key: "trahison", label: "Une trahison" },
    { key: "peur", label: "Sa propre peur" }, { key: "regles", label: "Les règles" },
    { key: "solitude", label: "La solitude" }, { key: "secret", label: "Un secret du passé" },
  ];

  async function handleSubmit() {
    if (!objectif || !obstacle) return;
    setSubmitting(true);
    try {
      await fetch(`/api/sessions/${sessionId}/pitch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, objectif, obstacle, pitchText: `${module10.personnage?.prenom || "Mon personnage"} veut ${objectif} mais ${obstacle}.` }),
      });
      setSuccess(true);
      setTimeout(() => onDone({ objectif, obstacle }), 600);
    } catch { toast.error("Erreur"); setSubmitting(false); }
  }

  if (success) return <SuccessCheck />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center gap-4 w-full max-w-md mx-auto px-4">
      <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/20 text-amber-400">
        Objectif &amp; Obstacle
      </span>
      {module10.personnage && (
        <p className="text-sm text-bw-text"><strong>{module10.personnage.prenom}</strong> veut...</p>
      )}
      <div className="w-full">
        <p className="text-[10px] text-bw-muted uppercase tracking-wider mb-1.5">Objectif</p>
        <div className="flex flex-wrap gap-1.5">
          {OBJECTIFS.map((o) => (
            <motion.button key={o.key} whileTap={{ scale: 0.95 }} onClick={() => setObjectif(o.key)}
              className={`px-2.5 py-1.5 rounded-lg text-xs border transition-colors cursor-pointer ${
                objectif === o.key ? "bg-amber-500/20 border-amber-500/40 text-amber-300" : "bg-bw-elevated border-white/[0.06] text-bw-muted hover:border-amber-500/20"
              }`}>{o.label}</motion.button>
          ))}
        </div>
      </div>
      <div className="w-full">
        <p className="text-[10px] text-bw-muted uppercase tracking-wider mb-1.5">Obstacle</p>
        <div className="flex flex-wrap gap-1.5">
          {OBSTACLES.map((o) => (
            <motion.button key={o.key} whileTap={{ scale: 0.95 }} onClick={() => setObstacle(o.key)}
              className={`px-2.5 py-1.5 rounded-lg text-xs border transition-colors cursor-pointer ${
                obstacle === o.key ? "bg-red-500/20 border-red-500/40 text-red-300" : "bg-bw-elevated border-white/[0.06] text-bw-muted hover:border-red-500/20"
              }`}>{o.label}</motion.button>
          ))}
        </div>
      </div>
      <button onClick={handleSubmit} disabled={submitting || !objectif || !obstacle}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium text-sm disabled:opacity-40 transition-opacity cursor-pointer">
        {submitting ? "Envoi..." : "Valider"}
      </button>
    </motion.div>
  );
}

// ——— Module 10: Pitch Assembly ———
function PitchAssemblyState({
  module10, sessionId, studentId, onDone,
}: {
  module10: Module10Data; sessionId: string; studentId: string; onDone: (data: { pitchText: string }) => void;
}) {
  const perso = module10.personnage;
  const template = `${perso?.prenom || "Mon personnage"} veut ${module10.objectif || "..."} mais ${module10.obstacle || "..."} l'en empêche.`;
  const [pitchText, setPitchText] = useState(module10.pitchText || template);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [helpHint, setHelpHint] = useState<string | null>(null);
  const [helpLoading, setHelpLoading] = useState(false);
  const [helpCount, setHelpCount] = useState(0);

  async function handleSubmit() {
    if (pitchText.trim().length < 10) return;
    setSubmitting(true);
    try {
      await fetch(`/api/sessions/${sessionId}/pitch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, objectif: module10.objectif || "", obstacle: module10.obstacle || "", pitchText: pitchText.trim() }),
      });
      setSuccess(true);
      setTimeout(() => onDone({ pitchText: pitchText.trim() }), 600);
    } catch { toast.error("Erreur"); setSubmitting(false); }
  }

  if (success) return <SuccessCheck />;

  async function handleHelp(type: string) {
    setHelpLoading(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/help-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, step: "pitch", helpType: type, context: perso?.prenom || pitchText }),
      });
      const data = await res.json();
      if (data.hint) { setHelpHint(data.hint); setHelpCount((c) => c + 1); }
    } catch { /* ignore */ }
    finally { setHelpLoading(false); }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center gap-4 w-full max-w-md mx-auto px-4">
      <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/20 text-amber-400">
        Mon pitch
      </span>
      {perso && (
        <div className="flex items-center gap-2 text-sm text-bw-text">
          <span className="text-lg">{perso.avatar?.accessory === "lunettes" ? "🤓" : "😊"}</span>
          <strong>{perso.prenom}</strong>
          {perso.trait && <span className="text-bw-muted">· {perso.trait}</span>}
        </div>
      )}
      <textarea value={pitchText} onChange={(e) => setPitchText(e.target.value)} rows={6} maxLength={600}
        placeholder="Écris ton pitch ici..."
        className="w-full rounded-xl bg-bw-elevated border border-white/[0.06] p-3 text-sm text-bw-text placeholder-bw-muted resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/40" />
      <div className="flex items-center gap-2 w-full">
        {["example", "starter", "reformulate"].map((type) => (
          <button key={type} onClick={() => handleHelp(type)} disabled={helpLoading || helpCount >= 3}
            className="px-2 py-1 text-[10px] rounded-lg bg-bw-elevated border border-white/[0.06] text-bw-muted hover:text-amber-400 hover:border-amber-500/30 disabled:opacity-30 transition-colors cursor-pointer">
            {type === "example" ? "💡" : type === "starter" ? "✏️" : "🔄"}
          </button>
        ))}
        <span className="text-[10px] text-bw-muted ml-auto">{pitchText.length}/600</span>
      </div>
      <AnimatePresence>
        {helpHint && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="w-full p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
            {helpHint}
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={handleSubmit} disabled={submitting || pitchText.trim().length < 10}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium text-sm disabled:opacity-40 transition-opacity cursor-pointer">
        {submitting ? "Envoi..." : "Valider mon pitch"}
      </button>
    </motion.div>
  );
}

// ——— Module 10: Chrono Test ———
function ChronoTestState({
  module10, sessionId, studentId, onDone,
}: {
  module10: Module10Data; sessionId: string; studentId: string; onDone: (data: { chronoSeconds: number }) => void;
}) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(module10.chronoSeconds != null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const DURATION = 60;

  useEffect(() => {
    if (running && elapsed < DURATION) {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev >= DURATION - 1) {
            setRunning(false);
            return DURATION;
          }
          return prev + 1;
        });
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [running, elapsed]);

  async function handleStop() {
    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setDone(true);
    try {
      await fetch(`/api/sessions/${sessionId}/pitch`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, chronoSeconds: elapsed }),
      });
      onDone({ chronoSeconds: elapsed });
    } catch { toast.error("Erreur"); }
  }

  const remaining = DURATION - elapsed;
  const isLow = remaining <= 10;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center gap-6 w-full max-w-md mx-auto px-4">
      <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/20 text-amber-400">
        Chrono Pitch
      </span>
      {module10.pitchText && (
        <div className="w-full p-3 rounded-xl bg-bw-elevated border border-white/[0.06] text-xs text-bw-muted max-h-32 overflow-y-auto">
          {module10.pitchText}
        </div>
      )}
      <motion.div
        animate={running && isLow ? { scale: [1, 1.05, 1] } : {}}
        transition={running && isLow ? { repeat: Infinity, duration: 1 } : {}}
        className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-colors ${
          done ? "border-green-500/40" : isLow ? "border-red-500/60" : running ? "border-amber-500/40" : "border-white/10"
        }`}>
        <span className={`text-4xl font-bold tabular-nums ${isLow && running ? "text-red-400" : "text-bw-text"}`}>
          {done ? (module10.chronoSeconds ?? elapsed) : remaining}
        </span>
      </motion.div>
      <p className="text-xs text-bw-muted text-center">
        {done ? "Chrono terminé !" : running ? "Lis ton pitch à voix haute !" : "Appuie sur START quand tu es prêt"}
      </p>
      {!done && !running && (
        <button onClick={() => setRunning(true)}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-lg cursor-pointer">
          START
        </button>
      )}
      {running && (
        <button onClick={handleStop}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-sm cursor-pointer">
          J&apos;ai fini !
        </button>
      )}
    </motion.div>
  );
}

// ——— Module 10: Pitch Confrontation ———
function PitchConfrontationState({
  module10,
}: {
  module10: Module10Data;
}) {
  const confrontation = module10.confrontation;

  if (!confrontation) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 text-center">
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2 }}
          className="text-sm text-bw-muted">En attente de la sélection du facilitateur...</motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center gap-4 w-full max-w-md mx-auto px-4">
      <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/20 text-amber-400">
        Confrontation
      </span>
      <div className="grid grid-cols-2 gap-3 w-full">
        {[confrontation.pitchA, confrontation.pitchB].map((pitch, i) => (
          <div key={i} className="p-3 rounded-xl bg-bw-elevated border border-white/[0.06] space-y-2">
            <p className="text-xs font-medium text-cyan-400">{pitch.prenom}</p>
            <p className="text-xs text-bw-text leading-relaxed">{pitch.text}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-bw-muted text-center">Écoute les deux pitchs et prépare-toi à voter !</p>
    </motion.div>
  );
}

// ——— Main Page ———
export default function PlayPage() {
  const { id: sessionId } = useParams<{ id: string }>();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [voting, setVoting] = useState(false);
  const [budgetDone, setBudgetDone] = useState(false);
  const [checklistDone, setChecklistDone] = useState(false);
  const [sceneDone, setSceneDone] = useState(false);
  const [etsiDone, setEtsiDone] = useState(false);
  const [characterCard, setCharacterCard] = useState<{
    personnage: { prenom: string; age: string; trait: string; avatar: AvatarOptions };
    objectif?: string;
    obstacle?: string;
    pitchText?: string;
    chronoSeconds?: number;
    revealLevel: 0 | 1 | 2 | 3;
  } | null>(null);
  const [storyContext, setStoryContext] = useState<Record<string, string>>({});
  const [relanceData, setRelanceData] = useState<{
    text: string;
    responseId: string;
    situationId: string;
  } | null>(null);

  // Engagement tracking
  const [streak, setStreak] = useState(1);
  const [comboCount, setComboCount] = useState(0);
  const [collectedCategories, setCollectedCategories] = useState<{ key: string; label: string; color: string }[]>([]);
  const [gameStats, setGameStats] = useState({ responses: 0, retained: 0, bestStreak: 1 });

  const [noStudent, setNoStudent] = useState(false);
  const [studentLoaded, setStudentLoaded] = useState(false);
  const [waitingFullscreen, setWaitingFullscreen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [broadcastMsg, setBroadcastMsg] = useState<string | null>(null);
  const lastBroadcastAt = useRef<string | null>(null);
  const isOnline = useOnlineStatus();
  const { play } = useSound();

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
  }, []);

  // Reconnection toast
  const wasOnlineRef = useRef(true);
  useEffect(() => {
    if (isOnline && !wasOnlineRef.current) {
      toast.success("Reconnecté", { duration: 2000 });
    }
    wasOnlineRef.current = isOnline;
  }, [isOnline]);

  // Play jingle on first load
  useEffect(() => {
    if (showIntro) {
      const t = setTimeout(() => play("jingle"), 300);
      return () => clearTimeout(t);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Recover student info from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`bw-student-${sessionId}`);
      if (stored) {
        const { studentId: sid } = JSON.parse(stored);
        setStudentId(sid);
      } else {
        setNoStudent(true);
      }
    } catch {
      // Corrupted localStorage — force re-join
      localStorage.removeItem(`bw-student-${sessionId}`);
      setNoStudent(true);
    }
    setStudentLoaded(true);
  }, [sessionId]);

  const { data, isLoading, error } = useSessionPolling(sessionId, studentId);

  const isFreeMode = data?.session?.mode === "free";

  // Broadcast message from teacher
  useEffect(() => {
    if (!data?.session?.broadcastMessage || !data.session.broadcastAt) return;
    if (data.session.broadcastAt === lastBroadcastAt.current) return;
    lastBroadcastAt.current = data.session.broadcastAt;
    setBroadcastMsg(data.session.broadcastMessage);
    play("vote");
    // Auto-dismiss after 12s
    const t = setTimeout(() => setBroadcastMsg(null), 12000);
    return () => clearTimeout(t);
  }, [data?.session?.broadcastMessage, data?.session?.broadcastAt, play]);

  // Smart scroll to top on game state change
  const prevViewKeyRef = useRef<string>("");
  useEffect(() => {
    if (!data) return;
    const vk = `${data.session.status}-${data.situation?.id || ""}-${data.hasResponded}-${data.hasVoted}`;
    if (prevViewKeyRef.current && vk !== prevViewKeyRef.current) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    prevViewKeyRef.current = vk;
  }, [data]);

  // Reset budgetDone when module or situation changes
  // Only clear relanceData if module changes (not situation index — free mode auto-advances)
  const currentModule = data?.session?.currentModule;
  const currentSituationIndex = data?.session?.currentSituationIndex;
  useEffect(() => {
    setBudgetDone(false);
    setChecklistDone(false);
    setSceneDone(false);
  }, [currentModule, currentSituationIndex]);
  useEffect(() => {
    setRelanceData(null);
  }, [currentModule]);

  // Fetch story context for budget (Module 9, old M2)
  useEffect(() => {
    if (currentModule !== 9) return;
    fetch(`/api/sessions/${sessionId}/budget?context=true`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.storyContext) setStoryContext(d.storyContext);
      })
      .catch(() => { /* Budget context is optional — student can still play */ });
  }, [sessionId, currentModule]);

  // Play reveal sound when collective choice appears + celebrate if student's idea was chosen
  const prevChoiceRef = useRef<string | null>(null);
  useEffect(() => {
    const choiceId = data?.collectiveChoice?.id || null;
    if (choiceId && choiceId !== prevChoiceRef.current) {
      play("reveal");
      haptic(20);

      // Collect category badge
      if (data?.collectiveChoice) {
        const cat = data.collectiveChoice.category;
        const label = data.collectiveChoice.restitution_label || cat;
        const color = CATEGORY_COLORS[cat] || "#FF6B35";
        setCollectedCategories((prev) => {
          if (prev.some((c) => c.key === cat && c.label === label)) return prev;
          return [...prev, { key: cat, label, color }];
        });
      }

      if (data?.isMyResponseChosen) {
        const newCombo = comboCount + 1;
        setComboCount(newCombo);
        setGameStats((prev) => ({ ...prev, retained: prev.retained + 1 }));
        setTimeout(() => {
          play("success");
          // Escalating confetti for combos
          if (newCombo >= 3) {
            fireConfetti();
            setTimeout(() => fireConfetti(), 300);
          } else {
            fireConfetti();
          }
          toast.success(
            newCombo >= 2
              ? `Combo x${newCombo} ! Encore ton idée retenue !`
              : "Ton idée a été retenue par la classe !",
            { duration: 5000 }
          );
        }, 2500); // After suspense reveal
      }
    }
    prevChoiceRef.current = choiceId;
  }, [data?.collectiveChoice?.id, data?.isMyResponseChosen, play]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleRespond(text: string) {
    if (!studentId || !data?.situation) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          situationId: data.situation.id,
          text,
        }),
      });

      const responseData = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(responseData?.error || "Erreur lors de l'envoi");
      } else {
        play("send");
        haptic(10);

        // Track streak + stats
        setStreak((prev) => prev + 1);
        setGameStats((prev) => ({
          ...prev,
          responses: prev.responses + 1,
          bestStreak: Math.max(prev.bestStreak, streak + 1),
        }));

        // Module 3/4: trigger AI relance
        if ((data.session.currentModule === 3 || data.session.currentModule === 4) && responseData?.id) {
          try {
            const relanceRes = await fetch(`/api/sessions/${sessionId}/relance`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                studentId,
                responseId: responseData.id,
              }),
            });
            if (relanceRes.ok) {
              const { relanceText } = await relanceRes.json();
              if (relanceText) {
                setRelanceData({
                  text: relanceText,
                  responseId: responseData.id,
                  situationId: data.situation.id,
                });
              }
            }
          } catch {
            // Relance failed silently — student continues normally
          }
        }
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRelanceSubmit(text: string) {
    if (!relanceData) return;
    try {
      await fetch(`/api/sessions/${sessionId}/relance`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responseId: relanceData.responseId,
          relanceResponse: text,
        }),
      });
      play("send");
    } catch {
      // Silent fail
    }
    setRelanceData(null);
  }

  function handleRelanceSkip() {
    setRelanceData(null);
  }

  // Compute global progress for free mode (across all séances)
  const freeProgress = data ? (() => {
    const mod = data.session.currentModule;
    const seanceMap = MODULE_SEANCE_SITUATIONS[mod] ?? SEANCE_SITUATIONS;
    let completed = 0;
    for (let s = 1; s < data.session.currentSeance; s++) {
      completed += seanceMap[s] || 0;
    }
    completed += data.session.currentSituationIndex;
    const totalForModule = Object.values(seanceMap).reduce((a, b) => a + b, 0);
    return { current: completed + 1, total: totalForModule || TOTAL_SITUATIONS };
  })() : null;

  async function handleVote(chosenResponseId: string) {
    if (!studentId || !data?.situation) return;
    setVoting(true);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          situationId: data.situation.id,
          chosenResponseId,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || "Erreur lors du vote");
      } else {
        play("vote");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setVoting(false);
    }
  }

  // Determine which state to render
  function getView() {
    if (!data) return null;
    const { session, situation, hasResponded, hasVoted, voteOptions, collectiveChoice, connectedCount, responsesCount } = data;

    // Module 1 — Redesign Adrian — 3 types: positioning, image, notebook
    if (session.currentModule === 1 && data.module1 && (session.status === "responding" || (isFreeMode && session.status === "waiting"))) {
      switch (data.module1.type) {
        case "positioning":
          return (
            <PositioningState
              key={`m1-pos-${session.currentSituationIndex}`}
              module1={data.module1}
              sessionId={sessionId}
              studentId={studentId!}
              currentSituationIndex={session.currentSituationIndex}
              onAnswered={() => play("send")}
            />
          );
        case "image":
          return (
            <ImageQuestionState
              key={`m1-img-${data.module1.currentSeance}`}
              module1={data.module1}
              sessionId={sessionId}
              studentId={studentId!}
              onAnswered={() => play("send")}
            />
          );
        case "notebook":
          return (
            <NotebookState
              key="m1-notebook"
              module1={data.module1}
              sessionId={sessionId}
              studentId={studentId!}
              onAnswered={() => play("send")}
            />
          );
      }
    }

    // Module 1 waiting (guided mode)
    if (session.currentModule === 1 && data.module1 && session.status === "waiting") {
      if (data.module1.type === "image" && data.module1.image) {
        return (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-5 w-full max-w-md mx-auto px-4"
            >
              <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-bw-violet/20 text-bw-violet">
                {data.module1.image.title || `Image ${data.module1.image.position}`}
              </span>
              <div
                className="w-full rounded-xl overflow-hidden border border-white/[0.06] cursor-pointer"
                onClick={() => setWaitingFullscreen(true)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.module1.image.url}
                  alt={data.module1.image.title}
                  className="w-full object-contain"
                />
              </div>
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-center space-y-1"
              >
                <p className="text-sm text-bw-muted">Observe bien cette image...</p>
                <p className="text-xs text-bw-muted">La question arrive bientôt</p>
              </motion.div>
            </motion.div>
            {/* Fullscreen overlay */}
            <AnimatePresence>
              {waitingFullscreen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
                  onClick={() => setWaitingFullscreen(false)}
                >
                  <button
                    onClick={() => setWaitingFullscreen(false)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white cursor-pointer hover:bg-white/20 transition-colors z-10"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={data.module1.image.url}
                    alt={data.module1.image.title}
                    className="max-w-full max-h-full object-contain"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        );
      }
      // Positioning or notebook waiting
      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-bw-violet/20 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round">
              {data.module1.type === "positioning"
                ? <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></>
                : <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></>
              }
            </svg>
          </div>
          <p className="text-sm text-bw-violet font-medium">
            {data.module1.type === "positioning" ? "Positionnement" : "Carnet d'idées"}
          </p>
          <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2 }}
            className="text-xs text-bw-muted">En attente du facilitateur...</motion.p>
        </motion.div>
      );
    }

    // ── MODULE 2: Émotion Cachée — special components ──
    // Séance 1 index 0 — Checklist
    if (session.currentModule === 2 && session.currentSeance === 1 && session.currentSituationIndex === 0 && session.status === "responding") {
      if (checklistDone || data.module5?.submitted) {
        return <SentState responsesCount={responsesCount} connectedCount={connectedCount} streak={streak} />;
      }
      if (data.module5?.type === "checklist") {
        return (
          <ChecklistState
            key="m2ec-checklist"
            sessionId={sessionId}
            studentId={studentId!}
            module5={data.module5}
            onDone={() => { setChecklistDone(true); play("send"); }}
          />
        );
      }
    }

    // Séance 2 index 1 — Scene Builder
    if (session.currentModule === 2 && session.currentSeance === 2 && session.currentSituationIndex === 1 && session.status === "responding") {
      if (sceneDone || data.module5?.submitted) {
        return <SentState responsesCount={responsesCount} connectedCount={connectedCount} streak={streak} />;
      }
      if (data.module5?.type === "scene-builder") {
        return (
          <SceneBuilderState
            key="m2ec-scene"
            sessionId={sessionId}
            studentId={studentId!}
            module5={data.module5}
            onDone={() => { setSceneDone(true); play("send"); }}
          />
        );
      }
    }

    // Séance 3 — Comparison display above standard question
    // The comparison data is shown in the situation prompt area, standard Q&A for the response
    // (comparison scenes are displayed on screen page for projection, students just answer the open questions)

    // ── MODULE 10: Et si... + Pitch — special components ──
    if (session.currentModule === 10 && data.module10 && session.status === "responding") {
      const m10 = data.module10;

      // Séance 1: Et si...
      if (session.currentSeance === 1) {
        if (m10.type === "etsi") {
          if (etsiDone || m10.submitted) return <SentState responsesCount={responsesCount} connectedCount={connectedCount} streak={streak} />;
          return <EtsiWriterState key="m10-etsi" module10={m10} sessionId={sessionId} studentId={studentId!} onDone={() => { setEtsiDone(true); play("send"); }} />;
        }
        if (m10.type === "idea-bank") {
          if (m10.submitted) return <SentState responsesCount={responsesCount} connectedCount={connectedCount} streak={streak} />;
          return <IdeaBankState key="m10-ideas" module10={m10} sessionId={sessionId} studentId={studentId!} onDone={() => play("send")} />;
        }
        // QCM falls through to standard Q&A below
      }

      // Séance 2: Pitch — progressive character card
      if (session.currentSeance === 2) {
        // Reconnection: rebuild characterCard from API data if not in local state
        if (!characterCard && m10.personnage && m10.submitted) {
          let rl: 0 | 1 | 2 | 3 = 0;
          const persoData = { prenom: m10.personnage.prenom, age: m10.personnage.age, trait: m10.personnage.trait, avatar: m10.personnage.avatar as unknown as AvatarOptions };
          const rebuilt: Parameters<typeof setCharacterCard>[0] = { personnage: persoData, revealLevel: rl };
          if (rebuilt && m10.objectif) { rebuilt.objectif = m10.objectif; rebuilt.obstacle = m10.obstacle ?? undefined; rl = 1; }
          if (rebuilt && m10.pitchText) { rebuilt.pitchText = m10.pitchText; rl = 2; }
          if (rebuilt && m10.chronoSeconds != null) { rebuilt.chronoSeconds = m10.chronoSeconds; rl = 3; }
          if (rebuilt) rebuilt.revealLevel = rl;
          // Use setTimeout to avoid setting state during render
          setTimeout(() => setCharacterCard(rebuilt), 0);
        }

        if (m10.type === "avatar") {
          if (characterCard) return <CharacterCard {...characterCard} responsesCount={responsesCount} connectedCount={connectedCount} />;
          if (m10.submitted && m10.personnage) return <CharacterCard personnage={{ prenom: m10.personnage.prenom, age: m10.personnage.age, trait: m10.personnage.trait, avatar: m10.personnage.avatar as unknown as AvatarOptions }} revealLevel={0} responsesCount={responsesCount} connectedCount={connectedCount} />;
          if (m10.submitted) return <SentState responsesCount={responsesCount} connectedCount={connectedCount} streak={streak} />;
          return <AvatarBuilderState key="m10-avatar" module10={m10} sessionId={sessionId} studentId={studentId!} onDone={(data) => { setCharacterCard({ personnage: data, revealLevel: 0 }); play("cardReveal"); }} />;
        }
        if (m10.type === "objectif") {
          if (characterCard && characterCard.revealLevel >= 1) return <CharacterCard {...characterCard} responsesCount={responsesCount} connectedCount={connectedCount} />;
          if (m10.submitted && characterCard) return <CharacterCard {...characterCard} objectif={m10.objectif ?? undefined} obstacle={m10.obstacle ?? undefined} revealLevel={1} responsesCount={responsesCount} connectedCount={connectedCount} />;
          if (m10.submitted) return <SentState responsesCount={responsesCount} connectedCount={connectedCount} streak={streak} />;
          return <ObjectifObstacleState key="m10-objectif" module10={m10} sessionId={sessionId} studentId={studentId!} onDone={(d) => { setCharacterCard((prev) => prev ? { ...prev, objectif: d.objectif, obstacle: d.obstacle, revealLevel: 1 } : prev); play("cardReveal"); }} />;
        }
        if (m10.type === "pitch") {
          if ((characterCard && characterCard.revealLevel >= 2) || m10.submitted) {
            if (characterCard) return <CharacterCard {...characterCard} pitchText={characterCard.pitchText || m10.pitchText || undefined} revealLevel={Math.max(characterCard.revealLevel, 2) as 0 | 1 | 2 | 3} responsesCount={responsesCount} connectedCount={connectedCount} />;
            return <SentState responsesCount={responsesCount} connectedCount={connectedCount} streak={streak} />;
          }
          return <PitchAssemblyState key="m10-pitch" module10={m10} sessionId={sessionId} studentId={studentId!} onDone={(d) => { setCharacterCard((prev) => prev ? { ...prev, pitchText: d.pitchText, revealLevel: 2 } : prev); play("cardReveal"); }} />;
        }
        if (m10.type === "chrono") {
          if ((characterCard && characterCard.revealLevel >= 3) || m10.submitted) {
            if (characterCard) return <CharacterCard {...characterCard} chronoSeconds={characterCard.chronoSeconds ?? m10.chronoSeconds ?? undefined} revealLevel={3} responsesCount={responsesCount} connectedCount={connectedCount} />;
            return <SentState responsesCount={responsesCount} connectedCount={connectedCount} streak={streak} />;
          }
          return <ChronoTestState key="m10-chrono" module10={m10} sessionId={sessionId} studentId={studentId!} onDone={(d) => { setCharacterCard((prev) => prev ? { ...prev, chronoSeconds: d.chronoSeconds, revealLevel: 3 } : prev); play("cardReveal"); fireConfetti(); }} />;
        }
        if (m10.type === "confrontation") {
          return <PitchConfrontationState key="m10-confrontation" module10={m10} />;
        }
      }
    }

    // Module 9 séance 2 — Budget game (other séances use regular Q&A)
    if (session.currentModule === 9 && (session.currentSeance || 1) === 2 && session.status === "responding") {
      if (budgetDone) {
        if (isFreeMode) return <SentState />;
        return <SentState responsesCount={responsesCount} connectedCount={connectedCount} streak={streak} />;
      }
      return <BudgetState sessionId={sessionId} studentId={studentId!} storyContext={storyContext} onDone={() => { setBudgetDone(true); play("send"); }} />;
    }

    // Done
    if (session.status === "done") return <DoneState sessionId={sessionId} stats={gameStats} characterCard={characterCard} />;

    // Paused
    if (session.status === "paused") return <PausedState />;

    // AI Relance — show if pending
    // Free mode: always show (server already advanced, relance is for the previous question)
    // Guided mode: only show if still on the same situation
    if (relanceData && (isFreeMode || relanceData.situationId === situation?.id)) {
      return (
        <RelanceState
          key={`relance-${relanceData.responseId}`}
          relanceText={relanceData.text}
          onSubmit={handleRelanceSubmit}
          onSkip={handleRelanceSkip}
        />
      );
    }

    // Free mode: skip vote/review, just show situation or done
    if (isFreeMode) {
      if (session.status === "responding" && situation) {
        // In free mode, hasResponded means the server auto-advanced.
        // The polling will pick up the new situation, so just show the form.
        return <SituationState key={situation.id} situation={situation} onSubmit={handleRespond} submitting={submitting} />;
      }
      return <WaitingState session={session} connectedCount={connectedCount} />;
    }

    // Reviewing — show result if choice exists, otherwise wait
    if (session.status === "reviewing") {
      if (collectiveChoice) return <ResultState collectiveChoice={collectiveChoice} isMyResponseChosen={data.isMyResponseChosen} comboCount={comboCount} onReveal={() => play("drumroll")} />;
      return <WaitingState session={session} connectedCount={connectedCount} />;
    }

    // Voting
    if (session.status === "voting" && situation) {
      if (hasVoted) return <SentState />; // No counter needed during vote
      return <VoteState key={situation.id} voteOptions={voteOptions} situation={situation} onVote={handleVote} voting={voting} />;
    }

    // Responding
    if (session.status === "responding" && situation) {
      if (hasResponded) return <SentState responsesCount={responsesCount} connectedCount={connectedCount} streak={streak} />;
      return <SituationState key={situation.id} situation={situation} onSubmit={handleRespond} submitting={submitting} />;
    }

    // Waiting (default)
    return <WaitingState session={session} connectedCount={connectedCount} />;
  }

  if (noStudent) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-16 h-16 rounded-full bg-bw-primary/20 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round">
            <rect x="2" y="2" width="20" height="20" rx="2.18" />
            <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 7h5M17 17h5" />
          </svg>
        </div>
        <p className="text-bw-muted text-center">Tu dois d&apos;abord rejoindre la partie</p>
        <a href="/join" className="text-bw-primary font-medium cursor-pointer">Rejoindre</a>
      </div>
    );
  }

  if (!studentLoaded || isLoading) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-8">
        {/* Skeleton header */}
        <div className="fixed top-0 left-0 right-0 z-10 bg-bw-bg border-b border-white/[0.06]">
          <div className="px-4 py-2.5 flex justify-between items-center">
            <div className="h-4 w-24 rounded bg-white/[0.06] animate-pulse" />
            <div className="h-3 w-16 rounded bg-white/[0.06] animate-pulse" />
            <div className="h-3 w-10 rounded bg-white/[0.06] animate-pulse" />
          </div>
          <div className="h-1 bg-white/[0.03]" />
        </div>
        {/* Skeleton content */}
        <div className="w-full max-w-md mt-12 space-y-5">
          {/* Prompt skeleton */}
          <div className="bg-bw-elevated rounded-xl p-5 space-y-3 border border-white/[0.06]">
            <div className="h-4 w-3/4 rounded bg-white/[0.06] animate-pulse" />
            <div className="h-4 w-full rounded bg-white/[0.06] animate-pulse" />
            <div className="h-4 w-2/3 rounded bg-white/[0.06] animate-pulse" />
          </div>
          {/* Textarea skeleton */}
          <div className="bg-bw-elevated rounded-xl p-4 h-20 border border-white/[0.06] animate-pulse" />
          {/* Button skeleton */}
          <div className="flex justify-end">
            <div className="h-12 w-28 rounded-xl bg-white/[0.06] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          </div>
          <p className="text-bw-muted">Session introuvable ou expirée</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-glow px-4 py-2 bg-bw-primary text-white rounded-xl text-sm font-medium cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Kicked: student was excluded after 3 warnings
  if (data.studentKicked) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-4 gap-6">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
          </svg>
        </div>
        <div className="text-center space-y-2">
          <p className="text-xl font-bold text-red-400">Session terminée</p>
          <p className="text-bw-muted text-sm">Tu as reçu 3 avertissements et tu as été retiré de la session.</p>
        </div>
      </div>
    );
  }

  // Compute view key for cinema transitions
  const viewKey = data.session.status === "done" ? "done"
    : data.session.status === "paused" ? "paused"
    : `${data.session.status}-${data.situation?.id || "no-sit"}-${data.hasResponded}-${data.hasVoted}-${!!data.collectiveChoice}`;

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-8">
      {/* Cinematic intro */}
      <AnimatePresence>
        {showIntro && <CinematicIntro onComplete={handleIntroComplete} />}
      </AnimatePresence>

      {/* Warning banner */}
      <AnimatePresence>
        {data.studentWarnings > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="w-full max-w-md mb-3"
          >
            <div className={`px-4 py-2.5 rounded-xl text-center text-sm font-medium ${
              data.studentWarnings >= 2
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-bw-amber/20 text-bw-amber border border-bw-amber/30"
            }`}>
              ⚠️ Avertissement {data.studentWarnings}/3
              {data.studentWarnings >= 2 && " — Prochain = exclusion"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Teacher nudge banner */}
      <AnimatePresence>
        {data.teacherNudge && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full max-w-md mb-3"
          >
            <div className="px-4 py-3 rounded-xl bg-bw-amber/10 border border-bw-amber/30 text-center space-y-1">
              <p className="text-[10px] text-bw-amber font-semibold uppercase tracking-wider">Message du prof</p>
              <p className="text-sm text-bw-amber">{data.teacherNudge}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Broadcast message from teacher */}
      <AnimatePresence>
        {broadcastMsg && (
          <motion.div
            initial={{ height: 0, opacity: 0, scale: 0.95 }}
            animate={{ height: "auto", opacity: 1, scale: 1 }}
            exit={{ height: 0, opacity: 0, scale: 0.95 }}
            className="w-full max-w-md mb-3"
          >
            <div className="px-4 py-3 rounded-xl bg-bw-primary/15 border border-bw-primary/30 text-center space-y-1 relative">
              <p className="text-[10px] text-bw-primary font-semibold uppercase tracking-wider">Message du prof</p>
              <p className="text-sm text-white font-medium">{broadcastMsg}</p>
              <button
                onClick={() => setBroadcastMsg(null)}
                className="absolute top-1.5 right-2 text-bw-muted hover:text-white text-xs cursor-pointer"
              >✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-red-500/90 text-white text-center py-2 text-sm font-medium"
          >
            Pas de connexion internet
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with enhanced progress */}
      <div className={`fixed ${!isOnline ? "top-8" : "top-0"} left-0 right-0 z-10 backdrop-blur-md transition-all border-b border-white/[0.06]`}
        style={{ background: "linear-gradient(90deg, rgba(18,20,24,0.95), rgba(18,20,24,0.92) 50%, rgba(18,20,24,0.95))" }}>
        <div className="px-4 py-2.5 flex justify-between items-center">
          <span className="font-cinema text-base tracking-[0.15em] uppercase">
            <BrandLogo />
          </span>

          {/* Center: progress label */}
          {data.session.status !== "done" && (() => {
            const mod = data.session.currentModule;
            const seance = data.session.currentSeance;
            const seanceLabels: Record<number, string> = { 1: "Acte I", 2: "Acte II", 3: "Acte III" };
            // Module 3/4: show "Séquence X/Y — Acte Z"
            if ((mod === 3 || mod === 4) && !isFreeMode && data.situation) {
              const seanceMax = getSeanceMax(mod, seance);
              return (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-bw-primary bg-bw-primary/10 px-2 py-0.5 rounded-full">
                    {seanceLabels[seance] || `Séance ${seance}`}
                  </span>
                  <span className="text-xs text-bw-muted tabular-nums">
                    Q{data.situation.position}/{seanceMax}
                  </span>
                </div>
              );
            }
            // Free mode
            if (isFreeMode && freeProgress) {
              return (
                <span className="text-xs text-bw-primary font-medium tabular-nums">
                  Question {freeProgress.current}/{freeProgress.total}
                </span>
              );
            }
            // Module 1
            if (mod === 1 && data.module1) {
              return (
                <span className="text-xs text-bw-violet font-medium">
                  {data.module1.type === "positioning" ? `Q${(data.session.currentSituationIndex || 0) + 1}/8`
                    : data.module1.type === "image" && data.module1.image ? data.module1.image.title
                    : data.module1.type === "notebook" ? "Carnet" : ""}
                </span>
              );
            }
            return null;
          })()}

          {/* Right: timer or online count */}
          <div className="flex items-center gap-2">
            {data.session.timerEndsAt && new Date(data.session.timerEndsAt).getTime() > Date.now() && (
              <CountdownTimer endsAt={data.session.timerEndsAt} size="sm" />
            )}
            {!isFreeMode && (
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-bw-teal" />
                <span className="text-[10px] text-bw-muted tabular-nums">{data.connectedCount}</span>
              </div>
            )}
          </div>
        </div>
        {/* Progress bar — visible for all modules now */}
        {data.session.status !== "done" && (
          <div className="h-1 bg-white/[0.04]">
            <motion.div
              className="h-full rounded-r-full"
              style={{ background: "linear-gradient(90deg, #FF6B35, #D4A843)" }}
              animate={{
                width: data.session.currentModule === 1
                  ? `${((data.module1?.currentSeance || 1) / (data.module1?.totalSeances || 5)) * 100}%`
                  : isFreeMode && freeProgress
                    ? `${(freeProgress.current / freeProgress.total) * 100}%`
                    : `${((data.session.currentSituationIndex + 1) / getSeanceMax(data.session.currentModule, data.session.currentSeance)) * 100}%`
              }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>
        )}
      </div>

      {/* Category badges — film building up */}
      {collectedCategories.length > 0 && (
        <div className="w-full max-w-md mt-12 mb-2 overflow-x-auto">
          <div className="flex gap-1.5 px-1">
            <AnimatePresence>
              {collectedCategories.map((cat) => (
                <motion.span
                  key={`${cat.key}-${cat.label}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="flex-shrink-0 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                  style={{ color: cat.color, borderColor: `${cat.color}40`, backgroundColor: `${cat.color}10` }}
                >
                  {cat.label}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={`w-full max-w-md ${collectedCategories.length > 0 ? "" : "mt-12"}`}>
        <AnimatePresence mode="wait">
          <CinemaFade viewKey={viewKey}>
            {getView()}
          </CinemaFade>
        </AnimatePresence>
      </div>
    </div>
  );
}
