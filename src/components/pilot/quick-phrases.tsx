"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { QuestionGuide } from "@/lib/guide-data";

interface QuickPhrasesProps {
  questionGuide: QuestionGuide | undefined;
}

export function QuickPhrases({ questionGuide }: QuickPhrasesProps) {
  const [copied, setCopied] = useState<"relance" | "challenge" | null>(null);

  if (!questionGuide) return null;

  function copy(text: string, type: "relance" | "challenge") {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast("Copié !");
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-1.5">
      <h4 className="text-xs uppercase tracking-wider text-bw-muted font-semibold">Actions rapides</h4>
      <div className="flex gap-2">
        <button
          onClick={() => copy(questionGuide.relancePhrase, "relance")}
          className="flex-1 text-left rounded-[14px] bg-white rounded-xl p-2 border border-bw-teal/20 hover:border-bw-teal/40 cursor-pointer transition-colors duration-200 group"
        >
          <span className="text-xs font-semibold text-bw-teal uppercase block mb-1">
            {copied === "relance" ? "Copié !" : "Relancer"}
          </span>
          <p className="text-xs text-bw-text italic leading-relaxed line-clamp-2">
            &ldquo;{questionGuide.relancePhrase}&rdquo;
          </p>
        </button>
        <button
          onClick={() => copy(questionGuide.challengePhrase, "challenge")}
          className="flex-1 text-left rounded-[14px] bg-white rounded-xl p-2 border border-bw-violet/20 hover:border-bw-violet/40 cursor-pointer transition-colors duration-200 group"
        >
          <span className="text-xs font-semibold text-bw-violet uppercase block mb-1">
            {copied === "challenge" ? "Copié !" : "Challenger"}
          </span>
          <p className="text-xs text-bw-text italic leading-relaxed line-clamp-2">
            &ldquo;{questionGuide.challengePhrase}&rdquo;
          </p>
        </button>
      </div>
    </div>
  );
}
