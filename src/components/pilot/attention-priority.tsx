"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

// ═══════════════════════════════════════════════════════════════
// ATTENTION PRIORITY — Single primary alert for the teacher
//
// When multiple things compete (stuck + hands + divided + silence),
// this component surfaces THE ONE thing to act on right now.
// Reduces cognitive overload in live classroom situations.
//
// v2 — 4 corrections:
// 1. Priority reorder: urgent hands > silence > mass stuck
// 2. Cooldown after dismiss (10s, or until data changes)
// 3. Subtitles explain WHY the alert exists (data-backed)
// 4. Secondary alerts show type + mini summary, not just count
// + Category labels (Urgent/Blocage/Opportunité)
// + Compact alert history (last 3 dismissed)
// ═══════════════════════════════════════════════════════════════

export interface AttentionSignals {
  stuckCount: number;
  stuckNames?: string[];
  handsRaised: number;
  handsNames?: string[];
  handsRaisedAt?: (string | null)[];
  responsesCount: number;
  totalStudents: number;
  onlineStudents: number;
  elapsedSeconds: number;
  status: string;
  isClassDivided?: boolean;
  divisionLabel?: string; // "A (45%) vs B (38%)"
}

export interface AttentionAction {
  label: string;
  actionId: string;
}

type AlertCategory = "urgent" | "blocage" | "opportunite" | "info";

export interface PrimaryAttention {
  id: string;
  severity: "critical" | "high" | "medium";
  category: AlertCategory;
  icon: string;
  title: string;
  subtitle: string;
  action?: AttentionAction;
  pulse?: boolean;
  /** Fingerprint for cooldown — alert won't reappear after dismiss until this changes */
  dataKey: string;
}

const CATEGORY_LABELS: Record<AlertCategory, { label: string; color: string }> = {
  urgent: { label: "Urgent", color: "#B71C1C" },
  blocage: { label: "Blocage", color: "#E65100" },
  opportunite: { label: "Opportunite", color: "#1565C0" },
  info: { label: "Info", color: "#4A6FA5" },
};

// ── Priority engine — returns sorted list, first = primary ──
// Order: urgent hands > silence > mass stuck > class divided > all responded > low participation
export function computeAttentionQueue(signals: AttentionSignals): PrimaryAttention[] {
  const queue: PrimaryAttention[] = [];
  const { stuckCount, handsRaised, responsesCount, totalStudents, onlineStudents, elapsedSeconds, status } = signals;

  if (status !== "responding") return queue;

  const now = Date.now();
  const fmtTime = (s: number) => `${Math.floor(s / 60)}min${String(Math.floor(s % 60)).padStart(2, "0")}`;

  // ── 1. CRITICAL — Urgent hand raised (>2min) or multiple hands ──
  if (handsRaised > 0 && signals.handsRaisedAt) {
    const handDetails = (signals.handsNames || []).map((name, i) => {
      const ts = signals.handsRaisedAt?.[i];
      const ms = ts ? now - new Date(ts).getTime() : 0;
      return { name, ms, mins: Math.floor(ms / 60000) };
    }).sort((a, b) => b.ms - a.ms);

    const urgentHands = handDetails.filter(h => h.ms > 120000);
    const isUrgent = urgentHands.length > 0 || handsRaised >= 2;

    if (isUrgent && urgentHands.length > 0) {
      const longest = urgentHands[0];
      queue.push({
        id: "urgent-hand",
        severity: "critical",
        category: "urgent",
        icon: "✋",
        title: `Main levee depuis ${longest.mins}min`,
        subtitle: `${longest.name} attend votre attention.${urgentHands.length > 1 ? ` +${urgentHands.length - 1} autre${urgentHands.length > 2 ? "s" : ""} (${urgentHands.slice(1).map(h => h.name).join(", ")})` : ""}`,
        action: { label: "Voir l'eleve", actionId: "see-hand" },
        pulse: true,
        dataKey: `hand-${urgentHands.length}-${longest.mins}`,
      });
    } else if (handsRaised >= 2) {
      queue.push({
        id: "multiple-hands",
        severity: "high",
        category: "urgent",
        icon: "✋",
        title: `${handsRaised} mains levees`,
        subtitle: `${handDetails.map(h => h.name).join(", ")} — Repondez-leur avant de continuer.`,
        action: { label: "Voir les mains", actionId: "see-hand" },
        pulse: true,
        dataKey: `hands-${handsRaised}`,
      });
    }
  }

  // ── 2. CRITICAL — Total silence after 90s ──
  if (responsesCount === 0 && elapsedSeconds >= 90 && totalStudents > 3) {
    queue.push({
      id: "total-silence",
      severity: "critical",
      category: "blocage",
      icon: "🔇",
      title: "Silence total",
      subtitle: `0/${onlineStudents} reponses apres ${fmtTime(elapsedSeconds)}. La question est peut-etre trop difficile ou mal comprise.`,
      action: { label: "Relancer la classe", actionId: "broadcast" },
      pulse: true,
      dataKey: `silence-${Math.floor(elapsedSeconds / 30)}`,
    });
  }

  // ── 3. HIGH — Mass stuck (≥3) ──
  if (stuckCount >= 3) {
    const names = signals.stuckNames?.slice(0, 3).join(", ") || "";
    const extra = stuckCount > 3 ? ` +${stuckCount - 3}` : "";
    queue.push({
      id: "mass-stuck",
      severity: "high",
      category: "blocage",
      icon: "🚨",
      title: `${stuckCount} eleves bloques`,
      subtitle: `${names}${extra} n'arrivent pas a repondre depuis plus de 90s. Un indice collectif peut debloquer la situation.`,
      action: { label: "Envoyer un indice", actionId: "hint" },
      pulse: true,
      dataKey: `stuck-${stuckCount}`,
    });
  }

  // ── 4. MEDIUM — Class divided (50/50 split) ──
  if (signals.isClassDivided && responsesCount >= 4) {
    queue.push({
      id: "class-divided",
      severity: "medium",
      category: "opportunite",
      icon: "⚡",
      title: "Classe divisee",
      subtitle: signals.divisionLabel
        ? `${signals.divisionLabel} — Moment ideal pour un debat. Demandez a chaque camp de justifier.`
        : "Opinions partagees — moment ideal pour un debat.",
      action: { label: "Lancer un debat", actionId: "debate" },
      dataKey: `divided-${signals.divisionLabel || ""}`,
    });
  }

  // ── 5. MEDIUM — All responded ──
  if (responsesCount >= onlineStudents && onlineStudents > 0) {
    queue.push({
      id: "all-responded",
      severity: "medium",
      category: "opportunite",
      icon: "✅",
      title: "Tout le monde a repondu",
      subtitle: `${onlineStudents}/${onlineStudents} en ${fmtTime(elapsedSeconds)}. Lancez le vote ou passez a la discussion.`,
      action: { label: "Lancer le vote", actionId: "vote" },
      dataKey: `all-${onlineStudents}`,
    });
  }

  // ── 6. MEDIUM — Low participation after 2min ──
  if (responsesCount > 0 && responsesCount < totalStudents * 0.3 && elapsedSeconds > 120) {
    const pct = Math.round((responsesCount / onlineStudents) * 100);
    queue.push({
      id: "low-participation",
      severity: "medium",
      category: "blocage",
      icon: "📉",
      title: "Participation faible",
      subtitle: `${responsesCount}/${onlineStudents} reponses (${pct}%) apres ${fmtTime(elapsedSeconds)}. Encouragez la classe ou reformulez.`,
      action: { label: "Encourager", actionId: "broadcast" },
      dataKey: `low-${responsesCount}-${Math.floor(elapsedSeconds / 30)}`,
    });
  }

  // ── 7. MEDIUM — Mixed needs (some stuck + hands, non-urgent) ──
  if (stuckCount > 0 && stuckCount < 3 && handsRaised > 0 && !queue.some(q => q.id === "urgent-hand" || q.id === "multiple-hands")) {
    queue.push({
      id: "mixed-needs",
      severity: "medium",
      category: "urgent",
      icon: "👀",
      title: `${stuckCount} bloque${stuckCount > 1 ? "s" : ""} + ${handsRaised} main${handsRaised > 1 ? "s" : ""}`,
      subtitle: `${signals.stuckNames?.slice(0, 2).join(", ") || ""} en difficulte, ${signals.handsNames?.[0] || ""} demande de l'aide.`,
      action: { label: "Voir les alertes", actionId: "see-alerts" },
      dataKey: `mixed-${stuckCount}-${handsRaised}`,
    });
  }

  return queue;
}

// ── Severity styles ──
const SEVERITY_STYLES = {
  critical: {
    bg: "rgba(198,40,40,0.08)",
    border: "rgba(198,40,40,0.25)",
    titleColor: "#B71C1C",
    subtitleColor: "#C62828",
    actionBg: "#C62828",
    actionText: "#FFFFFF",
    glowColor: "rgba(198,40,40,0.15)",
  },
  high: {
    bg: "rgba(245,164,91,0.08)",
    border: "rgba(245,164,91,0.25)",
    titleColor: "#E65100",
    subtitleColor: "#8B4513",
    actionBg: "#F5A45B",
    actionText: "#FFFFFF",
    glowColor: "rgba(245,164,91,0.12)",
  },
  medium: {
    bg: "rgba(107,140,255,0.06)",
    border: "rgba(107,140,255,0.18)",
    titleColor: "#3B5998",
    subtitleColor: "#4A6FA5",
    actionBg: "#6B8CFF",
    actionText: "#FFFFFF",
    glowColor: "rgba(107,140,255,0.08)",
  },
} as const;

interface DismissEntry {
  id: string;
  dataKey: string;
  dismissedAt: number;
  title: string;
  icon: string;
}

const COOLDOWN_MS = 10_000; // 10s cooldown after dismiss

interface AttentionPriorityProps {
  signals: AttentionSignals;
  onAction?: (actionId: string) => void;
  showSecondary?: boolean;
}

export function AttentionPriority({ signals, onAction, showSecondary = true }: AttentionPriorityProps) {
  const [dismissLog, setDismissLog] = useState<DismissEntry[]>([]);
  const [showOthers, setShowOthers] = useState(false);
  const prevPrimaryRef = useRef<string | null>(null);

  // Reset on new question
  const statusRef = useRef(signals.status);
  useEffect(() => {
    if (signals.status !== statusRef.current) {
      setDismissLog([]);
      setShowOthers(false);
      statusRef.current = signals.status;
    }
  }, [signals.status]);

  const queue = useMemo(() => computeAttentionQueue(signals), [signals]);

  // Filter out dismissed alerts (with cooldown + dataKey change detection)
  const visible = useMemo(() => {
    const now = Date.now();
    return queue.filter(alert => {
      const entry = dismissLog.find(d => d.id === alert.id);
      if (!entry) return true;
      // Show again if data changed significantly (dataKey different)
      if (entry.dataKey !== alert.dataKey) return true;
      // Show again after cooldown
      if (now - entry.dismissedAt > COOLDOWN_MS) return true;
      return false;
    });
  }, [queue, dismissLog]);

  const primary = visible[0] || null;
  const secondary = visible.slice(1);

  const dismiss = useCallback((alert: PrimaryAttention) => {
    setDismissLog(prev => [
      { id: alert.id, dataKey: alert.dataKey, dismissedAt: Date.now(), title: alert.title, icon: alert.icon },
      ...prev.filter(d => d.id !== alert.id),
    ].slice(0, 5));
  }, []);

  // Track primary changes
  useEffect(() => {
    if (primary) prevPrimaryRef.current = primary.id;
  }, [primary]);

  // Recent history (last 3 dismissed, within this session)
  const recentHistory = useMemo(() => {
    const sessionStart = Date.now() - signals.elapsedSeconds * 1000;
    return dismissLog
      .filter(d => d.dismissedAt > sessionStart)
      .slice(0, 3);
  }, [dismissLog, signals.elapsedSeconds]);

  if (!primary) {
    // Show history even when no active alert
    if (recentHistory.length > 0) {
      return (
        <div className="rounded-lg px-3 py-2" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.04)" }}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#B0A99E]">Alertes recentes</span>
          <div className="mt-1 space-y-0.5">
            {recentHistory.map((h, i) => {
              const ago = Math.floor((Date.now() - h.dismissedAt) / 60000);
              const timeLabel = ago >= 1 ? `il y a ${ago}min` : "a l'instant";
              return (
                <div key={i} className="flex items-center gap-1.5 text-[10px] text-[#B0A99E]">
                  <span className="flex-shrink-0">{h.icon}</span>
                  <span className="truncate">{h.title}</span>
                  <span className="ml-auto flex-shrink-0 tabular-nums">{timeLabel}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  }

  const style = SEVERITY_STYLES[primary.severity];
  const categoryInfo = CATEGORY_LABELS[primary.category];

  return (
    <div className="space-y-1.5">
      {/* ═══ PRIMARY ALERT — single focus ═══ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={primary.id}
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="rounded-xl overflow-hidden relative"
          style={{
            background: style.bg,
            border: `1.5px solid ${style.border}`,
            boxShadow: `0 2px 12px ${style.glowColor}`,
          }}
        >
          {/* Pulse glow ring for critical/high */}
          {primary.pulse && (
            <motion.div
              className="absolute inset-[-1px] rounded-xl pointer-events-none"
              style={{ border: `2px solid ${style.border}` }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
          )}

          <div className="px-3.5 py-3 relative z-10">
            {/* Category label + dismiss */}
            <div className="flex items-center justify-between mb-1.5">
              <span
                className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                style={{ color: categoryInfo.color, background: `${categoryInfo.color}10` }}
              >
                {categoryInfo.label}
              </span>
              <button
                onClick={() => dismiss(primary)}
                className="text-[10px] opacity-40 hover:opacity-80 cursor-pointer transition-opacity flex-shrink-0"
                style={{ color: style.titleColor }}
                title="Ignorer (revient si la situation change)"
              >
                ✕
              </button>
            </div>

            {/* Icon + title + subtitle */}
            <div className="flex items-start gap-2.5">
              <span className="text-lg flex-shrink-0 mt-0.5">{primary.icon}</span>
              <div className="flex-1 min-w-0">
                <span
                  className="text-[13px] font-bold leading-tight block"
                  style={{ color: style.titleColor }}
                >
                  {primary.title}
                </span>
                <p className="text-[11px] leading-relaxed mt-0.5" style={{ color: style.subtitleColor }}>
                  {primary.subtitle}
                </p>
              </div>
            </div>

            {/* Action button */}
            {primary.action && onAction && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => onAction(primary.action!.actionId)}
                className="w-full mt-2.5 px-3 py-2 rounded-lg text-[12px] font-semibold cursor-pointer transition-all hover:brightness-110"
                style={{ background: style.actionBg, color: style.actionText }}
              >
                {primary.action.label}
              </motion.button>
            )}
          </div>

          {/* Secondary summary — show type + title, not just count */}
          {secondary.length > 0 && showSecondary && (
            <button
              onClick={() => setShowOthers(!showOthers)}
              className="w-full px-3.5 py-2 flex items-center gap-2 cursor-pointer transition-colors hover:bg-black/[0.03]"
              style={{ borderTop: `1px solid ${style.border}` }}
            >
              <div className="flex-1 text-left">
                {showOthers ? (
                  <span className="text-[10px] font-medium" style={{ color: style.subtitleColor }}>
                    Masquer
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                    {secondary.map(a => (
                      <span key={a.id} className="text-[10px]" style={{ color: style.subtitleColor }}>
                        {a.icon} {a.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <svg
                width="10" height="10" viewBox="0 0 24 24"
                fill="none" stroke={style.subtitleColor} strokeWidth="2"
                className={`flex-shrink-0 transition-transform duration-200 ${showOthers ? "rotate-180" : ""}`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ═══ SECONDARY ALERTS — expanded detail ═══ */}
      <AnimatePresence>
        {showOthers && secondary.map((alert, i) => {
          const s = SEVERITY_STYLES[alert.severity];
          const cat = CATEGORY_LABELS[alert.category];
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-lg overflow-hidden"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}
            >
              <div className="px-3 py-2 space-y-1">
                {/* Category + title */}
                <div className="flex items-center gap-2">
                  <span className="text-sm flex-shrink-0">{alert.icon}</span>
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider px-1 py-px rounded flex-shrink-0"
                    style={{ color: cat.color, background: `${cat.color}10` }}
                  >
                    {cat.label}
                  </span>
                  <span className="text-[11px] font-semibold truncate" style={{ color: s.titleColor }}>
                    {alert.title}
                  </span>
                </div>
                {/* Subtitle + action row */}
                <div className="flex items-end gap-2 ml-6">
                  <p className="text-[10px] leading-relaxed flex-1" style={{ color: s.subtitleColor }}>
                    {alert.subtitle}
                  </p>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {alert.action && onAction && (
                      <button
                        onClick={() => onAction(alert.action!.actionId)}
                        className="text-[10px] font-semibold px-2 py-1 rounded-md cursor-pointer transition-all hover:brightness-110"
                        style={{ background: `${s.actionBg}20`, color: s.actionBg }}
                      >
                        {alert.action.label}
                      </button>
                    )}
                    <button
                      onClick={() => dismiss(alert)}
                      className="text-[10px] opacity-40 hover:opacity-80 cursor-pointer transition-opacity"
                      style={{ color: s.titleColor }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* ═══ ALERT HISTORY — last 3 dismissed ═══ */}
      {recentHistory.length > 0 && (
        <div className="px-2 pt-1">
          <div className="space-y-0.5">
            {recentHistory.map((h, i) => {
              const ago = Math.floor((Date.now() - h.dismissedAt) / 60000);
              const timeLabel = ago >= 1 ? `${ago}min` : "<1min";
              return (
                <div key={i} className="flex items-center gap-1.5 text-[10px] text-[#B0A99E]">
                  <span className="flex-shrink-0 opacity-60">{h.icon}</span>
                  <span className="truncate opacity-60">{h.title}</span>
                  <span className="ml-auto flex-shrink-0 tabular-nums opacity-40">{timeLabel}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
