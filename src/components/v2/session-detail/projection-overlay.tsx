"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const QRCodeSVG = dynamic(() => import("qrcode.react").then((mod) => ({ default: mod.QRCodeSVG })), {
  ssr: false,
  loading: () => <div className="w-[200px] h-[200px] rounded-2xl bg-white/10 animate-pulse" />,
});

interface Student {
  id: string;
  display_name: string;
  avatar: string;
}

interface ProjectionOverlayProps {
  joinCode: string;
  joinUrl: string;
  activeStudents: Student[];
  onClose: () => void;
}

export function ProjectionOverlay({ joinCode, joinUrl, activeStudents, onClose }: ProjectionOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();

      // Focus trap
      if (e.key === "Tab" && overlayRef.current) {
        const focusable = overlayRef.current.querySelectorAll<HTMLElement>('button, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }
    document.addEventListener("keydown", handleKey);
    // Focus the close button on open
    requestAnimationFrame(() => {
      overlayRef.current?.querySelector<HTMLElement>("button")?.focus();
    });
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-[#0a0c14] text-white flex flex-col items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Écran de projection — rejoindre la séance"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-sm text-white/50 hover:text-white min-h-11 min-w-11 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
      >
        Quitter projection
      </button>

      <div className="text-center space-y-8">
        {/* Brand */}
        <h1 className="text-3xl font-bold tracking-[0.3em] uppercase text-white/90">Banlieuwood</h1>

        {/* Code characters */}
        <div className="flex gap-2 justify-center">
          {joinCode.split("").map((char, i) => (
            <div
              key={i}
              className="w-16 h-20 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-3xl font-bold font-mono"
            >
              {char}
            </div>
          ))}
        </div>

        {/* URL */}
        <p className="text-white/50 text-lg">
          Rejoins sur <span className="text-white font-medium">banlieuwood.fr/join</span>
        </p>

        {/* QR Code */}
        <div className="bg-white p-4 rounded-2xl inline-block">
          <QRCodeSVG value={`${joinUrl}?code=${joinCode}`} size={200} />
        </div>

        {/* Connected students */}
        <div className="flex items-center gap-2 justify-center text-white/50">
          <div className="flex -space-x-1">
            {activeStudents.slice(0, 8).map((s) => (
              <span key={s.id} className="text-lg">
                {s.avatar}
              </span>
            ))}
          </div>
          <span>
            {activeStudents.length} connecté
            {activeStudents.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
