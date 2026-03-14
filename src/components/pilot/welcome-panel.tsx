"use client";

import { motion } from "motion/react";

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
    <div className="max-w-2xl mx-auto px-6 py-6 space-y-5 relative">

      {/* Session info — warm EdTech header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-[22px] font-bold text-bw-heading">
          {(sessionTitle || "Session").replace(/\s*[-—]\s*$/, "")}
        </h1>
        <p className="text-[13px] text-bw-text mt-1">{level}</p>
        <div className="h-0.5 w-16 mx-auto mt-4 rounded-full" style={{ background: "linear-gradient(90deg, #F5A45B, #57C4B6)" }} />
      </motion.div>

      {/* Onboarding when no students */}
      {activeStudents.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[20px] overflow-hidden"
          style={{ background: "#FFFFFF", border: "1px solid #EFE4D8", boxShadow: "0 10px 24px rgba(61,43,16,0.06)" }}
        >
          <div className="p-6 space-y-4">
            {/* Illustration */}
            <div className="flex justify-center">
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="w-16 h-16 rounded-[18px] flex items-center justify-center text-3xl"
                style={{ background: "linear-gradient(135deg, #F5A45B15, #57C4B615)", border: "1px solid #EFE4D8" }}
              >
                🎓
              </motion.div>
            </div>

            <p className="text-center text-[18px] font-semibold text-bw-heading">
              Pret a commencer ? <span className="text-[#F5A45B]">C&apos;est parti !</span>
            </p>

            <div className="space-y-3 max-w-sm mx-auto">
              {[
                { num: "1", color: "#F5A45B", text: <>Projetez le <button onClick={onOpenQR} className="text-[#6B8CFF] underline cursor-pointer font-semibold">QR code</button> ou dictez le code</> },
                { num: "2", color: "#57C4B6", text: "Les eleves scannent et rejoignent la session" },
                { num: "3", color: "#6B8CFF", text: "Choisissez un module et lancez l'activite" },
              ].map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div
                    className="w-8 h-8 rounded-[10px] flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0"
                    style={{ backgroundColor: step.color }}
                  >
                    {step.num}
                  </div>
                  <span className="text-[14px] text-bw-text">{step.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Join code display */}
            <div className="text-center pt-3">
              <p className="text-[11px] uppercase tracking-widest text-bw-muted mb-2.5">Code de la session</p>
              <button onClick={onCopyCode} aria-label="Copier le code de session" className="cursor-pointer group">
                <div className="flex gap-2 justify-center">
                  {joinCode.split("").map((char, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.06 }}
                      className="w-9 h-11 rounded-[10px] flex items-center justify-center text-[18px] font-bold font-mono text-bw-heading group-hover:border-[#6B8CFF]/40 transition-colors"
                      style={{ background: "#F7F3EA", border: "1px solid #E8DFD2" }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </div>
                <span className="text-[12px] text-bw-muted mt-2.5 inline-block group-hover:text-[#6B8CFF] transition-colors">
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
          className="rounded-[16px] overflow-hidden"
          style={{ background: "#FFFFFF", border: "1px solid #EFE4D8" }}
        >
          <div className="px-4 py-3" style={{ borderBottom: "1px solid #EFE4D8", background: "#EFFAF8" }}>
            <div className="flex items-center gap-2.5">
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-2.5 h-2.5 rounded-full bg-[#57C4B6]"
              />
              <span className="text-[14px] font-semibold text-[#1B7A6E]">
                {activeStudents.length} eleve{activeStudents.length !== 1 ? "s" : ""} connecte{activeStudents.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {activeStudents.slice(0, 24).map((s, i) => (
                <motion.span
                  key={s.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="text-[12px] h-8 px-3 rounded-[10px] flex items-center gap-1.5 font-medium"
                  style={{ background: "#F7F3EA", border: "1px solid #E8DFD2", color: "#4A4A4A" }}
                >
                  <span className="text-sm">{s.avatar}</span>
                  <span>{s.display_name}</span>
                </motion.span>
              ))}
              {activeStudents.length > 24 && (
                <span className="text-[12px] text-bw-muted self-center">+{activeStudents.length - 24}</span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* CTA to select module */}
      <div className="text-center py-5 space-y-3">
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-14 h-14 rounded-[16px] mx-auto flex items-center justify-center"
          style={{ background: "#EEF2FF", border: "1px solid #D8E0F0" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6B8CFF" strokeWidth="1.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </motion.div>
        <div>
          <p className="text-[14px] text-bw-heading font-medium">Selectionnez un module dans le menu</p>
          <p className="text-[12px] text-bw-muted mt-1">Le menu est a gauche de votre ecran</p>
        </div>
      </div>
    </div>
  );
}
