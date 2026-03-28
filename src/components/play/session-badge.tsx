"use client";

import { useRef, useCallback, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { getLevel } from "@/lib/xp";

interface SessionBadgeProps {
  sessionTitle: string;
  studentName: string;
  studentAvatar: string;
  xp: number;
  responses: number;
  retained: number;
  bestStreak: number;
  date?: string;
}

export function SessionBadge({
  sessionTitle,
  studentName,
  studentAvatar,
  xp,
  responses,
  retained,
  bestStreak,
  date,
}: SessionBadgeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);
  const level = getLevel(xp);

  const generateImage = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Wait for custom fonts (Bebas Neue, Plus Jakarta Sans) to be loaded
    await document.fonts.ready;

    const W = 600;
    const H = 400;
    canvas.width = W;
    canvas.height = H;

    // Background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#F7F3EA");
    bg.addColorStop(1, "#EFE8D8");
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(0, 0, W, H, 20);
    ctx.fill();

    // Border
    ctx.strokeStyle = "#D4A843";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(4, 4, W - 8, H - 8, 16);
    ctx.stroke();

    // Inner decorative line
    ctx.strokeStyle = "#D4A84340";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(12, 12, W - 24, H - 24, 12);
    ctx.stroke();

    // Header: BANLIEUWOOD
    ctx.textAlign = "center";
    ctx.font = "bold 28px 'Bebas Neue', sans-serif";
    ctx.fillStyle = "#2C2C2C";
    ctx.letterSpacing = "4px";
    ctx.fillText("BANLIEUWOOD", W / 2, 50);

    // Gold line
    const lineGrad = ctx.createLinearGradient(W / 2 - 80, 0, W / 2 + 80, 0);
    lineGrad.addColorStop(0, "#D4A84300");
    lineGrad.addColorStop(0.5, "#D4A843");
    lineGrad.addColorStop(1, "#D4A84300");
    ctx.fillStyle = lineGrad;
    ctx.fillRect(W / 2 - 80, 58, 160, 1.5);

    // Session title
    ctx.font = "500 14px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "#7A7A7A";
    const title = sessionTitle.length > 40 ? sessionTitle.slice(0, 37) + "..." : sessionTitle;
    ctx.fillText(title, W / 2, 80);

    // Avatar
    ctx.font = "48px serif";
    ctx.fillText(studentAvatar, W / 2, 130);

    // Student name
    ctx.font = "bold 20px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "#2C2C2C";
    ctx.fillText(studentName, W / 2, 160);

    // Level badge
    ctx.font = "600 13px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "#D4A843";
    ctx.fillText(`🏆 ${level.name}`, W / 2, 182);

    // Stats grid (2x2)
    const stats = [
      { icon: "⚡", label: "Points gagnés", value: String(xp) },
      { icon: "💬", label: "Réponses", value: String(responses) },
      { icon: "💡", label: "Idées choisies", value: String(retained) },
      { icon: "🔥", label: "Meilleure série", value: String(bestStreak) },
    ];

    const startY = 210;
    const colW = 140;
    const rowH = 60;
    stats.forEach((stat, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = W / 2 - colW + col * colW * 1.4 + 40;
      const cy = startY + row * rowH;

      // Stat box
      ctx.fillStyle = "#FFFFFF80";
      ctx.beginPath();
      ctx.roundRect(cx - 55, cy - 8, 110, 48, 8);
      ctx.fill();

      ctx.font = "20px serif";
      ctx.textAlign = "center";
      ctx.fillText(stat.icon, cx, cy + 12);
      ctx.font = "bold 16px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = "#2C2C2C";
      ctx.fillText(stat.value, cx, cy + 30);
      ctx.font = "11px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = "#7A7A7A";
      ctx.fillText(stat.label, cx, cy + 44);
      ctx.fillStyle = "#2C2C2C";
    });

    // Date
    ctx.font = "11px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "#AAAAAA";
    ctx.textAlign = "center";
    ctx.fillText(date || new Date().toLocaleDateString("fr-FR"), W / 2, H - 20);

    return canvas;
  }, [sessionTitle, studentName, studentAvatar, xp, responses, retained, bestStreak, date, level.name]);

  const handleDownload = useCallback(async () => {
    setGenerating(true);
    try {
      const canvas = await generateImage();
      if (!canvas) return;
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `banlieuwood-${studentName.toLowerCase().replace(/\s+/g, "-")}.png`;
      a.click();
      toast.success("Badge téléchargé !");
    } finally {
      setGenerating(false);
    }
  }, [generateImage, studentName]);

  const handleShare = useCallback(async () => {
    setGenerating(true);
    try {
      const canvas = await generateImage();
      if (!canvas) return;

      // Try Web Share API first (mobile)
      if (navigator.share && navigator.canShare) {
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
        if (blob) {
          const file = new File([blob], "banlieuwood-badge.png", { type: "image/png" });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: "Mon badge Banlieuwood",
              text: `J'ai atteint le niveau ${level.name} sur Banlieuwood ! 🎬`,
              files: [file],
            });
            return;
          }
        }
      }

      // Fallback: copy to clipboard
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (blob) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        toast.success("Badge copié dans le presse-papiers !");
      }
    } catch {
      toast.error("Partage non disponible sur ce navigateur");
    } finally {
      setGenerating(false);
    }
  }, [generateImage, level.name]);

  return (
    <div className="space-y-4">
      {/* Preview card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border-2 border-bw-gold/30 bg-gradient-to-br from-bw-bg to-[#EFE8D8] p-6 space-y-4 text-center"
      >
        <div className="space-y-1">
          <p className="text-xs text-bw-gold tracking-[0.3em] uppercase font-cinema">Banlieuwood</p>
          <div className="w-16 h-px mx-auto bg-gradient-to-r from-transparent via-bw-gold/40 to-transparent" />
          <p className="text-xs text-bw-muted">{sessionTitle}</p>
        </div>

        <div className="text-4xl">{studentAvatar}</div>
        <p className="font-semibold text-bw-heading">{studentName}</p>
        <p className="text-sm text-bw-gold font-medium">🏆 {level.name}</p>

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: "⚡", value: xp, label: "Points" },
            { icon: "💬", value: responses, label: "Réponses" },
            { icon: "💡", value: retained, label: "Choisies" },
            { icon: "🔥", value: bestStreak, label: "Série" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-white/50 p-2.5 space-y-0.5">
              <p className="text-lg font-bold text-bw-heading">
                {s.icon} {s.value}
              </p>
              <p className="text-xs text-bw-muted">{s.label}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-bw-muted">{date || new Date().toLocaleDateString("fr-FR")}</p>
      </motion.div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          disabled={generating}
          aria-label="Telecharger mon badge en image"
          className="flex-1 h-10 rounded-xl bg-bw-gold/10 text-bw-gold text-sm font-medium hover:bg-bw-gold/20 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Télécharger
        </button>
        <button
          onClick={handleShare}
          disabled={generating}
          aria-label="Partager mon badge"
          className="flex-1 h-10 rounded-xl bg-bw-teal/10 text-bw-teal text-sm font-medium hover:bg-bw-teal/20 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Partager
        </button>
      </div>

      {/* Hidden canvas for image generation */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
