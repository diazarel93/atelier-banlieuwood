"use client";

import { GlassCardV2 } from "@/components/v2/glass-card";
import type { BibleData } from "@/hooks/use-results-data";

interface BibleFilmSectionProps {
  bible: BibleData | null;
  loading: boolean;
  provider: string | null;
  onGenerate: (force?: boolean) => void;
}

export function BibleFilmSection({
  bible,
  loading,
  provider,
  onGenerate,
}: BibleFilmSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-bw-heading uppercase tracking-wide">
          Bible du film
        </h3>
        {!bible && !loading && (
          <button
            onClick={() => onGenerate(false)}
            className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700 transition-colors cursor-pointer"
          >
            Générer la Bible
          </button>
        )}
        {bible && (
          <button
            onClick={() => onGenerate(true)}
            className="text-xs text-bw-muted hover:text-bw-heading transition-colors cursor-pointer"
          >
            Régénérer
          </button>
        )}
      </div>

      {loading && (
        <GlassCardV2 className="py-8 text-center">
          <div className="inline-block w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-sm text-bw-muted">
            Génération de la Bible du Film...
          </p>
        </GlassCardV2>
      )}

      {bible && (
        <div className="grid gap-4">
          {/* Logline */}
          <GlassCardV2 className="p-5 border-l-4 border-l-bw-primary">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-bw-primary">
              Logline
            </span>
            <p className="text-sm font-medium text-bw-heading italic mt-1">
              &ldquo;{bible.logline}&rdquo;
            </p>
          </GlassCardV2>

          {/* Synopsis */}
          <GlassCardV2 className="p-5">
            <p className="text-xs font-semibold text-bw-heading uppercase tracking-wide mb-2">
              Synopsis
            </p>
            <p className="text-sm text-bw-heading leading-relaxed">
              {bible.synopsis}
            </p>
          </GlassCardV2>

          {/* Characters */}
          {bible.characters && bible.characters.length > 0 && (
            <GlassCardV2 className="p-5">
              <p className="text-xs font-semibold text-bw-heading uppercase tracking-wide mb-3">
                Personnages
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {bible.characters.map((c, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-[var(--color-bw-surface-dim)] p-3 border border-[var(--color-bw-border)]"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-bw-heading">
                        {c.name}
                      </span>
                      <span className="text-xs rounded-md bg-card px-1.5 py-0.5 text-bw-muted border border-[var(--color-bw-border)]">
                        {c.role}
                      </span>
                    </div>
                    <p className="text-xs text-bw-heading mb-1">
                      {c.description}
                    </p>
                    <p className="text-xs text-bw-muted italic">
                      Arc : {c.arc}
                    </p>
                  </div>
                ))}
              </div>
            </GlassCardV2>
          )}

          {/* World */}
          <GlassCardV2 className="p-5 space-y-2">
            <p className="text-xs font-semibold text-bw-heading uppercase tracking-wide">
              Univers
            </p>
            <div>
              <span className="text-xs font-bold text-purple-600 uppercase">
                Lieu & Époque
              </span>
              <p className="text-sm text-bw-heading">
                {bible.world.setting}
              </p>
            </div>
            <div>
              <span className="text-xs font-bold text-purple-600 uppercase">
                Ambiance
              </span>
              <p className="text-sm text-bw-heading">
                {bible.world.atmosphere}
              </p>
            </div>
            {bible.world.rules && (
              <div>
                <span className="text-xs font-bold text-purple-600 uppercase">
                  Règles
                </span>
                <p className="text-sm text-bw-heading">
                  {bible.world.rules}
                </p>
              </div>
            )}
          </GlassCardV2>

          {/* Conflict */}
          <GlassCardV2 className="p-5 border-l-4 border-l-red-400 space-y-2">
            <p className="text-xs font-semibold text-bw-heading uppercase tracking-wide">
              Conflit central
            </p>
            <p className="text-sm text-bw-heading">{bible.conflict.central}</p>
            <div className="flex gap-4 text-xs">
              <span>
                <span className="font-bold text-amber-500">Enjeux : </span>
                <span className="text-bw-heading">
                  {bible.conflict.stakes}
                </span>
              </span>
            </div>
            <p className="text-xs text-bw-muted">
              {bible.conflict.antagonist}
            </p>
          </GlassCardV2>

          {/* 3-Act Structure */}
          <GlassCardV2 className="p-5">
            <p className="text-xs font-semibold text-bw-heading uppercase tracking-wide mb-3">
              Structure en 3 actes
            </p>
            <div className="space-y-3">
              {(["act1", "act2", "act3"] as const).map((act, i) => (
                <div key={act} className="flex gap-3">
                  <div className="shrink-0 w-7 h-7 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-xs font-bold text-purple-600">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-bw-muted uppercase mb-0.5">
                      {i === 0
                        ? "Exposition"
                        : i === 1
                        ? "Confrontation"
                        : "Résolution"}
                    </p>
                    <p className="text-sm text-bw-heading">
                      {bible.structure[act]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCardV2>

          {/* Style & Themes */}
          <div className="grid gap-4 sm:grid-cols-2">
            <GlassCardV2 className="p-5 space-y-2">
              <p className="text-xs font-semibold text-bw-heading uppercase tracking-wide">
                Style
              </p>
              <div>
                <span className="text-xs font-bold text-purple-600 uppercase">
                  Genre
                </span>
                <p className="text-sm text-bw-heading">{bible.style.genre}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-purple-600 uppercase">
                  Ton
                </span>
                <p className="text-sm text-bw-heading">{bible.style.tone}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-purple-600 uppercase">
                  Identité visuelle
                </span>
                <p className="text-sm text-bw-heading">
                  {bible.style.visualIdentity}
                </p>
              </div>
              {bible.style.influences && bible.style.influences.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-purple-600 uppercase">
                    Influences
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {bible.style.influences.map((inf, i) => (
                      <span
                        key={i}
                        className="text-xs rounded-md bg-[var(--color-bw-surface-dim)] px-1.5 py-0.5 text-bw-muted"
                      >
                        {inf}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </GlassCardV2>
            <GlassCardV2 className="p-5">
              <p className="text-xs font-semibold text-bw-heading uppercase tracking-wide mb-2">
                Thèmes
              </p>
              <div className="flex flex-wrap gap-1.5">
                {bible.themes?.map((t, i) => (
                  <span
                    key={i}
                    className="text-xs rounded-md bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-emerald-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </GlassCardV2>
          </div>

          {provider && (
            <p className="text-xs text-bw-muted text-right">
              Généré par{" "}
              {provider === "fallback" ? "algorithme" : provider}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
