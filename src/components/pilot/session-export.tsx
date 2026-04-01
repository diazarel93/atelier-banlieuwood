"use client";

import { useState, useEffect, useCallback } from "react";
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
  /** Session ID — required for full export mode */
  sessionId?: string;
}

function generateMarkdown(props: Omit<SessionExportProps, "open" | "onClose" | "sessionId">): string {
  const { sessionTitle, level, moduleLabel, questionPrompt, responses, studentCount } = props;
  const now = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let md = `# Résumé de séance — ${sessionTitle}\n\n`;
  md += `**Date** : ${now}\n`;
  md += `**Niveau** : ${level}\n`;
  md += `**Module** : ${moduleLabel}\n`;
  md += `**Élèves connectés** : ${studentCount}\n\n`;
  md += `---\n\n`;
  md += `## Question\n\n> ${questionPrompt}\n\n`;
  md += `---\n\n`;
  md += `## Réponses (${responses.length})\n\n`;

  const highlighted = responses.filter((r) => r.is_highlighted);
  const scored = responses.filter((r) => r.teacher_score);
  const commented = responses.filter((r) => r.teacher_comment);

  if (highlighted.length > 0) {
    md += `### Réponses mises en avant\n\n`;
    for (const r of highlighted) {
      md += `- **${r.studentName}** : ${r.text}`;
      if (r.teacher_score) md += ` _(${r.teacher_score}/5)_`;
      if (r.teacher_comment) md += `\n  - Prof : ${r.teacher_comment}`;
      md += `\n`;
    }
    md += `\n`;
  }

  md += `### Toutes les réponses\n\n`;
  for (const r of responses) {
    md += `- **${r.studentName}** (${new Date(r.submitted_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}) : ${r.text}`;
    if (r.teacher_score) md += ` _(${r.teacher_score}/5)_`;
    if (r.ai_score) md += ` _(IA: ${r.ai_score}/5)_`;
    if (r.teacher_comment) md += `\n  - Prof : ${r.teacher_comment}`;
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

function downloadCSV(responses: ExportResponse[], filename: string) {
  const escapeCSV = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const header = "Eleve,Reponse,Note Prof,Note IA,Mis en avant,Commentaire Prof,Heure";
  const rows = responses.map((r) =>
    [
      escapeCSV(r.studentName),
      escapeCSV(r.text),
      r.teacher_score || "",
      r.ai_score || "",
      r.is_highlighted ? "Oui" : "Non",
      escapeCSV(r.teacher_comment || ""),
      new Date(r.submitted_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    ].join(","),
  );
  const csv = "\uFEFF" + [header, ...rows].join("\n"); // BOM for Excel FR
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadPDF(props: Omit<SessionExportProps, "open" | "onClose" | "sessionId">) {
  const { sessionTitle, level, moduleLabel, questionPrompt, responses, studentCount } = props;
  const now = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const highlighted = responses.filter((r) => r.is_highlighted);
  const scored = responses.filter((r) => r.teacher_score);
  const avgScore =
    scored.length > 0 ? (scored.reduce((a, r) => a + (r.teacher_score || 0), 0) / scored.length).toFixed(1) : null;

  const responsesHTML = responses
    .map(
      (r) => `
    <div style="padding:10px 14px;margin:6px 0;border-radius:8px;border-left:3px solid ${r.is_highlighted ? "#F5A45B" : "#333"};background:${r.is_highlighted ? "#FFF7ED" : "#FAFAFA"}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <strong style="font-size:13px;color:#222">${r.studentName}</strong>
        <span style="font-size:11px;color:#888">${new Date(r.submitted_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
      <p style="font-size:14px;color:#333;margin:0;line-height:1.5">${r.text}</p>
      ${r.teacher_score ? `<span style="font-size:11px;color:#F5A45B;font-weight:600">Note : ${r.teacher_score}/5</span>` : ""}
      ${r.teacher_comment ? `<p style="font-size:12px;color:#666;margin:4px 0 0;font-style:italic">Prof : ${r.teacher_comment}</p>` : ""}
    </div>
  `,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${sessionTitle} — Banlieuwood</title>
  <style>
    @page { margin: 20mm; size: A4; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #222; max-width: 700px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #F5A45B; }
    .header h1 { font-size: 24px; margin: 0 0 8px; color: #111; }
    .header .subtitle { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 2px; }
    .meta { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 24px; }
    .meta-item { font-size: 13px; color: #555; }
    .meta-item strong { color: #222; }
    .question { background: linear-gradient(135deg, #FFF7ED, #FFF); border: 1px solid #FFD4B2; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; }
    .question p { font-size: 16px; line-height: 1.6; color: #333; margin: 0; }
    .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #999; font-weight: 600; margin: 24px 0 12px; }
    .stats { display: flex; gap: 16px; margin-bottom: 24px; }
    .stat { text-align: center; flex: 1; padding: 12px; border-radius: 8px; background: #F5F5F5; }
    .stat .number { font-size: 24px; font-weight: 700; color: #F5A45B; }
    .stat .label { font-size: 11px; color: #888; margin-top: 2px; }
    .footer { text-align: center; margin-top: 40px; padding-top: 16px; border-top: 1px solid #EEE; font-size: 11px; color: #AAA; }
  </style>
</head>
<body>
  <div class="header">
    <div class="subtitle">Banlieuwood</div>
    <h1>${sessionTitle}</h1>
    <div style="font-size:13px;color:#666">${now}</div>
  </div>

  <div class="meta">
    <div class="meta-item"><strong>Niveau :</strong> ${level || "—"}</div>
    <div class="meta-item"><strong>Module :</strong> ${moduleLabel}</div>
    <div class="meta-item"><strong>Eleves :</strong> ${studentCount}</div>
  </div>

  <div class="stats">
    <div class="stat"><div class="number">${responses.length}</div><div class="label">Reponses</div></div>
    <div class="stat"><div class="number">${highlighted.length}</div><div class="label">Mises en avant</div></div>
    <div class="stat"><div class="number">${avgScore || "—"}</div><div class="label">Note moy.</div></div>
  </div>

  <div class="section-title">Question</div>
  <div class="question"><p>${questionPrompt}</p></div>

  <div class="section-title">Reponses (${responses.length})</div>
  ${responsesHTML}

  <div class="footer">Exporte depuis Banlieuwood — banlieuwood.fr</div>
</body>
</html>`;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  }
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
  sessionId,
}: SessionExportProps) {
  const [exportMode, setExportMode] = useState<"current" | "full">("current");
  const [fullMarkdown, setFullMarkdown] = useState<string | null>(null);
  const [fullLoading, setFullLoading] = useState(false);
  const [fullStats, setFullStats] = useState<{
    totalResponses: number;
    starredCount: number;
    highlightedCount: number;
  } | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setExportMode("current");
      setFullMarkdown(null);
      setFullStats(null);
    }
  }, [open]);

  // Fetch full export from API when switching to full mode
  const fetchFullExport = useCallback(async () => {
    if (!sessionId) return;
    setFullLoading(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/export`);
      if (!res.ok) throw new Error("Erreur");
      const data = await res.json();
      setFullMarkdown(data.markdown);
      setFullStats(data.stats);
    } catch {
      setFullMarkdown("Erreur lors du chargement de l'export complet.");
    } finally {
      setFullLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (exportMode === "full" && !fullMarkdown && !fullLoading) {
      fetchFullExport();
    }
  }, [exportMode, fullMarkdown, fullLoading, fetchFullExport]);

  const currentMarkdown = generateMarkdown({
    sessionTitle,
    level,
    moduleLabel,
    questionPrompt,
    responses,
    studentCount,
  });
  const activeMarkdown = exportMode === "full" ? fullMarkdown || "Chargement..." : currentMarkdown;
  const slug = sessionTitle.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 30);
  const filename =
    exportMode === "full"
      ? `seance-complete-${slug}-${new Date().toISOString().slice(0, 10)}.md`
      : `seance-${slug}-${new Date().toISOString().slice(0, 10)}.md`;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] max-w-[90vw] max-h-[80vh] glass-card rounded-2xl border border-black/[0.06] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-5 py-3 border-b border-black/[0.04] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-lg">📋</span>
                <h3 className="text-sm font-semibold">Export de séance</h3>
              </div>
              <button onClick={onClose} className="text-bw-muted hover:text-bw-heading text-sm cursor-pointer">
                &#10005;
              </button>
            </div>

            {/* Mode toggle — current question vs full session */}
            {sessionId && (
              <div className="px-5 py-2 border-b border-black/[0.04] flex items-center gap-2 flex-shrink-0">
                <div className="flex rounded-lg bg-bw-surface-dim p-0.5 text-[12px] font-medium">
                  <button
                    onClick={() => setExportMode("current")}
                    className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
                      exportMode === "current"
                        ? "bg-white shadow-sm text-bw-heading"
                        : "text-bw-muted hover:text-bw-text"
                    }`}
                  >
                    Question actuelle
                  </button>
                  <button
                    onClick={() => setExportMode("full")}
                    className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
                      exportMode === "full" ? "bg-white shadow-sm text-bw-heading" : "text-bw-muted hover:text-bw-text"
                    }`}
                  >
                    Séance complète
                  </button>
                </div>
                {exportMode === "full" && fullStats && (
                  <span className="text-body-xs text-bw-muted ml-auto">
                    {fullStats.totalResponses} réponses, {fullStats.highlightedCount} mises en avant
                  </span>
                )}
              </div>
            )}

            {/* Preview */}
            <div className="flex-1 overflow-y-auto px-5 py-3">
              {fullLoading && exportMode === "full" ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-2">
                    <div className="w-6 h-6 border-2 border-bw-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-bw-muted">Chargement de l&apos;export complet...</p>
                  </div>
                </div>
              ) : (
                <pre className="text-xs text-bw-text leading-relaxed whitespace-pre-wrap font-mono bg-bw-surface rounded-xl p-4 border border-black/[0.04] max-h-[50vh] overflow-y-auto">
                  {activeMarkdown}
                </pre>
              )}
            </div>

            {/* Actions */}
            <div className="px-5 py-3 border-t border-black/[0.04] flex items-center justify-between flex-shrink-0">
              <p className="text-xs text-bw-muted">
                {exportMode === "current"
                  ? `${responses.length} réponses`
                  : fullStats
                    ? `${fullStats.totalResponses} réponses (toutes questions)`
                    : "..."}
                , {filename}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeMarkdown);
                  }}
                  disabled={fullLoading}
                  className="px-4 py-2 rounded-xl text-xs font-medium cursor-pointer border border-black/[0.04] hover:border-black/10 text-bw-muted hover:text-bw-heading transition-colors disabled:opacity-40"
                >
                  Copier
                </button>
                <button
                  onClick={() => downloadMarkdown(activeMarkdown, filename)}
                  disabled={fullLoading}
                  className="px-4 py-2 rounded-xl text-xs font-medium cursor-pointer border border-black/[0.04] hover:border-black/10 text-bw-muted hover:text-bw-heading transition-colors disabled:opacity-40"
                >
                  .md
                </button>
                {exportMode === "current" && (
                  <button
                    onClick={() => downloadCSV(responses, filename.replace(/\.md$/, ".csv"))}
                    className="px-4 py-2 rounded-xl text-xs font-medium cursor-pointer border border-black/[0.04] hover:border-black/10 text-bw-muted hover:text-bw-heading transition-colors"
                  >
                    CSV
                  </button>
                )}
                {exportMode === "current" && (
                  <button
                    onClick={() =>
                      downloadPDF({ sessionTitle, level, moduleLabel, questionPrompt, responses, studentCount })
                    }
                    className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all hover:brightness-110"
                    style={{ backgroundColor: "#F5A45B", color: "white" }}
                  >
                    PDF
                  </button>
                )}
                {exportMode === "full" && (
                  <button
                    onClick={() => downloadMarkdown(activeMarkdown, filename)}
                    disabled={fullLoading}
                    className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all hover:brightness-110 disabled:opacity-40"
                    style={{ backgroundColor: "#F5A45B", color: "white" }}
                  >
                    Télécharger
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
