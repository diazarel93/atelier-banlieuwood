"use client";

import { useState, useEffect } from "react";
import { ROUTES } from "@/lib/routes";

// ═══════════════════════════════════════════════════════════════
// V6 CONTROL PANELS — Projection + Notes side by side
// ═══════════════════════════════════════════════════════════════

interface V6ControlPanelsProps {
  sessionId: string;
  currentScreenMode?: string;
  onScreenModeChange?: (mode: string) => void;
  onLockScreen?: () => void;
  onEndSession?: () => void;
  sessionNotes?: string;
  onNotesChange?: (notes: string) => void;
}

const PROJECTION_MODES = [
  { value: "vote", label: "Vote en direct" },
  { value: "result", label: "Resultat" },
  { value: "qr", label: "QR Code" },
  { value: "consigne", label: "Consigne" },
  { value: "waiting", label: "Attente" },
  { value: "black", label: "Mode Noir" },
  { value: "bracket", label: "Bracket" },
  { value: "debate", label: "Debat" },
  { value: "quiz", label: "Quiz Geant" },
  { value: "image", label: "Image Plein Ecran" },
  { value: "writing", label: "Ecriture" },
  { value: "pitch", label: "Pitch Countdown" },
];

export function V6ControlPanels({
  sessionId,
  currentScreenMode = "vote",
  onScreenModeChange,
  onLockScreen,
  onEndSession,
  sessionNotes = "",
  onNotesChange,
}: V6ControlPanelsProps) {
  const [projActive, setProjActive] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [notes, setNotes] = useState(sessionNotes);
  const [confirmEnd, setConfirmEnd] = useState(false);

  useEffect(() => {
    if (confirmEnd) {
      const t = setTimeout(() => setConfirmEnd(false), 3000);
      return () => clearTimeout(t);
    }
  }, [confirmEnd]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* ── Ecran Projection ── */}
      <section className="rounded-2xl border border-[#2a2a50] bg-[#161633] p-4">
        <h3 className="text-[13px] font-bold text-[#f0f0f8] mb-3 flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          Ecran Projection
        </h3>

        {/* Active/Inactive + open */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => {
              setProjActive(!projActive);
              if (!projActive) window.open(ROUTES.screen(sessionId), "bw-screen");
            }}
            className={`flex-1 py-2 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer border ${
              projActive
                ? "bg-[#8b5cf6] text-white border-[#8b5cf6]"
                : "bg-[#1a1a35] text-[#94a3b8] border-[#2a2a50] hover:bg-[#2a2a50]"
            }`}
          >
            {projActive ? "Actif" : "Inactif"}
          </button>
          <button
            onClick={() => window.open(ROUTES.screen(sessionId), "bw-screen")}
            className="w-9 h-9 rounded-lg border border-[#2a2a50] bg-[#1a1a35] hover:bg-[#2a2a50] text-[#94a3b8] flex items-center justify-center cursor-pointer transition-colors"
            title="Ouvrir dans nouvel onglet"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <path d="M15 3h6v6" />
              <path d="M10 14L21 3" />
            </svg>
          </button>
        </div>

        {/* Preview — miniature iframe of /screen */}
        <div className="w-full h-[120px] rounded-lg border border-[#2a2a50] mb-3 overflow-hidden bg-[#0c0c18] relative">
          {projActive ? (
            <iframe
              src={ROUTES.screen(sessionId)}
              title="Apercu projection"
              className="w-[200%] h-[200%] origin-top-left pointer-events-none border-none"
              style={{ transform: "scale(0.5)" }}
              tabIndex={-1}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-[#64748b]">
              Projection inactive
            </div>
          )}
        </div>

        {/* Mode selector */}
        <select
          value={currentScreenMode}
          onChange={(e) => onScreenModeChange?.(e.target.value)}
          className="w-full py-2 px-3 rounded-lg border border-[#2a2a50] bg-[#1a1a35] text-[#f0f0f8] text-[11px] font-medium mb-3 outline-none focus:border-[#8b5cf6]/40 cursor-pointer"
        >
          {PROJECTION_MODES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        {/* Auto-sync toggle */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setAutoSync(!autoSync)}
            className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg cursor-pointer flex items-center gap-1 border transition-colors ${
              autoSync
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-[#1a1a35] border-[#2a2a50] text-[#64748b]"
            }`}
          >
            {autoSync ? "✓" : "✗"} Auto-sync
          </button>
          <span className="text-[9px] text-[#64748b]">{autoSync ? "Suit le module actif" : "Manuel"}</span>
        </div>

        {/* Mode Noir */}
        <button
          onClick={onLockScreen}
          className="w-full py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-[11px] font-semibold cursor-pointer hover:bg-red-500/15 transition-colors flex items-center justify-center gap-1.5"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          Mode Noir
        </button>
      </section>

      {/* ── Notes & Gestion ── */}
      <section className="rounded-2xl border border-[#2a2a50] bg-[#161633] p-4">
        <h3 className="text-[13px] font-bold text-[#f0f0f8] mb-3 flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Notes & Gestion
        </h3>

        <textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            onNotesChange?.(e.target.value);
          }}
          placeholder="Notes de session..."
          className="w-full min-h-[100px] p-3 rounded-lg border border-[#2a2a50] bg-[#1a1a35] text-[12px] text-[#94a3b8] resize-y outline-none focus:border-[#8b5cf6]/40 placeholder:text-[#475569] mb-3"
        />

        <div className="flex gap-2">
          <button
            onClick={onLockScreen}
            className="flex-1 py-2.5 rounded-lg border border-[#fbbf24]/30 bg-[#fbbf24]/10 text-[#fbbf24] text-[11px] font-semibold cursor-pointer hover:bg-[#fbbf24]/15 transition-colors flex items-center justify-center gap-1.5"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
            </svg>
            Verrou ecrans
          </button>
          <button
            onClick={() => {
              if (confirmEnd) {
                onEndSession?.();
                setConfirmEnd(false);
              } else {
                setConfirmEnd(true);
              }
            }}
            className={`flex-1 py-2.5 rounded-lg border text-[11px] font-semibold cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
              confirmEnd
                ? "border-red-500 bg-red-500/30 text-red-300 animate-pulse"
                : "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/15"
            }`}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
            {confirmEnd ? "Confirmer ?" : "Terminer"}
          </button>
        </div>
      </section>
    </div>
  );
}
