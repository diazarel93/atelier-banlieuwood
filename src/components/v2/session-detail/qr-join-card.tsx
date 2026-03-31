"use client";

import dynamic from "next/dynamic";
import { GlassCardV2 } from "@/components/v2/glass-card";

const QRCodeSVG = dynamic(() => import("qrcode.react").then((mod) => ({ default: mod.QRCodeSVG })), {
  ssr: false,
  loading: () => <div className="w-[120px] h-[120px] rounded-xl bg-[var(--color-bw-surface-dim)] animate-pulse" />,
});

interface QrJoinCardProps {
  joinCode: string;
  joinUrl: string;
}

export function QrJoinCard({ joinCode, joinUrl }: QrJoinCardProps) {
  return (
    <GlassCardV2 className="p-6 text-center">
      <p className="label-caps text-bw-muted mb-4">Rejoindre la séance</p>

      <div className="inline-block bg-white p-3 rounded-xl border border-[var(--color-bw-border)]">
        <QRCodeSVG value={`${joinUrl}?code=${joinCode}`} size={120} />
      </div>

      <p className="text-xs text-bw-muted mt-4">banlieuwood.fr/join</p>

      <div className="flex gap-1.5 justify-center mt-3">
        {joinCode.split("").map((char, i) => (
          <span
            key={i}
            className="w-9 h-11 rounded-lg flex items-center justify-center text-lg font-mono font-bold text-bw-primary border border-[var(--color-bw-border)] bg-[var(--color-bw-surface-dim)]"
          >
            {char}
          </span>
        ))}
      </div>
    </GlassCardV2>
  );
}
