"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TicketIllustration } from "@/components/cinema-illustrations";

const AVATARS = ["🎬", "🎭", "🎥", "🎤", "🎨", "🎵", "🌟", "💫", "🔥", "⚡", "🎯", "🚀"];

const RANDOM_NAMES = [
  "RealisateurFou", "StarDuCinema", "ClapDeDebut", "ScenaristeNinja",
  "CameraAction", "LumiereTamisee", "DoublureCascade", "FigurantStar",
  "MonteurAgile", "ProducteurZen", "CastingDivin", "EffetSpecial",
  "PlanSequence", "ChampContreChamp", "FondVert", "GrosPlanned",
  "TravellingBoss", "ZoomArriere", "VoixOff", "GeneriQueFin",
];

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const nameRef = useRef<HTMLInputElement>(null);

  // Pre-fill code from ?code= query param (QR code flow)
  useEffect(() => {
    const prefill = searchParams.get("code");
    if (prefill && prefill.length === 6) {
      const chars = prefill.toUpperCase().split("").slice(0, 6);
      setCode(chars);
      // Focus name input after pre-fill
      setTimeout(() => {
        const nameInput = document.querySelector<HTMLInputElement>('input[placeholder*="prenom"]');
        nameInput?.focus();
      }, 100);
    }
  }, [searchParams]);

  const codeComplete = code.every((c) => c !== "");
  const canSubmit = codeComplete && name.trim().length > 0 && avatar !== "";

  function handleCodeChange(index: number, value: string) {
    const char = value.toUpperCase().slice(-1);
    const newCode = [...code];
    newCode[index] = char;
    setCode(newCode);
    setError(false);

    // Auto-advance to next input or focus name when complete
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (char && index === 5) {
      // All 6 chars filled — auto-focus name input
      setTimeout(() => nameRef.current?.focus(), 50);
    }
  }

  function handleCodeKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    if (!pasted) return;
    const newCode = [...code];
    for (let i = 0; i < pasted.length && i < 6; i++) {
      newCode[i] = pasted[i];
    }
    setCode(newCode);
    if (pasted.length >= 6) {
      // Code complete — focus name
      setTimeout(() => nameRef.current?.focus(), 50);
    } else {
      const nextFocus = Math.min(pasted.length, 5);
      inputRefs.current[nextFocus]?.focus();
    }
  }

  async function handleJoin() {
    if (!canSubmit) return;
    setLoading(true);
    setError(false);

    try {
      const res = await fetch("/api/sessions/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          joinCode: code.join(""),
          displayName: name.trim(),
          avatar,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Impossible de rejoindre");
        setError(true);
        setLoading(false);
        return;
      }

      const data = await res.json();
      // Store student info in localStorage for reconnection
      localStorage.setItem(
        `bw-student-${data.sessionId}`,
        JSON.stringify({ studentId: data.studentId, displayName: name, avatar })
      );
      router.push(`/play/${data.sessionId}`);
    } catch {
      toast.error("Erreur de connexion");
      setError(true);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-studio flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient teal glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-bw-teal/[0.05] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full bg-bw-teal/[0.03] blur-[80px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[250px] h-[250px] rounded-full bg-bw-primary/[0.03] blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-sm space-y-8 relative z-10"
      >
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="text-center"
        >
          <Link href="/" className="text-sm text-bw-muted hover:text-bw-ink transition-colors cursor-pointer inline-block">
            ← Retour
          </Link>
        </motion.div>

        {/* Title section with ticket illustration */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, type: "spring" }}
            className="flex justify-center"
          >
            <TicketIllustration size={80} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bw-display text-4xl sm:text-5xl tracking-[0.2em] uppercase text-gradient-teal"
          >
            Rejoindre
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.3 }}
            className="w-16 h-0.5 mx-auto bg-gradient-to-r from-bw-teal to-bw-teal-500 rounded-full"
          />
        </div>

        {/* Glass card container */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="glass-card p-6 space-y-6"
        >
          {/* Code input - individual boxes */}
          <div className="space-y-2">
            <label className="text-sm text-bw-muted block text-center">
              Code de la partie
            </label>
            <motion.div
              className="flex gap-2 justify-center"
              animate={error ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              {code.map((char, i) => (
                <motion.input
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.06 }}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="text"
                  autoCapitalize="characters"
                  autoComplete="off"
                  maxLength={1}
                  value={char}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(i, e)}
                  onPaste={handlePaste}
                  className={`w-12 h-16 text-center text-2xl font-bold bg-bw-elevated/50 border rounded-xl text-bw-ink focus:outline-none transition-all uppercase ${
                    error
                      ? "border-bw-danger/50 shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                      : char
                        ? "border-bw-teal/40 shadow-[0_0_10px_rgba(78,205,196,0.15)]"
                        : "border-white/[0.08]"
                  } focus:border-bw-teal focus:shadow-[0_0_16px_rgba(78,205,196,0.25)]`}
                />
              ))}
            </motion.div>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-bw-danger text-center mt-1"
              >
                Code invalide, verifie et reessaie
              </motion.p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm text-bw-muted block text-center">
              Ton prenom
            </label>
            <Input
              ref={nameRef}
              type="text"
              placeholder="Entre ton prenom..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              className="h-12 text-center rounded-xl bg-bw-elevated/50 border-white/[0.08] text-bw-ink placeholder:text-bw-placeholder focus:border-bw-teal/50 focus:ring-2 focus:ring-bw-teal/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setName(RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)])}
              className="w-full text-xs text-bw-teal/70 hover:text-bw-teal transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
              </svg>
              Pseudo aleatoire
            </button>
          </div>

          {/* Avatar picker */}
          <div className="space-y-2">
            <label className="text-sm text-bw-muted block text-center">
              Choisis ton emoji
            </label>
            <div className="grid grid-cols-6 gap-2 justify-items-center">
              {AVATARS.map((emoji, i) => (
                <motion.button
                  key={emoji}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, delay: 0.4 + i * 0.03 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setAvatar(emoji)}
                  className={`w-12 h-12 text-2xl rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    avatar === emoji
                      ? "bg-bw-teal/20 border-2 border-bw-teal scale-110 shadow-[0_0_16px_rgba(78,205,196,0.25)]"
                      : "bg-bw-surface border border-white/[0.06] hover:border-white/[0.15] hover:bg-bw-elevated/50"
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {avatar === emoji ? (
                      <motion.span
                        key="selected"
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      >
                        {emoji}
                      </motion.span>
                    ) : (
                      <span>{emoji}</span>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
        >
          <Button
            asChild
            size="xl"
            variant={canSubmit ? "default" : "secondary"}
            className={`w-full rounded-xl font-semibold transition-all duration-300 ${
              canSubmit
                ? "bg-gradient-to-r from-bw-teal to-bw-teal-500 hover:from-bw-teal-500 hover:to-bw-teal text-white shadow-bw-glow-teal btn-glow"
                : "bg-bw-elevated text-bw-muted border border-white/[0.06]"
            }`}
            disabled={!canSubmit || loading}
          >
            <motion.button
              whileTap={canSubmit ? { scale: 0.97 } : {}}
              onClick={handleJoin}
            >
              {loading ? "Connexion..." : "ENTRER"}
            </motion.button>
          </Button>
        </motion.div>

        {/* QR code option */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <button className="inline-flex items-center gap-2 text-xs text-bw-muted hover:text-bw-teal transition-colors cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="3" height="3" rx="0.5" />
              <rect x="18" y="14" width="3" height="3" rx="0.5" />
              <rect x="14" y="18" width="3" height="3" rx="0.5" />
              <rect x="18" y="18" width="3" height="3" rx="0.5" />
            </svg>
            ou scanner un QR code
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-studio flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-bw-teal border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <JoinForm />
    </Suspense>
  );
}
