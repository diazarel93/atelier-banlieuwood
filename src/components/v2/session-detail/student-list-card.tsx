"use client";

import { GlassCardV2 } from "@/components/v2/glass-card";
import { DEMO_STUDENT_NAMES } from "@/lib/demo-data";
import type { UseMutationResult } from "@tanstack/react-query";

interface Student {
  id: string;
  display_name: string;
  avatar: string;
  is_active: boolean;
}

interface StudentListCardProps {
  activeStudents: Student[];
  demoStudents: Student[];
  realStudents: Student[];
  hasDemoStudents: boolean;
  activateDemo: UseMutationResult<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    Error,
    void,
    unknown
  >;
  deactivateDemo: UseMutationResult<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    Error,
    void,
    unknown
  >;
}

export function StudentListCard({
  activeStudents,
  demoStudents,
  realStudents,
  hasDemoStudents,
  activateDemo,
  deactivateDemo,
}: StudentListCardProps) {
  return (
    <GlassCardV2 className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <p className="text-sm font-semibold text-bw-heading uppercase tracking-wide">Élèves</p>
        <span className="text-xs font-bold text-bw-muted bg-[var(--color-bw-surface-dim)] px-2 py-0.5 rounded-full">
          {activeStudents.length}
        </span>
        {hasDemoStudents && (
          <span className="text-xs font-medium text-bw-violet bg-bw-violet-100 px-2 py-0.5 rounded-full">
            Mode démo
          </span>
        )}
      </div>

      {activeStudents.length === 0 ? (
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-full bg-bw-primary/10 mx-auto flex items-center justify-center mb-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-bw-primary)"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <p className="text-sm text-bw-muted">En attente des élèves...</p>
          <p className="text-xs text-bw-muted mt-1">Partagez le code pour commencer</p>
          <button
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-bw-violet-200 px-3 py-1.5 text-xs font-medium text-bw-violet hover:bg-bw-violet-50 transition-colors cursor-pointer disabled:opacity-50"
            disabled={activateDemo.isPending}
            aria-label={activateDemo.isPending ? "Chargement des élèves virtuels" : "Tester en mode démo"}
            onClick={() => activateDemo.mutate()}
          >
            {activateDemo.isPending ? (
              <span
                className="inline-block w-3.5 h-3.5 border-2 border-bw-violet border-t-transparent rounded-full animate-spin"
                aria-hidden="true"
              />
            ) : (
              <span aria-hidden="true">🎮</span>
            )}
            Tester en mode démo
          </button>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {activeStudents.map((s) => {
            const isDemo = DEMO_STUDENT_NAMES.includes(s.display_name);
            return (
              <div
                key={s.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                  isDemo
                    ? "bg-bw-violet-50 border border-bw-violet-200"
                    : "bg-[var(--color-bw-surface-dim)] border border-[var(--color-bw-border-subtle)]"
                }`}
              >
                <span className="text-lg">{s.avatar}</span>
                <span className="text-sm font-medium text-bw-heading">{s.display_name}</span>
                {isDemo && <span className="text-[10px] text-bw-violet font-medium">virtuel</span>}
                <span
                  className={`ml-auto w-2 h-2 rounded-full animate-pulse ${isDemo ? "bg-bw-violet" : "bg-bw-teal"}`}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Demo actions below list */}
      {hasDemoStudents && (
        <div className="mt-4 pt-3 border-t border-[var(--color-bw-border)] flex items-center justify-between">
          <span className="text-xs text-bw-muted">
            {demoStudents.length} virtuel{demoStudents.length > 1 ? "s" : ""}
            {realStudents.length > 0 && ` + ${realStudents.length} réel${realStudents.length > 1 ? "s" : ""}`}
          </span>
          <button
            className="text-xs font-medium text-bw-danger hover:bg-bw-danger-100 px-2 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            disabled={deactivateDemo.isPending}
            onClick={() => deactivateDemo.mutate()}
          >
            {deactivateDemo.isPending ? "Suppression..." : "Supprimer les démos"}
          </button>
        </div>
      )}

      {/* Add demos when real students exist but no demo yet */}
      {!hasDemoStudents && activeStudents.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[var(--color-bw-border)]">
          <button
            className="w-full text-xs font-medium text-bw-violet hover:text-bw-violet-500 hover:bg-bw-violet-50 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            disabled={activateDemo.isPending}
            onClick={() => activateDemo.mutate()}
          >
            <span aria-hidden="true">🎮</span> {activateDemo.isPending ? "Ajout..." : "Ajouter des élèves virtuels"}
          </button>
        </div>
      )}
    </GlassCardV2>
  );
}
