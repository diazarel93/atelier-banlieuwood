"use client";

import { motion } from "motion/react";

interface PlusMenuContentProps {
  // Stimulation
  onNudge: () => void;
  onBroadcast: () => void;
  onHint: () => void;
  onExample: () => void;

  // Interaction
  onDebate: () => void;
  onFreeQuestion: () => void;
  onWordCloud: () => void;
  onCompare: () => void;

  // Analyse
  onExport: () => void;
  onShortcuts: () => void;

  // Contrôles
  autoAdvance: boolean;
  onToggleAutoAdvance: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;

  // Timer
  onSetTimer: (seconds: number) => void;
  onClearTimer: () => void;
  timerActive: boolean;

  // Screen controls
  onSetScreenMode?: (mode: string) => void;
  onToggleFreeze?: () => void;
  currentScreenMode?: string;
  screenFrozen?: boolean;

  // Remote mode
  onToggleRemote?: () => void;

  // Close
  onClose: () => void;
}

function MenuItem({
  icon,
  label,
  onClick,
  variant = "default",
}: {
  icon: string;
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl transition-colors cursor-pointer ${
        variant === "danger" ? "bg-red-50 hover:bg-red-100 text-red-600" : "bg-gray-50 hover:bg-gray-100 text-gray-700"
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-body-xs font-medium leading-tight text-center">{label}</span>
    </motion.button>
  );
}

function ToggleItem({
  icon,
  label,
  active,
  onToggle,
}: {
  icon: string;
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-body-sm font-medium text-gray-800">{label}</span>
      </div>
      <div className={`w-10 h-6 rounded-full transition-colors relative ${active ? "bg-emerald-500" : "bg-gray-300"}`}>
        <div
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-[#f0f0f8] shadow transition-transform ${active ? "translate-x-4" : "translate-x-0.5"}`}
        />
      </div>
    </button>
  );
}

export function PlusMenuContent({
  onNudge,
  onBroadcast,
  onHint,
  onExample,
  onDebate,
  onFreeQuestion,
  onWordCloud,
  onCompare,
  onExport,
  onShortcuts,
  autoAdvance,
  onToggleAutoAdvance,
  isDarkMode,
  onToggleDarkMode,
  onSetTimer,
  onClearTimer,
  timerActive,
  onSetScreenMode,
  onToggleFreeze,
  currentScreenMode,
  screenFrozen,
  onToggleRemote,
  onClose,
}: PlusMenuContentProps) {
  function doAndClose(fn: () => void) {
    fn();
    onClose();
  }

  return (
    <div className="space-y-5">
      {/* Stimulation */}
      <div>
        <h4 className="text-body-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Stimulation</h4>
        <div className="grid grid-cols-4 gap-2">
          <MenuItem icon="💡" label="Indice" onClick={() => doAndClose(onHint)} />
          <MenuItem icon="🚀" label="Relancer" onClick={() => doAndClose(onNudge)} />
          <MenuItem icon="📝" label="Exemple" onClick={() => doAndClose(onExample)} />
          <MenuItem icon="📢" label="Message" onClick={() => doAndClose(onBroadcast)} />
        </div>
      </div>

      {/* Interaction */}
      <div>
        <h4 className="text-body-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Interaction</h4>
        <div className="grid grid-cols-4 gap-2">
          <MenuItem icon="💬" label="Débat" onClick={() => doAndClose(onDebate)} />
          <MenuItem icon="❓" label="Q. libre" onClick={() => doAndClose(onFreeQuestion)} />
          <MenuItem icon="☁️" label="Nuage" onClick={() => doAndClose(onWordCloud)} />
          <MenuItem icon="📊" label="Comparer" onClick={() => doAndClose(onCompare)} />
        </div>
      </div>

      {/* Analyse */}
      <div>
        <h4 className="text-body-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Analyse</h4>
        <div className="grid grid-cols-4 gap-2">
          <MenuItem icon="📋" label="Export" onClick={() => doAndClose(onExport)} />
          <MenuItem icon="⌨️" label="Raccourcis" onClick={() => doAndClose(onShortcuts)} />
        </div>
      </div>

      {/* Contrôles */}
      <div>
        <h4 className="text-body-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contrôles</h4>
        <div className="space-y-2">
          <ToggleItem icon="⚡" label="Auto-avance" active={autoAdvance} onToggle={onToggleAutoAdvance} />
          <ToggleItem icon="🌙" label="Mode sombre" active={isDarkMode} onToggle={onToggleDarkMode} />
          {onToggleRemote && <MenuItem icon="📱" label="Mode tablette" onClick={() => doAndClose(onToggleRemote)} />}
        </div>
      </div>

      {/* Écran projeté */}
      {onSetScreenMode && (
        <div>
          <h4 className="text-body-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Écran projeté</h4>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {(
              [
                { mode: "default", icon: "📋", label: "Question" },
                { mode: "responses", icon: "💬", label: "Réponses" },
                { mode: "spotlight", icon: "🔦", label: "Spotlight" },
                { mode: "wordcloud", icon: "☁️", label: "Nuage" },
                { mode: "blank", icon: "⬛", label: "Noir" },
              ] as const
            ).map(({ mode, icon, label }) => (
              <motion.button
                key={mode}
                onClick={() => doAndClose(() => onSetScreenMode(mode))}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl transition-colors cursor-pointer ${
                  (currentScreenMode || "default") === mode
                    ? "bg-orange-100 text-orange-700 ring-1 ring-orange-300"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                }`}
              >
                <span className="text-xl">{icon}</span>
                <span className="text-body-xs font-medium leading-tight text-center">{label}</span>
              </motion.button>
            ))}
          </div>
          {onToggleFreeze && (
            <ToggleItem icon="❄️" label="Geler l'écran" active={!!screenFrozen} onToggle={onToggleFreeze} />
          )}
        </div>
      )}

      {/* Timer */}
      <div>
        <h4 className="text-body-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Timer</h4>
        <div className="flex items-center gap-2">
          {[30, 60, 90].map((s) => (
            <button
              key={s}
              onClick={() => doAndClose(() => onSetTimer(s))}
              className="flex-1 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 text-body-sm font-bold text-gray-700 transition-colors cursor-pointer"
            >
              {s}s
            </button>
          ))}
          {timerActive && (
            <button
              onClick={() => doAndClose(onClearTimer)}
              className="flex-1 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-body-sm font-bold text-red-600 transition-colors cursor-pointer"
            >
              Stop
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
