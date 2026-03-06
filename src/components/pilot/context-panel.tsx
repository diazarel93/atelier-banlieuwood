"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import type { ModuleGuide, QuestionGuide } from "@/lib/guide-data";
import { CountdownTimer } from "@/components/countdown-timer";

interface Student {
  id: string;
  display_name: string;
  avatar: string;
  is_active: boolean;
  warnings: number;
}

interface Response {
  id: string;
  student_id: string;
  text: string;
  submitted_at: string;
  is_hidden: boolean;
  is_highlighted: boolean;
}

type StudentStateValue = "active" | "responded" | "stuck" | "disconnected";

export interface ContextPanelProps {
  moduleGuide: ModuleGuide | undefined;
  questionGuide: QuestionGuide | undefined;
  responsesCount: number;
  totalStudents: number;
  hiddenCount: number;
  voteOptionCount: number;
  sessionStatus: string;
  selectedStudent: Student | null;
  studentResponses: Response[];
  onSelectStudent: (student: Student | null) => void;
  onClose: () => void;
  students?: Student[];
  studentStates?: { id: string; state: StudentStateValue }[];
  onNudge?: (studentId: string, text: string) => void;
  onWarn?: (studentId: string) => void;
}

/** Extended props for ContextDocks (adds timer, broadcast, teams) */
export interface ContextDocksProps extends ContextPanelProps {
  // Timer
  timerEndsAt?: string | null;
  onClearTimer?: () => void;
  onTimerExpired?: () => void;
  // Teams
  teams?: { id: string; team_name: string; team_color: string; team_number: number; students: { id: string; display_name: string; avatar: string }[] }[];
  // Broadcast
  onBroadcast?: () => void;
}

const STATE_COLORS: Record<StudentStateValue, string> = {
  responded: "#4ECDC4",
  active: "#FF6B35",
  stuck: "#F59E0B",
  disconnected: "#444",
};

const STATE_LABELS: Record<StudentStateValue, string> = {
  responded: "Répondu",
  active: "En attente",
  stuck: "Bloqué",
  disconnected: "Déconnecté",
};

// ─── STORAGE KEY ───────────────────────────────────────────────
const UPPER_KEY = "pilot-dock-upper";
const LOWER_KEY = "pilot-dock-lower";

// ─── TWO FLOATING DOCKS (right side) ───────────────────────────

type UpperTab = "guide" | "stats" | "timer";
type LowerTab = "students" | "broadcast" | "teams";

export function ContextDocks(props: ContextDocksProps) {
  // Restore last open tab from localStorage
  const [upperOpen, setUpperOpen] = useState<UpperTab | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem(UPPER_KEY);
    return saved === "guide" || saved === "stats" || saved === "timer" ? saved : null;
  });
  const [lowerOpen, setLowerOpen] = useState<LowerTab | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem(LOWER_KEY);
    return saved === "students" || saved === "broadcast" || saved === "teams" ? saved : null;
  });

  // Track previous response count for pulse animation
  const prevResponseCount = useRef(props.responsesCount);
  const [statsPulse, setStatsPulse] = useState(false);
  useEffect(() => {
    if (props.responsesCount > prevResponseCount.current && upperOpen !== "stats") {
      setStatsPulse(true);
      const t = setTimeout(() => setStatsPulse(false), 1500);
      prevResponseCount.current = props.responsesCount;
      return () => clearTimeout(t);
    }
    prevResponseCount.current = props.responsesCount;
  }, [props.responsesCount, upperOpen]);

  // Persist open state
  useEffect(() => { localStorage.setItem(UPPER_KEY, upperOpen || ""); }, [upperOpen]);
  useEffect(() => { localStorage.setItem(LOWER_KEY, lowerOpen || ""); }, [lowerOpen]);

  function toggleUpper(tab: UpperTab) {
    setUpperOpen((prev) => (prev === tab ? null : tab));
    setLowerOpen(null);
  }

  function toggleLower(tab: LowerTab) {
    setLowerOpen((prev) => (prev === tab ? null : tab));
    setUpperOpen(null);
  }

  // ── Auto-open guide when questionGuide changes ──
  const prevQuestionRef = useRef(props.questionGuide?.position);
  useEffect(() => {
    if (props.questionGuide && props.questionGuide.position !== prevQuestionRef.current) {
      setUpperOpen("guide");
      setLowerOpen(null);
    }
    prevQuestionRef.current = props.questionGuide?.position;
  }, [props.questionGuide]);

  // ── Keyboard shortcuts ──
  const handleKey = useCallback((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (e.target as HTMLElement)?.isContentEditable) return;

    const key = e.key.toLowerCase();
    if (key === "g") { e.preventDefault(); toggleUpper("guide"); }
    else if (key === "s" && !e.ctrlKey && !e.metaKey) { e.preventDefault(); toggleUpper("stats"); }
    else if (key === "e") { e.preventDefault(); toggleLower("students"); }
    else if (key === "t" && !e.ctrlKey && !e.metaKey) { e.preventDefault(); toggleUpper("timer"); }
    else if (key === "b" && !e.ctrlKey && !e.metaKey) { e.preventDefault(); toggleLower("broadcast"); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const hasGuideContent = !!(props.questionGuide || (props.moduleGuide?.aQuoiEtreAttentif?.length));
  const hasTimer = !!(props.timerEndsAt && new Date(props.timerEndsAt).getTime() > Date.now());
  const stuckCount = (props.studentStates || []).filter((s) => s.state === "stuck").length;
  const pct = props.totalStudents > 0 ? Math.round((props.responsesCount / props.totalStudents) * 100) : 0;
  const hasTeams = (props.teams?.length ?? 0) > 0;

  return (
    <>
      {/* ── UPPER DOCK — Guide + Stats + Timer ── */}
      <div className="fixed right-2.5 top-[30%] -translate-y-1/2 z-30 hidden lg:flex items-start gap-0 flex-row-reverse">
        {/* Icon strip */}
        <div className="flex flex-col items-center gap-1.5 py-2.5 px-1.5 rounded-2xl bg-bw-deep/80 backdrop-blur-md border border-white/[0.08] shadow-xl">
          {/* Guide */}
          <DockButton
            active={upperOpen === "guide"}
            onClick={() => toggleUpper("guide")}
            title="Guide pédagogique (G)"
            color="#FF6B35"
            hasContent={hasGuideContent}
            emoji="📖"
            shortcut="G"
          />

          {/* Stats */}
          <DockButton
            active={upperOpen === "stats"}
            onClick={() => toggleUpper("stats")}
            title="Statistiques (S)"
            color="#8B5CF6"
            emoji="📊"
            shortcut="S"
            badge={upperOpen !== "stats" && pct > 0 ? `${pct}%` : undefined}
            badgeColor={pct === 100 ? "#10B981" : "#8B5CF6"}
            pulse={statsPulse}
          />

          {/* Timer */}
          <DockButton
            active={upperOpen === "timer"}
            onClick={() => toggleUpper("timer")}
            title="Chronomètre (T)"
            color="#F59E0B"
            emoji={hasTimer ? "⏱" : "⏱"}
            shortcut="T"
            hasContent={hasTimer}
          />
        </div>

        {/* Panel (slides left) */}
        <AnimatePresence mode="wait">
          {upperOpen && (
            <motion.div
              key={upperOpen}
              initial={{ opacity: 0, x: 8, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 8, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mr-2 w-[260px] max-h-[60vh] rounded-2xl bg-bw-deep/90 backdrop-blur-md border border-white/[0.08] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
                {upperOpen === "guide" && <GuideContent {...props} />}
                {upperOpen === "stats" && <StatsContent {...props} />}
                {upperOpen === "timer" && <TimerContent timerEndsAt={props.timerEndsAt} onClearTimer={props.onClearTimer} onTimerExpired={props.onTimerExpired} />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── LOWER DOCK — Students + Broadcast + Teams ── */}
      <div className="fixed right-2.5 top-[68%] -translate-y-1/2 z-30 hidden lg:flex items-start gap-0 flex-row-reverse">
        {/* Icon strip */}
        <div className="flex flex-col items-center gap-1.5 py-2.5 px-1.5 rounded-2xl bg-bw-deep/80 backdrop-blur-md border border-white/[0.08] shadow-xl">
          {/* Students */}
          <DockButton
            active={lowerOpen === "students"}
            onClick={() => toggleLower("students")}
            title="Élèves (E)"
            color="#4ECDC4"
            emoji="👥"
            shortcut="E"
            badge={lowerOpen !== "students" && props.totalStudents > 0 ? String(props.totalStudents) : undefined}
            badgeColor="#4ECDC4"
            alertDot={stuckCount > 0 && lowerOpen !== "students"}
            alertColor="#F59E0B"
          />

          {/* Broadcast */}
          <DockButton
            active={lowerOpen === "broadcast"}
            onClick={() => toggleLower("broadcast")}
            title="Message classe (B)"
            color="#FF6B35"
            emoji="📢"
            shortcut="B"
          />

          {/* Teams */}
          <DockButton
            active={lowerOpen === "teams"}
            onClick={() => toggleLower("teams")}
            title="Équipes"
            color="#06B6D4"
            emoji={hasTeams ? "👥" : "○"}
            shortcut=""
            disabled={!hasTeams}
            badge={hasTeams ? String(props.teams!.length) : undefined}
            badgeColor="#06B6D4"
          />
        </div>

        {/* Panel (slides left) */}
        <AnimatePresence mode="wait">
          {lowerOpen && (
            <motion.div
              key={lowerOpen}
              initial={{ opacity: 0, x: 8, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 8, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mr-2 w-[260px] max-h-[60vh] rounded-2xl bg-bw-deep/90 backdrop-blur-md border border-white/[0.08] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
                {lowerOpen === "students" && <StudentsContent {...props} />}
                {lowerOpen === "broadcast" && <BroadcastContent onBroadcast={props.onBroadcast} />}
                {lowerOpen === "teams" && <TeamsContent teams={props.teams || []} />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Click-away — non-blocking: closes panels on click outside */}
      {(upperOpen || lowerOpen) && (
        <div
          className="fixed inset-0 z-20 hidden lg:block"
          onClick={() => { setUpperOpen(null); setLowerOpen(null); }}
        />
      )}
    </>
  );
}

// ─── DOCK BUTTON ───────────────────────────────────────────────

function DockButton({
  active,
  onClick,
  title,
  color,
  emoji,
  shortcut,
  badge,
  badgeColor,
  hasContent,
  pulse,
  alertDot,
  alertColor,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  color: string;
  emoji: string;
  shortcut: string;
  badge?: string;
  badgeColor?: string;
  hasContent?: boolean;
  pulse?: boolean;
  alertDot?: boolean;
  alertColor?: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      title={title}
      disabled={disabled}
      className={`relative w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all duration-200 focus-visible:ring-2 focus-visible:ring-bw-teal focus-visible:outline-none ${
        disabled
          ? "opacity-30 cursor-not-allowed"
          : active
            ? "scale-110 cursor-pointer"
            : "hover:scale-105 hover:bg-white/[0.06] cursor-pointer"
      }`}
      style={{
        background: active
          ? `linear-gradient(135deg, ${color}30, ${color}10)`
          : hasContent
            ? `linear-gradient(135deg, ${color}15, ${color}05)`
            : undefined,
        border: active
          ? `1.5px solid ${color}50`
          : hasContent
            ? `1px solid ${color}20`
            : "1px solid transparent",
      }}
    >
      <span className="leading-none">{emoji}</span>

      {/* Keyboard hint */}
      {shortcut && (
        <span className="absolute -bottom-0.5 -right-0.5 text-xs text-white/20 font-mono leading-none pointer-events-none">
          {shortcut}
        </span>
      )}

      {/* Content pulse (guide available, timer active) */}
      {hasContent && !active && (
        <motion.div
          className="absolute -top-0.5 -left-0.5 w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
          animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}

      {/* New data pulse (stats updates) */}
      {pulse && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{ border: `2px solid ${color}` }}
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 0, scale: 1.4 }}
          transition={{ duration: 0.8 }}
        />
      )}

      {/* Badge (count or %) */}
      {badge && (
        <div
          className="absolute -top-1.5 -left-1.5 min-w-[16px] h-[14px] px-1 rounded-full flex items-center justify-center"
          style={{ backgroundColor: badgeColor || color }}
        >
          <span className="text-xs font-bold text-black tabular-nums leading-none">{badge}</span>
        </div>
      )}

      {/* Alert dot (stuck students) */}
      {alertDot && (
        <motion.div
          className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: alertColor || "#F59E0B" }}
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
      )}
    </button>
  );
}

// ─── GUIDE TAB CONTENT ─────────────────────────────────────────

function GuideContent({
  questionGuide,
  moduleGuide,
}: ContextPanelProps) {
  const [alertsExpanded, setAlertsExpanded] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-base leading-none">📖</span>
        <span className="text-xs font-semibold text-bw-heading">Guide pédagogique</span>
      </div>

      {questionGuide && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-bw-primary/15 text-bw-primary">
              Q{questionGuide.position}
            </span>
            <span className="text-xs font-semibold truncate">{questionGuide.label}</span>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-bw-muted mb-0.5">Ce qu&apos;on attend</p>
            <p className="text-xs text-bw-text leading-relaxed">{questionGuide.whatToExpect}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-bw-muted mb-0.5">Pièges fréquents</p>
            <p className="text-xs text-bw-amber leading-relaxed">{questionGuide.commonPitfalls}</p>
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(questionGuide.relancePhrase);
              toast.success("Copié !");
            }}
            className="w-full text-left bg-bw-teal/5 border border-bw-teal/20 rounded-xl px-2.5 py-2 cursor-pointer hover:border-bw-teal/40 transition-colors duration-200 group"
          >
            <span className="text-xs text-bw-teal font-semibold">Relancer</span>
            <p className="text-xs text-bw-text italic leading-relaxed mt-0.5">
              &ldquo;{questionGuide.relancePhrase}&rdquo;
            </p>
            <span className="text-xs text-bw-muted group-hover:text-bw-teal transition-colors">clic = copier</span>
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(questionGuide.challengePhrase);
              toast.success("Copié !");
            }}
            className="w-full text-left bg-bw-violet/5 border border-bw-violet/20 rounded-xl px-2.5 py-2 cursor-pointer hover:border-bw-violet/40 transition-colors duration-200 group"
          >
            <span className="text-xs text-bw-violet font-semibold">Challenger</span>
            <p className="text-xs text-bw-text italic leading-relaxed mt-0.5">
              &ldquo;{questionGuide.challengePhrase}&rdquo;
            </p>
            <span className="text-xs text-bw-muted group-hover:text-bw-violet transition-colors">clic = copier</span>
          </button>
        </div>
      )}

      {moduleGuide && moduleGuide.aQuoiEtreAttentif?.length > 0 && (
        <div className="space-y-1.5">
          <button
            onClick={() => setAlertsExpanded(!alertsExpanded)}
            className="flex items-center gap-1.5 w-full text-left cursor-pointer group"
          >
            <span className="text-xs uppercase tracking-wider text-bw-amber font-semibold">Signaux</span>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-bw-amber/10 text-bw-amber">
              {moduleGuide.aQuoiEtreAttentif.length}
            </span>
            <svg
              width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#F59E0B"
              strokeWidth="2" strokeLinecap="round"
              className={`ml-auto transition-transform ${alertsExpanded ? "rotate-180" : ""}`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {alertsExpanded && (
            <ul className="space-y-1">
              {moduleGuide.aQuoiEtreAttentif.map((signal, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-bw-text leading-relaxed">
                  <span className="text-bw-amber flex-shrink-0 mt-0.5">!</span>
                  {signal}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!questionGuide && (!moduleGuide || !moduleGuide.aQuoiEtreAttentif?.length) && (
        <p className="text-xs text-bw-muted text-center py-4">Aucun guide pour ce module</p>
      )}
    </div>
  );
}

// ─── STATS TAB CONTENT ─────────────────────────────────────────

function StatsContent({
  responsesCount,
  totalStudents,
  hiddenCount,
  voteOptionCount,
  sessionStatus,
  studentResponses,
}: ContextPanelProps) {
  const pct = totalStudents > 0 ? Math.round((responsesCount / totalStudents) * 100) : 0;
  const highlightedCount = studentResponses.filter((r) => r.is_highlighted).length || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-base leading-none">📊</span>
        <span className="text-xs font-semibold text-bw-heading">Stats live</span>
      </div>

      {/* Progress ring */}
      <div className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: "linear-gradient(135deg, rgba(78,205,196,0.06), transparent)" }}>
        <div className="relative w-14 h-14 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(78,205,196,0.1)" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15.5" fill="none" strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${pct * 0.974} 100`}
              className="transition-all duration-500"
              style={{ stroke: pct === 100 ? "#10B981" : "#4ECDC4" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold tabular-nums" style={{ color: pct === 100 ? "#10B981" : "#4ECDC4" }}>
            {pct}%
          </span>
        </div>
        <div className="space-y-0.5">
          <p className="text-xs text-bw-text">{responsesCount}/{totalStudents} réponses</p>
          <p className="text-xs text-bw-muted">
            {totalStudents - responsesCount} en attente
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="h-1.5 bg-bw-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-bw-teal rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        {hiddenCount > 0 && (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-bw-amber/10 text-bw-amber">
            {hiddenCount} masquée{hiddenCount !== 1 ? "s" : ""}
          </span>
        )}
        {sessionStatus === "responding" && voteOptionCount > 0 && (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-bw-primary/10 text-bw-primary">
            {voteOptionCount} sélectionnée{voteOptionCount !== 1 ? "s" : ""}
          </span>
        )}
        {highlightedCount > 0 && (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-bw-teal/10 text-bw-teal">
            {highlightedCount} mise{highlightedCount !== 1 ? "s" : ""} en avant
          </span>
        )}
      </div>

      {/* Response rhythm */}
      <div className="space-y-1.5">
        <p className="text-xs uppercase tracking-wider text-bw-muted font-semibold">Rythme d&apos;arrivée</p>
        <ResponseRhythm responses={studentResponses} />
      </div>
    </div>
  );
}

// ─── TIMER TAB CONTENT ─────────────────────────────────────────

function TimerContent({
  timerEndsAt,
  onClearTimer,
  onTimerExpired,
}: {
  timerEndsAt?: string | null;
  onClearTimer?: () => void;
  onTimerExpired?: () => void;
}) {
  const hasTimer = !!(timerEndsAt && new Date(timerEndsAt).getTime() > Date.now());

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-base leading-none">⏱</span>
        <span className="text-xs font-semibold text-bw-heading">Chronomètre</span>
      </div>

      {hasTimer ? (
        <div className="space-y-3">
          <div className="flex items-center justify-center p-4 rounded-xl bg-bw-amber/5 border border-bw-amber/15">
            <CountdownTimer endsAt={timerEndsAt!} size="lg" onExpired={onTimerExpired} />
          </div>
          {onClearTimer && (
            <button
              onClick={onClearTimer}
              className="w-full py-1.5 rounded-xl text-xs font-medium text-bw-muted hover:text-white bg-bw-elevated border border-white/[0.06] hover:border-white/15 cursor-pointer transition-colors duration-200"
            >
              Annuler le chrono
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-6 space-y-2">
          <span className="text-2xl opacity-30">⏱</span>
          <p className="text-xs text-bw-muted">Aucun chrono actif</p>
          <p className="text-xs text-bw-muted/60">Lancez un timer depuis la barre d&apos;actions</p>
        </div>
      )}
    </div>
  );
}

// ─── BROADCAST TAB CONTENT ─────────────────────────────────────

function BroadcastContent({ onBroadcast }: { onBroadcast?: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-base leading-none">📢</span>
        <span className="text-xs font-semibold text-bw-heading">Message à la classe</span>
      </div>

      <p className="text-xs text-bw-muted leading-relaxed">
        Envoyez un message visible par tous les élèves connectés en temps réel.
      </p>

      <button
        onClick={() => {
          if (onBroadcast) onBroadcast();
          else window.dispatchEvent(new CustomEvent("pilot-broadcast"));
        }}
        className="w-full py-2.5 rounded-xl text-xs font-semibold bg-bw-primary/10 text-bw-primary border border-bw-primary/20 hover:border-bw-primary/40 cursor-pointer transition-colors duration-200"
      >
        Écrire un message
      </button>

      <div className="flex items-center gap-2 text-xs text-bw-muted">
        <span className="text-bw-muted/40">Raccourci :</span>
        <kbd className="px-1.5 py-0.5 rounded bg-bw-elevated border border-white/[0.08] text-xs font-mono">B</kbd>
      </div>
    </div>
  );
}

// ─── TEAMS TAB CONTENT ─────────────────────────────────────────

function TeamsContent({ teams }: { teams: { id: string; team_name: string; team_color: string; team_number: number; students: { id: string; display_name: string; avatar: string }[] }[] }) {
  if (teams.length === 0) {
    return (
      <div className="text-center py-6 space-y-2">
        <span className="text-2xl opacity-30">👥</span>
        <p className="text-xs text-bw-muted">Aucune équipe créée</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-base leading-none">👥</span>
        <span className="text-xs font-semibold text-bw-heading">Équipes</span>
        <span className="text-xs text-bw-muted tabular-nums ml-auto">{teams.length} équipes</span>
      </div>

      <div className="space-y-2">
        {teams.map((team) => (
          <div
            key={team.id}
            className="rounded-xl p-2.5 border border-white/[0.06] space-y-1.5"
            style={{ background: `linear-gradient(135deg, ${team.team_color}08, transparent)` }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: team.team_color }} />
              <span className="text-xs font-semibold text-bw-heading flex-1 truncate">{team.team_name}</span>
              <span className="text-xs text-bw-muted tabular-nums">{team.students.length}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {team.students.map((s) => (
                <span key={s.id} className="text-xs" title={s.display_name}>{s.avatar}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── STUDENTS TAB CONTENT ──────────────────────────────────────

function StudentsContent({
  students = [],
  studentStates = [],
  onSelectStudent,
  onNudge,
  onWarn,
  selectedStudent,
  studentResponses,
}: ContextPanelProps) {
  const [nudgeStudentId, setNudgeStudentId] = useState<string | null>(null);
  const [nudgeText, setNudgeText] = useState("");

  function getState(studentId: string): StudentStateValue {
    return studentStates.find((s) => s.id === studentId)?.state || "disconnected";
  }

  const sortedStudents = [...students].sort((a, b) => {
    const order: Record<StudentStateValue, number> = { active: 0, stuck: 1, responded: 2, disconnected: 3 };
    return (order[getState(a.id)] ?? 4) - (order[getState(b.id)] ?? 4);
  });

  const respondedCount = studentStates.filter((s) => s.state === "responded").length;
  const stuckCount = studentStates.filter((s) => s.state === "stuck").length;

  // ── Student detail view ──
  if (selectedStudent) {
    const studentState = getState(selectedStudent.id);
    return (
      <div className="space-y-4">
        <button
          onClick={() => onSelectStudent(null)}
          className="text-xs text-bw-muted hover:text-white cursor-pointer transition-colors"
        >
          ← Retour
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xl">{selectedStudent.avatar}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{selectedStudent.display_name}</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATE_COLORS[studentState] }} />
                {STATE_LABELS[studentState]}
              </span>
              {selectedStudent.warnings > 0 && (
                <span className="text-bw-amber">{selectedStudent.warnings} avert.</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {onNudge && (
            <button
              onClick={() => {
                if (nudgeStudentId === selectedStudent.id) {
                  if (nudgeText.trim()) {
                    onNudge(selectedStudent.id, nudgeText.trim());
                    setNudgeStudentId(null);
                    setNudgeText("");
                    toast.success("Message envoyé");
                  }
                } else {
                  setNudgeStudentId(selectedStudent.id);
                  setNudgeText("");
                }
              }}
              className="flex-1 py-1.5 px-2 rounded-xl text-xs font-medium bg-bw-teal/10 text-bw-teal border border-bw-teal/20 cursor-pointer hover:border-bw-teal/40 transition-colors duration-200"
            >
              Envoyer un message
            </button>
          )}
          {onWarn && (
            <button
              onClick={() => onWarn(selectedStudent.id)}
              className="py-1.5 px-2 rounded-xl text-xs font-medium bg-bw-amber/10 text-bw-amber border border-bw-amber/20 cursor-pointer hover:border-bw-amber/40 transition-colors duration-200"
            >
              Avertir
            </button>
          )}
        </div>

        {nudgeStudentId === selectedStudent.id && onNudge && (
          <div className="space-y-1.5">
            <input
              type="text"
              value={nudgeText}
              onChange={(e) => setNudgeText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && nudgeText.trim()) {
                  onNudge(selectedStudent.id, nudgeText.trim());
                  setNudgeStudentId(null);
                  setNudgeText("");
                  toast.success("Message envoyé");
                }
              }}
              placeholder="Ton message..."
              autoFocus
              className="w-full px-2.5 py-1.5 rounded-xl bg-bw-surface border border-white/[0.06] text-xs text-white placeholder:text-bw-muted outline-none focus:border-bw-teal/40"
            />
            <div className="flex gap-1.5">
              <button
                onClick={() => {
                  if (nudgeText.trim()) {
                    onNudge(selectedStudent.id, nudgeText.trim());
                    setNudgeStudentId(null);
                    setNudgeText("");
                    toast.success("Message envoyé");
                  }
                }}
                disabled={!nudgeText.trim()}
                className="text-xs px-2 py-1 rounded bg-bw-teal text-black font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Envoyer
              </button>
              <button
                onClick={() => { setNudgeStudentId(null); setNudgeText(""); }}
                className="text-xs px-2 py-1 rounded text-bw-muted hover:text-white cursor-pointer"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-bw-muted font-semibold">
            Réponses ({studentResponses.length})
          </p>
          {studentResponses.length === 0 ? (
            <p className="text-xs text-bw-muted">Aucune réponse pour ce module</p>
          ) : (
            <div className="space-y-1.5">
              {studentResponses.map((r) => (
                <div
                  key={r.id}
                  className={`bg-bw-surface rounded-xl p-2.5 border text-xs leading-relaxed ${
                    r.is_hidden
                      ? "border-bw-amber/20 opacity-60"
                      : r.is_highlighted
                        ? "border-bw-teal/30"
                        : "border-white/[0.06]"
                  }`}
                >
                  <p className="text-bw-text">{r.text}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs text-bw-muted">
                      {new Date(r.submitted_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {r.is_hidden && <span className="text-xs text-bw-amber">Masquée</span>}
                    {r.is_highlighted && <span className="text-xs text-bw-teal">Mise en avant</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Student list ──
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">👥</span>
          <span className="text-xs font-semibold text-bw-heading">Élèves</span>
        </div>
        <div className="flex items-center gap-2">
          {stuckCount > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-bw-amber/10 text-bw-amber">
              {stuckCount} bloqué{stuckCount > 1 ? "s" : ""}
            </span>
          )}
          <span className="text-xs text-bw-teal font-medium tabular-nums">
            {respondedCount}/{students.length}
          </span>
        </div>
      </div>

      {sortedStudents.length > 0 ? (
        <div className="space-y-0.5">
          {sortedStudents.map((s) => {
            const state = getState(s.id);
            return (
              <button
                key={s.id}
                onClick={() => onSelectStudent(s)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl cursor-pointer transition-colors duration-200 hover:bg-white/[0.04] text-left"
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: STATE_COLORS[state] }}
                />
                <span className="text-sm flex-shrink-0">{s.avatar}</span>
                <span className="text-xs text-bw-text truncate flex-1">{s.display_name}</span>
                {state === "responded" && (
                  <span className="text-xs text-bw-teal font-medium flex-shrink-0">OK</span>
                )}
                {state === "stuck" && (
                  <span className="text-xs text-bw-amber flex-shrink-0">bloqué</span>
                )}
                {s.warnings > 0 && (
                  <span className="text-xs text-bw-amber flex-shrink-0">{s.warnings}</span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-bw-muted text-center py-4">Aucun élève connecté</p>
      )}
    </div>
  );
}

// ─── RESPONSE RHYTHM ───────────────────────────────────────────

function ResponseRhythm({ responses }: { responses: Response[] }) {
  const now = Date.now();
  const twoMinsAgo = now - 120_000;
  const buckets = [0, 0, 0, 0];
  for (const r of responses) {
    const t = new Date(r.submitted_at).getTime();
    if (t < twoMinsAgo) continue;
    const bucket = Math.min(3, Math.floor((now - t) / 30000));
    buckets[3 - bucket]++;
  }
  const max = Math.max(1, ...buckets);
  const labels = ["-2m", "-1m30", "-1m", "-30s"];

  return (
    <div className="flex items-end gap-1 h-8">
      {buckets.map((count, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
          <div
            className="w-full rounded-sm bg-bw-teal/40 transition-all duration-300"
            style={{ height: `${Math.max(2, (count / max) * 24)}px` }}
          />
          <span className="text-xs text-bw-muted">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

// ─── LEGACY EXPORT (for mobile drawer) ─────────────────────────

export function ContextPanel(props: ContextPanelProps) {
  const [alertsExpanded, setAlertsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"guide" | "students" | "stats">("guide");
  const [nudgeStudentId, setNudgeStudentId] = useState<string | null>(null);
  const [nudgeText, setNudgeText] = useState("");
  const pct = props.totalStudents > 0 ? Math.round((props.responsesCount / props.totalStudents) * 100) : 0;
  const highlightedCount = props.studentResponses.filter((r) => r.is_highlighted).length || 0;

  function getState(studentId: string): StudentStateValue {
    return (props.studentStates || []).find((s) => s.id === studentId)?.state || "disconnected";
  }

  const sortedStudents = [...(props.students || [])].sort((a, b) => {
    const order: Record<StudentStateValue, number> = { active: 0, stuck: 1, responded: 2, disconnected: 3 };
    return (order[getState(a.id)] ?? 4) - (order[getState(b.id)] ?? 4);
  });

  const respondedStudentCount = (props.studentStates || []).filter((s) => s.state === "responded").length;

  if (props.selectedStudent) {
    const studentState = getState(props.selectedStudent.id);
    return (
      <aside className="w-full flex flex-col h-full flex-shrink-0">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.06] flex-shrink-0">
          <button onClick={() => props.onSelectStudent(null)} className="text-xs text-bw-muted hover:text-white cursor-pointer transition-colors">← Retour</button>
          <button onClick={props.onClose} className="text-xs text-bw-muted hover:text-white cursor-pointer transition-colors">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{props.selectedStudent.avatar}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{props.selectedStudent.display_name}</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATE_COLORS[studentState] }} />
                  {STATE_LABELS[studentState]}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {props.onNudge && (
              <button
                onClick={() => {
                  if (nudgeStudentId === props.selectedStudent!.id) {
                    if (nudgeText.trim()) { props.onNudge!(props.selectedStudent!.id, nudgeText.trim()); setNudgeStudentId(null); setNudgeText(""); toast.success("Message envoyé"); }
                  } else { setNudgeStudentId(props.selectedStudent!.id); setNudgeText(""); }
                }}
                className="flex-1 py-1.5 px-2 rounded-xl text-xs font-medium bg-bw-teal/10 text-bw-teal border border-bw-teal/20 cursor-pointer"
              >Envoyer un message</button>
            )}
            {props.onWarn && (
              <button onClick={() => props.onWarn!(props.selectedStudent!.id)}
                className="py-1.5 px-2 rounded-xl text-xs font-medium bg-bw-amber/10 text-bw-amber border border-bw-amber/20 cursor-pointer"
              >Avertir</button>
            )}
          </div>
          {nudgeStudentId === props.selectedStudent.id && props.onNudge && (
            <div className="space-y-1.5">
              <input type="text" value={nudgeText} onChange={(e) => setNudgeText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && nudgeText.trim()) { props.onNudge!(props.selectedStudent!.id, nudgeText.trim()); setNudgeStudentId(null); setNudgeText(""); toast.success("Message envoyé"); } }}
                placeholder="Ton message..." autoFocus
                className="w-full px-2.5 py-1.5 rounded-xl bg-bw-surface border border-white/[0.06] text-xs text-white placeholder:text-bw-muted outline-none focus:border-bw-teal/40" />
              <div className="flex gap-1.5">
                <button onClick={() => { if (nudgeText.trim()) { props.onNudge!(props.selectedStudent!.id, nudgeText.trim()); setNudgeStudentId(null); setNudgeText(""); toast.success("Message envoyé"); } }}
                  disabled={!nudgeText.trim()} className="text-xs px-2 py-1 rounded bg-bw-teal text-black font-medium cursor-pointer disabled:opacity-40">Envoyer</button>
                <button onClick={() => { setNudgeStudentId(null); setNudgeText(""); }} className="text-xs px-2 py-1 rounded text-bw-muted hover:text-white cursor-pointer">Annuler</button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-bw-muted font-semibold">Réponses ({props.studentResponses.length})</p>
            {props.studentResponses.length === 0 ? (
              <p className="text-xs text-bw-muted">Aucune réponse pour ce module</p>
            ) : (
              <div className="space-y-1.5">
                {props.studentResponses.map((r) => (
                  <div key={r.id} className={`bg-bw-surface rounded-xl p-2.5 border text-xs leading-relaxed ${r.is_hidden ? "border-bw-amber/20 opacity-60" : r.is_highlighted ? "border-bw-teal/30" : "border-white/[0.06]"}`}>
                    <p className="text-bw-text">{r.text}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-bw-muted">{new Date(r.submitted_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                      {r.is_hidden && <span className="text-xs text-bw-amber">Masquée</span>}
                      {r.is_highlighted && <span className="text-xs text-bw-teal">Mise en avant</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full flex flex-col h-full flex-shrink-0">
      <div className="border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-0.5">
            {([
              { id: "guide" as const, label: "Guide", icon: "📖", activeColor: "#FF6B35" },
              { id: "students" as const, label: "Élèves", icon: "👥", activeColor: "#4ECDC4" },
              { id: "stats" as const, label: "Stats", icon: "📊", activeColor: "#8B5CF6" },
            ]).map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all duration-200 ${activeTab === tab.id ? "text-white" : "text-bw-muted hover:text-bw-text hover:bg-white/[0.04]"}`}
                style={activeTab === tab.id ? { background: `${tab.activeColor}15`, color: tab.activeColor } : undefined}>
                <span className="mr-0.5">{tab.icon}</span>{tab.label}
              </button>
            ))}
          </div>
          <button onClick={props.onClose} className="text-xs text-bw-muted hover:text-white cursor-pointer transition-colors ml-1">✕</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {activeTab === "guide" && <GuideContent {...props} />}
        {activeTab === "students" && <StudentsContent {...props} />}
        {activeTab === "stats" && (
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-wider text-bw-muted font-semibold">Stats live</p>
            <div className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: "linear-gradient(135deg, rgba(78,205,196,0.06), transparent)" }}>
              <div className="relative w-14 h-14 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(78,205,196,0.1)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${pct * 0.974} 100`} className="transition-all duration-500" style={{ stroke: pct === 100 ? "#10B981" : "#4ECDC4" }} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold tabular-nums" style={{ color: pct === 100 ? "#10B981" : "#4ECDC4" }}>{pct}%</span>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-bw-text">{props.responsesCount}/{props.totalStudents} réponses</p>
                <p className="text-xs text-bw-muted">{props.totalStudents - props.responsesCount} en attente</p>
              </div>
            </div>
            <div className="h-1.5 bg-bw-elevated rounded-full overflow-hidden">
              <div className="h-full bg-bw-teal rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {props.hiddenCount > 0 && <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-bw-amber/10 text-bw-amber">{props.hiddenCount} masquée{props.hiddenCount !== 1 ? "s" : ""}</span>}
              {props.sessionStatus === "responding" && props.voteOptionCount > 0 && <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-bw-primary/10 text-bw-primary">{props.voteOptionCount} sélectionnée{props.voteOptionCount !== 1 ? "s" : ""}</span>}
              {highlightedCount > 0 && <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-bw-teal/10 text-bw-teal">{highlightedCount} mise{highlightedCount !== 1 ? "s" : ""} en avant</span>}
            </div>
            <div className="space-y-1.5">
              <p className="text-xs uppercase tracking-wider text-bw-muted font-semibold">Rythme d&apos;arrivée</p>
              <ResponseRhythm responses={props.studentResponses} />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
