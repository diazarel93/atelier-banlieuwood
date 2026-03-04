"use client";

import { motion, AnimatePresence } from "motion/react";

interface ExportResponse {
  id: string;
  text: string;
  studentName: string;
  teacher_comment: string | null;
  teacher_score?: number;
  ai_score?: number;
  is_highlighted: boolean;
  submitted_at: string;
}

interface SessionExportProps {
  open: boolean;
  onClose: () => void;
  sessionTitle: string;
  level: string;
  moduleLabel: string;
  questionPrompt: string;
  responses: ExportResponse[];
  studentCount: number;
}

function generateMarkdown(props: Omit<SessionExportProps, "open" | "onClose">): string {
  const { sessionTitle, level, moduleLabel, questionPrompt, responses, studentCount } = props;
  const now = new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  let md = `# Résumé de séance — ${sessionTitle}\n\n`;
  md += `**Date** : ${now}\n`;
  md += `**Niveau** : ${level}\n`;
  md += `**Module** : ${moduleLabel}\n`;
  md += `**Élèves connectés** : ${studentCount}\n\n`;
  md += `---\n\n`;
  md += `## Question\n\n> ${questionPrompt}\n\n`;
  md += `---\n\n`;
  md += `## Réponses (${responses.length})\n\n`;

  const highlighted = responses.filter(r => r.is_highlighted);
  const scored = responses.filter(r => r.teacher_score);
  const commented = responses.filter(r => r.teacher_comment);

  if (highlighted.length > 0) {
    md += `### Réponses mises en avant\n\n`;
    for (const r of highlighted) {
      md += `- **${r.studentName}** : ${r.text}`;
      if (r.teacher_score) md += ` _(${r.teacher_score}/5)_`;
      if (r.teacher_comment) md += `\n  - 💬 Prof : ${r.teacher_comment}`;
      md += `\n`;
    }
    md += `\n`;
  }

  md += `### Toutes les réponses\n\n`;
  for (const r of responses) {
    md += `- **${r.studentName}** (${new Date(r.submitted_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}) : ${r.text}`;
    if (r.teacher_score) md += ` _(${r.teacher_score}/5)_`;
    if (r.ai_score) md += ` _(IA: ${r.ai_score}/5)_`;
    if (r.teacher_comment) md += `\n  - 💬 Prof : ${r.teacher_comment}`;
    md += `\n`;
  }

  md += `\n---\n\n`;
  md += `### Statistiques\n\n`;
  md += `- Réponses totales : ${responses.length}/${studentCount}\n`;
  md += `- Mises en avant : ${highlighted.length}\n`;
  md += `- Notées : ${scored.length}\n`;
  md += `- Commentées : ${commented.length}\n`;
  if (scored.length > 0) {
    const avg = scored.reduce((a, r) => a + (r.teacher_score || 0), 0) / scored.length;
    md += `- Note moyenne : ${avg.toFixed(1)}/5\n`;
  }

  md += `\n---\n_Exporté depuis Banlieuwood_\n`;
  return md;
}

function downloadMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function SessionExport({
  open,
  onClose,
  sessionTitle,
  level,
  moduleLabel,
  questionPrompt,
  responses,
  studentCount,
}: SessionExportProps) {
  const markdown = generateMarkdown({ sessionTitle, level, moduleLabel, questionPrompt, responses, studentCount });
  const slug = sessionTitle.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 30);
  const filename = `seance-${slug}-${new Date().toISOString().slice(0, 10)}.md`;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] max-w-[90vw] max-h-[80vh] glass-card rounded-2xl border border-white/[0.08] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-lg">📋</span>
                <h3 className="text-sm font-semibold">Export de séance</h3>
              </div>
              <button onClick={onClose} className="text-bw-muted hover:text-white text-sm cursor-pointer">✕</button>
            </div>

            {/* Preview */}
            <div className="flex-1 overflow-y-auto px-5 py-3">
              <pre className="text-xs text-bw-text leading-relaxed whitespace-pre-wrap font-mono bg-bw-surface rounded-xl p-4 border border-white/[0.06] max-h-[50vh] overflow-y-auto">
                {markdown}
              </pre>
            </div>

            {/* Actions */}
            <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between flex-shrink-0">
              <p className="text-[10px] text-bw-muted">{responses.length} réponses, {filename}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { navigator.clipboard.writeText(markdown); }}
                  className="px-4 py-2 rounded-xl text-xs font-medium cursor-pointer border border-white/[0.06] hover:border-white/15 text-bw-muted hover:text-white transition-colors"
                >
                  Copier
                </button>
                <button
                  onClick={() => downloadMarkdown(markdown, filename)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all hover:brightness-110"
                  style={{ backgroundColor: "#4ECDC4", color: "black" }}
                >
                  Télécharger .md
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
