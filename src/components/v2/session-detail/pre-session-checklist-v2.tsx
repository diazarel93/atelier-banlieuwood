"use client";

import { useState, useMemo } from "react";

interface PreSessionChecklistV2Props {
  connectedCount: number;
  moduleSelected: boolean;
  moduleName?: string;
  joinCode: string;
  onDismiss: () => void;
}

interface ChecklistItem {
  id: string;
  label: string;
  tip?: string;
  checked: boolean;
  statusText: string;
}

export function PreSessionChecklistV2({
  connectedCount,
  moduleSelected,
  moduleName,
  joinCode,
  onDismiss,
}: PreSessionChecklistV2Props) {
  const [projectorChecked, setProjectorChecked] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const items: ChecklistItem[] = useMemo(
    () => [
      {
        id: "projector",
        label: "Projecteur branché",
        tip: "Ouvrez l'écran projection dans un 2e onglet",
        checked: projectorChecked,
        statusText: projectorChecked ? "Prêt" : "À vérifier",
      },
      {
        id: "students",
        label: "Élèves connectés",
        checked: connectedCount >= 3,
        statusText:
          connectedCount >= 3
            ? `${connectedCount} élèves en ligne`
            : `${connectedCount}/3 minimum`,
      },
      {
        id: "code",
        label: "Code partagé",
        checked: true,
        statusText: joinCode,
      },
      {
        id: "module",
        label: "Module choisi",
        checked: moduleSelected,
        statusText: moduleSelected
          ? moduleName || "Module sélectionné"
          : "Aucun module sélectionné",
      },
    ],
    [projectorChecked, connectedCount, joinCode, moduleSelected, moduleName]
  );

  const checkedCount = items.filter((i) => i.checked).length;
  const allChecked = checkedCount === items.length;

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        aria-label="Ouvrir la check-list pré-séance"
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg cursor-pointer transition-colors ${
          allChecked
            ? "bg-emerald-500 text-white"
            : "bg-card border border-[var(--color-bw-border)] text-bw-heading"
        }`}
      >
        <span className="text-sm">{allChecked ? "✅" : "📋"}</span>
        <span className="text-xs font-bold tabular-nums">
          {checkedCount}/{items.length}
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[340px]">
      <div className="bg-card rounded-2xl border border-[var(--color-bw-border)] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">📋</span>
            <h3 className="text-sm font-bold text-bw-heading">
              Check-list pré-séance
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMinimized(true)}
              aria-label="Minimiser la check-list"
              className="p-1.5 rounded-lg text-bw-muted hover:text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-all cursor-pointer"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <button
              onClick={onDismiss}
              aria-label="Fermer la check-list"
              className="p-1.5 rounded-lg text-bw-muted hover:text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-all cursor-pointer"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-5 pb-3">
          <div className="h-1 rounded-full bg-[var(--color-bw-surface-dim)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(checkedCount / items.length) * 100}%`,
                backgroundColor: allChecked ? "#10B981" : "#FF6B35",
              }}
            />
          </div>
        </div>

        {/* Items */}
        <div className="px-4 pb-2 space-y-1">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--color-bw-surface-dim)] transition-colors"
            >
              {/* Checkbox */}
              {item.id === "projector" ? (
                <button
                  onClick={() => setProjectorChecked((v) => !v)}
                  className="mt-0.5 shrink-0 cursor-pointer"
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                      projectorChecked
                        ? "bg-emerald-500"
                        : "border-2 border-gray-300"
                    }`}
                  >
                    {projectorChecked && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </button>
              ) : (
                <div className="mt-0.5 shrink-0">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                      item.checked
                        ? "bg-emerald-500"
                        : "border-2 border-gray-300"
                    }`}
                  >
                    {item.checked && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p
                  className={`text-[13px] font-medium leading-tight ${
                    item.checked ? "text-bw-heading" : "text-bw-muted"
                  }`}
                >
                  {item.label}
                </p>
                <p
                  className={`text-xs mt-0.5 ${
                    item.checked ? "text-emerald-600" : "text-amber-500"
                  }`}
                >
                  {item.statusText}
                </p>
                {item.tip && !item.checked && (
                  <p className="text-xs text-bw-muted mt-0.5 italic">
                    {item.tip}
                  </p>
                )}
              </div>

              <div className="mt-1.5 shrink-0">
                <div
                  className={`w-2 h-2 rounded-full ${
                    item.checked ? "bg-emerald-500" : "bg-amber-400"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Launch button */}
        <div className="px-5 pb-5 pt-2">
          <button
            onClick={allChecked ? onDismiss : undefined}
            disabled={!allChecked}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[13px] font-bold transition-all cursor-pointer disabled:cursor-not-allowed ${
              allChecked
                ? "bg-bw-primary text-white hover:bg-bw-primary-500 btn-glow"
                : "bg-[var(--color-bw-surface-dim)] text-bw-muted"
            }`}
          >
            {allChecked
              ? "C'est parti !"
              : `${checkedCount}/${items.length} — Encore un effort`}
          </button>
        </div>
      </div>
    </div>
  );
}
