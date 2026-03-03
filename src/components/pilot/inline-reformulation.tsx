"use client";

import { useState } from "react";
import { motion } from "motion/react";
import type { ResponseCardResponse } from "./response-card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface InlineReformulationProps {
  response: ResponseCardResponse;
  onValidate: (text: string) => void;
  onCancel: () => void;
  isPending?: boolean;
}

export function InlineReformulation({
  response,
  onValidate,
  onCancel,
  isPending,
}: InlineReformulationProps) {
  const [text, setText] = useState(response.text);

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden"
    >
      <div className="bg-bw-bg rounded-xl border border-bw-primary/30 p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base">{response.students?.avatar}</span>
          <span className="text-sm font-medium">{response.students?.display_name}</span>
          <span className="text-[10px] uppercase tracking-wider text-bw-primary ml-auto">
            Reformuler
          </span>
        </div>

        <div className="bg-bw-surface rounded-xl p-3 text-xs text-bw-muted">
          <span className="text-[10px] uppercase tracking-wider text-bw-muted block mb-1">
            Texte original
          </span>
          {response.text}
        </div>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="bg-bw-surface border-white/10 text-bw-heading placeholder:text-bw-muted focus:border-bw-primary resize-none"
          placeholder="Reformule ici..."
          autoFocus
        />

        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onCancel}
            className="flex-1 bg-bw-surface text-bw-muted border-white/10"
          >
            Annuler
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (text.trim()) onValidate(text.trim());
            }}
            disabled={!text.trim() || isPending}
            className="flex-1"
          >
            {isPending ? "..." : "Valider le choix"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
