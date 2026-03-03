"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MAX_FOLLOWUPS } from "@/lib/models/atelier";
import { Loader2, Lightbulb, Send, Zap, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import type { MentorMood } from "./mentor-avatar";
import { MentorAvatar } from "./mentor-avatar";

export function QuestionView({
  question,
  questionNumber,
  totalQuestions,
  hint,
  isFollowUp,
  followUpText,
  exchangeCount,
  isEvaluating,
  mentorMood,
  onSend,
}: {
  question: string;
  questionNumber: number;
  totalQuestions: number;
  hint: string | null;
  isFollowUp: boolean;
  followUpText: string | null;
  exchangeCount: number;
  isEvaluating: boolean;
  mentorMood: MentorMood;
  onSend: (answer: string) => void;
}) {
  const [answer, setAnswer] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setAnswer("");
    textareaRef.current?.focus();
  }, [question, followUpText]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (answer.trim()) onSend(answer.trim());
    }
  };

  return (
    <motion.div
      key="question"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex-1 flex flex-col items-center justify-center gap-8 w-full max-w-2xl mx-auto px-4"
    >
      {/* Mentor avatar */}
      <MentorAvatar mood={mentorMood} size="sm" />

      {/* Question header */}
      <div className="w-full text-center space-y-5">
        {isFollowUp ? (
          <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-700 dark:text-amber-300 px-5 py-2.5 rounded-2xl text-sm font-bold border border-amber-500/20">
            <RotateCcw className="h-4 w-4" />
            Approfondissement {exchangeCount}/{MAX_FOLLOWUPS}
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-5 py-2.5 rounded-2xl text-sm font-bold border border-primary/10">
            <Zap className="h-4 w-4" />
            Question {questionNumber} / {totalQuestions}
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-black leading-snug tracking-tight px-2">
          {isFollowUp ? followUpText : question}
        </h1>
      </div>

      {/* Hint */}
      {hint && !isFollowUp && (
        <div className="w-full max-w-lg">
          <details className="group">
            <summary className="flex items-center justify-center gap-2 text-sm text-amber-600 dark:text-amber-400 cursor-pointer hover:text-amber-500 font-medium">
              <Lightbulb className="h-4 w-4" />
              Indice disponible
            </summary>
            <div className="mt-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-sm text-muted-foreground leading-relaxed">
              {hint}
            </div>
          </details>
        </div>
      )}

      {/* Answer area */}
      <div className="w-full space-y-3">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isFollowUp ? "Developpe ta pensee..." : "Ta reponse..."
            }
            className="min-h-[140px] text-base leading-relaxed rounded-2xl border-2 pr-14 resize-none focus:border-primary/50 placeholder:text-muted-foreground/30 bg-card"
            disabled={isEvaluating}
          />
          <Button
            onClick={() => answer.trim() && onSend(answer.trim())}
            disabled={!answer.trim() || isEvaluating}
            size="icon"
            className="absolute bottom-3 right-3 h-11 w-11 rounded-xl shadow-lg"
          >
            {isEvaluating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        {isEvaluating ? (
          <div className="flex items-center justify-center gap-2 text-sm text-primary font-medium">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
            </div>
            Le mentor analyse...
          </div>
        ) : (
          <p className="text-center text-xs text-muted-foreground/50">
            Entree pour valider &middot; Shift+Entree pour un saut de ligne
          </p>
        )}
      </div>
    </motion.div>
  );
}
