"use client";

import { motion } from "motion/react";
import { ClapperboardIllustration, FilmStripDecoration } from "@/components/cinema-illustrations";

interface Student {
  id: string;
  display_name: string;
  avatar: string;
  is_active: boolean;
}

interface WelcomePanelProps {
  sessionTitle: string;
  level: string;
  joinCode: string;
  activeStudents: Student[];
  onOpenQR: () => void;
  onCopyCode: () => void;
}

export function WelcomePanel({
  sessionTitle,
  level,
  joinCode,
  activeStudents,
  onOpenQR,
  onCopyCode,
}: WelcomePanelProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 relative">
      {/* Background film strips */}
      <FilmStripDecoration className="left-0 top-0" />
      <FilmStripDecoration className="right-0 bottom-0" />

      {/* Session info — cinematic header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-2xl font-bold font-cinema tracking-wider text-gradient-cinema">
          {(sessionTitle || "Session").replace(/\s*[-—]\s*$/, "")}
        </h1>
        <p className="text-xs text-bw-muted mt-1">{level}</p>
        <div className="h-0.5 w-16 mx-auto mt-3 rounded-full bg-gradient-to-r from-bw-primary to-bw-gold" />
      </motion.div>

      {/* Onboarding when no students */}
      {activeStudents.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden"
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-bw-primary/10 via-bw-bg to-bw-violet/10" />
          <div className="absolute inset-0 border border-bw-primary/20 rounded-2xl" />

          <div className="relative p-6 space-y-5">
            {/* Clapperboard illustration */}
            <div className="flex justify-center">
              <motion.div
                animate={{ rotate: [0, 2, -2, 0] }}
                transition={{ repeat: Infinity, duration: 4, repeatDelay: 2 }}
              >
                <ClapperboardIllustration size={100} />
              </motion.div>
            </div>

            <p className="text-center text-lg font-semibold">
              Prêt à tourner ? <span className="text-bw-primary">Action !</span>
            </p>

            <div className="space-y-3 max-w-sm mx-auto">
              {[
                { num: "1", color: "#FF6B35", text: <>Projetez le <button onClick={onOpenQR} className="text-bw-primary underline cursor-pointer font-semibold">QR code</button> ou dictez le code</> },
                { num: "2", color: "#4ECDC4", text: "Les élèves scannent et rejoignent la partie" },
                { num: "3", color: "#8B5CF6", text: "Choisissez un module et lancez l'aventure" },
              ].map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}AA)` }}
                  >
                    {step.num}
                  </div>
                  <span className="text-sm text-bw-text">{step.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Join code display */}
            <div className="text-center pt-2">
              <p className="text-[10px] uppercase tracking-widest text-bw-muted mb-2">Code de la partie</p>
              <button onClick={onCopyCode} className="cursor-pointer group">
                <div className="flex gap-1.5 justify-center">
                  {joinCode.split("").map((char, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.06 }}
                      className="w-10 h-12 rounded-lg flex items-center justify-center text-xl font-bold font-mono border border-white/10 group-hover:border-bw-primary/40 transition-colors"
                      style={{ background: "linear-gradient(180deg, rgba(255,107,53,0.08), rgba(255,107,53,0.02))" }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </div>
                <span className="text-[10px] text-bw-muted mt-2 inline-block group-hover:text-bw-primary transition-colors">
                  Cliquer pour copier
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Connected students grid */}
      {activeStudents.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-white/[0.08] overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-white/[0.06]"
            style={{ background: "linear-gradient(90deg, rgba(78,205,196,0.08), transparent)" }}>
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-2 h-2 rounded-full bg-bw-teal"
              />
              <span className="text-sm font-medium text-bw-teal">
                {activeStudents.length} élève{activeStudents.length !== 1 ? "s" : ""} connecté{activeStudents.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <div className="p-3 bg-bw-bg">
            <div className="flex flex-wrap gap-2">
              {activeStudents.slice(0, 24).map((s, i) => (
                <motion.span
                  key={s.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-white/[0.06]"
                  style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))" }}
                >
                  <span className="text-sm">{s.avatar}</span>
                  <span className="text-bw-text">{s.display_name}</span>
                </motion.span>
              ))}
              {activeStudents.length > 24 && (
                <span className="text-[10px] text-bw-muted self-center">+{activeStudents.length - 24}</span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* CTA to select module */}
      <div className="text-center py-6 space-y-4">
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center border border-white/[0.08]"
          style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(78,205,196,0.05))" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </motion.div>
        <div>
          <p className="text-sm text-bw-text">Sélectionnez un module dans le menu</p>
          <p className="text-xs text-bw-muted mt-1">Le menu est à gauche de votre écran</p>
        </div>
      </div>
    </div>
  );
}
