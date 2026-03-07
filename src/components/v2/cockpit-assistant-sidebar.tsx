"use client";

import { cn } from "@/lib/utils";
import { GlassCardV2 } from "./glass-card";

interface Suggestion {
  id: string;
  text: string;
  type: "tip" | "alert" | "idea";
}

interface CockpitAssistantSidebarProps {
  suggestions?: Suggestion[];
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const TYPE_STYLES: Record<string, { icon: string; borderColor: string }> = {
  tip: { icon: "💡", borderColor: "rgba(99,102,241,0.2)" },
  alert: { icon: "⚠️", borderColor: "rgba(245,158,11,0.3)" },
  idea: { icon: "✨", borderColor: "rgba(139,92,246,0.2)" },
};

export function CockpitAssistantSidebar({
  suggestions = [],
  isOpen,
  onClose,
  className,
}: CockpitAssistantSidebarProps) {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed right-0 top-0 bottom-0 w-80 z-50 border-l border-[#DDD7EC] bg-white/95 backdrop-blur-xl shadow-lg overflow-y-auto",
        className
      )}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#DDD7EC] bg-white/80 backdrop-blur-md px-4 py-3">
        <h2 className="text-sm font-bold text-bw-heading">
          Assistant pédagogique
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-bw-muted hover:text-bw-heading hover:bg-[#EDE9F7] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Suggestions */}
      <div className="p-4 flex flex-col gap-3">
        {suggestions.length === 0 ? (
          <p className="text-sm text-bw-muted text-center py-8">
            Pas de suggestions pour le moment
          </p>
        ) : (
          suggestions.map((s) => {
            const style = TYPE_STYLES[s.type] || TYPE_STYLES.tip;
            return (
              <GlassCardV2
                key={s.id}
                className="p-3"
                style={{ borderColor: style.borderColor }}
              >
                <div className="flex items-start gap-2">
                  <span className="text-sm shrink-0">{style.icon}</span>
                  <p className="text-xs text-bw-text leading-relaxed">
                    {s.text}
                  </p>
                </div>
              </GlassCardV2>
            );
          })
        )}
      </div>
    </div>
  );
}
