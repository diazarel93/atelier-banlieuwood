"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CameraIllustration } from "@/components/cinema-illustrations";

const AVATARS = ["🎬", "🎭", "🎥", "🎤", "🎨", "🎵", "🌟", "💫", "🔥", "⚡", "🎯", "🚀"];

const LEVELS = [
  { key: "primaire", label: "6-9 ans", desc: "Primaire" },
  { key: "college", label: "10-13 ans", desc: "College" },
  { key: "lycee", label: "14-18 ans", desc: "Lycee" },
];

const SOLO_FEATURES = [
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#8B5CF6"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" />
      </svg>
    ),
    title: "Crée ton film",
    desc: "Invente une histoire unique de A à Z",
  },
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#8B5CF6"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    title: "Écris le scénario",
    desc: "Développe tes personnages et tes scènes",
  },
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#8B5CF6"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polygon points="10 8 16 12 10 16 10 8" />
      </svg>
    ),
    title: "Joue à ton rythme",
    desc: "Pas de limite de temps, explore librement",
  },
];

export default function FreePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [level, setLevel] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = name.trim().length > 0 && avatar !== "" && level !== "";

  async function handleStart() {
    if (!canSubmit) return;
    setLoading(true);

    try {
      const res = await fetch("/api/sessions/free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: name.trim(),
          avatar,
          level,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Impossible de creer la partie");
        setLoading(false);
        return;
      }

      const data = await res.json();
      // Store student info for play page
      localStorage.setItem(
        `bw-student-${data.sessionId}`,
        JSON.stringify({ studentId: data.studentId, displayName: name, avatar }),
      );
      // Store free mode flag
      localStorage.setItem(`bw-free-${data.sessionId}`, "true");
      router.push(`/play/${data.sessionId}`);
    } catch {
      toast.error("Erreur de connexion");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-studio flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient violet glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-bw-violet/[0.06] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-bw-violet/[0.04] blur-[80px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-[250px] h-[250px] rounded-full bg-bw-primary/[0.03] blur-[80px] pointer-events-none" />

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
          <Link
            href="/"
            className="text-sm text-bw-muted hover:text-bw-ink transition-colors cursor-pointer inline-block"
          >
            ← Retour
          </Link>
        </motion.div>

        {/* Title section with camera illustration */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, type: "spring" }}
            className="flex justify-center"
          >
            <CameraIllustration size={80} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bw-display text-4xl sm:text-5xl tracking-[0.15em] uppercase"
          >
            <span
              className="bg-gradient-to-r from-bw-violet to-bw-violet-500 bg-clip-text"
              style={{ WebkitTextFillColor: "transparent" }}
            >
              Jouer Seul
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-sm text-bw-muted"
          >
            Joue en solo — sans compte, sans code
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.3 }}
            className="w-16 h-0.5 mx-auto bg-gradient-to-r from-bw-violet to-bw-violet-500 rounded-full"
          />
        </div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid gap-2.5"
        >
          {SOLO_FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.08 }}
              className="glass-card px-4 py-3 flex items-start gap-3"
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-bw-violet/10 border border-bw-violet/20 flex items-center justify-center">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-bw-heading">{feature.title}</h3>
                <p className="text-xs text-bw-muted mt-0.5">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Glass card container with form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-card p-6 space-y-6"
        >
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm text-bw-muted block text-center">Ton prenom</label>
            <Input
              type="text"
              placeholder="Entre ton prenom..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              className="h-12 text-center rounded-xl bg-bw-elevated/50 border-[var(--color-bw-border)] text-bw-ink placeholder:text-bw-placeholder focus:border-bw-violet/50 focus:ring-2 focus:ring-bw-violet/20 transition-all"
            />
          </div>

          {/* Avatar picker */}
          <div className="space-y-2">
            <label className="text-sm text-bw-muted block text-center">Choisis ton emoji</label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 justify-items-center">
              {AVATARS.map((emoji, i) => (
                <motion.button
                  key={emoji}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, delay: 0.45 + i * 0.03 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setAvatar(emoji)}
                  className={`w-12 h-12 text-2xl rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    avatar === emoji
                      ? "bg-bw-violet/20 border-2 border-bw-violet scale-110 shadow-[0_0_16px_rgba(139,92,246,0.25)]"
                      : "bg-bw-surface border border-[var(--color-bw-border-subtle)] hover:border-[var(--color-bw-border)] hover:bg-bw-elevated/50"
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

          {/* Level picker */}
          <div className="space-y-2">
            <label className="text-sm text-bw-muted block text-center">Ton age</label>
            <div className="grid grid-cols-3 gap-2">
              {LEVELS.map((l, i) => (
                <motion.button
                  key={l.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.55 + i * 0.07 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setLevel(l.key)}
                  className={`py-3 px-2 rounded-xl text-center transition-all cursor-pointer border ${
                    level === l.key
                      ? "border-bw-violet bg-bw-violet/10 shadow-[0_0_12px_rgba(139,92,246,0.15)]"
                      : "border-white/[0.06] bg-bw-surface hover:border-white/[0.15] hover:bg-bw-elevated/50"
                  }`}
                >
                  <span className={`text-sm font-medium block ${level === l.key ? "text-bw-violet" : "text-bw-text"}`}>
                    {l.label}
                  </span>
                  <span className={`text-xs block mt-0.5 ${level === l.key ? "text-bw-violet/70" : "text-bw-muted"}`}>
                    {l.desc}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <Button
            asChild
            size="xl"
            variant={canSubmit ? "default" : "secondary"}
            className={`w-full rounded-xl font-semibold transition-all duration-300 ${
              canSubmit
                ? "bg-gradient-to-r from-bw-violet to-bw-violet-500 hover:from-bw-violet-500 hover:to-bw-violet text-white shadow-[0_0_24px_rgba(139,92,246,0.3),0_4px_16px_rgba(139,92,246,0.2)] btn-glow"
                : "bg-bw-elevated text-bw-muted border border-white/[0.06]"
            }`}
            disabled={!canSubmit || loading}
          >
            <motion.button
              whileTap={canSubmit ? { scale: 0.97 } : {}}
              onClick={handleStart}
              disabled={!canSubmit || loading}
            >
              {loading ? "Creation..." : "C'est parti"}
            </motion.button>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
