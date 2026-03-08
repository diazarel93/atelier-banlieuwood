"use client";

import dynamic from "next/dynamic";

const QRCodeSVG = dynamic(
  () => import("qrcode.react").then((mod) => ({ default: mod.QRCodeSVG })),
  {
    ssr: false,
    loading: () => (
      <div className="w-[200px] h-[200px] rounded-2xl bg-white/10 animate-pulse" />
    ),
  }
);

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

export function ProjectionOverlay({
  joinCode,
  joinUrl,
  activeStudents,
  onClose,
}: ProjectionOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 bg-[#0a0c14] text-white flex flex-col items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-sm text-white/50 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
      >
        Quitter projection
      </button>

      <div className="text-center space-y-8">
        {/* Brand */}
        <h1 className="text-3xl font-bold tracking-[0.3em] uppercase text-white/90">
          Banlieuwood
        </h1>

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
          Rejoins sur{" "}
          <span className="text-white font-medium">banlieuwood.fr/join</span>
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
