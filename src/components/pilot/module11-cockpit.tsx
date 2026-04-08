"use client";

import { motion } from "motion/react";
import type { Module11Data } from "@/hooks/use-session-polling";

const THEME_COLORS: Record<string, string> = {
  raconter: "var(--color-bw-violet)",
  émotion: "#EC4899",
  héros: "var(--color-bw-primary)",
  coulisses: "#06B6D4",
};

const THEME_LABELS: Record<string, string> = {
  raconter: "L'Art de Raconter",
  émotion: "Émotions à l'Écran",
  héros: "Héros & Anti-Héros",
  coulisses: "Les Coulisses",
};

const TYPE_ICONS: Record<string, string> = {
  citation: "💬",
  scene: "🎬",
  poster: "🖼️",
  debat: "⚔️",
};

interface Module11CockpitProps {
  module11Data: Module11Data;
  isPreviewing: boolean;
}

export function Module11Cockpit({ module11Data, isPreviewing }: Module11CockpitProps) {
  const themeColor = THEME_COLORS[module11Data.theme] || "var(--color-bw-primary)";
  const themeLabel = THEME_LABELS[module11Data.theme] || module11Data.theme;

  if (isPreviewing) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm space-y-4"
    >
      {/* Theme + type badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-body-xs font-bold text-white"
          style={{ backgroundColor: themeColor }}
        >
          {themeLabel}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-body-xs font-medium bg-gray-100 text-gray-600">
          {TYPE_ICONS[module11Data.type]}{" "}
          {module11Data.type === "citation"
            ? "Citation"
            : module11Data.type === "scene"
              ? "Extrait"
              : module11Data.type === "poster"
                ? "Affiche"
                : "Débat"}
        </span>
      </div>

      {/* Citation display */}
      {module11Data.type === "citation" && (
        <div className="space-y-3">
          <div className="relative px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
            <span className="absolute top-1 left-2 text-2xl opacity-20" style={{ color: themeColor }}>
              &ldquo;
            </span>
            <p className="text-body-md font-medium text-gray-900 italic pl-4 leading-relaxed">{module11Data.text}</p>
          </div>
          {module11Data.author && (
            <div className="flex items-center gap-3">
              {module11Data.authorImageUrl && (
                <img
                  src={module11Data.authorImageUrl}
                  alt={module11Data.author}
                  className="w-10 h-10 rounded-full object-cover border-2"
                  style={{ borderColor: themeColor }}
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-body-sm font-bold text-gray-900">{module11Data.author}</p>
                {module11Data.authorRole && <p className="text-body-xs text-gray-500">{module11Data.authorRole}</p>}
              </div>
            </div>
          )}
          {module11Data.filmography && module11Data.filmography.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {module11Data.filmography.map((film) => (
                <div key={film.title} className="flex-shrink-0 text-center">
                  <img
                    src={`https://image.tmdb.org/t/p/w92${film.posterPath}`}
                    alt={film.title}
                    className="w-12 h-18 rounded-lg object-cover"
                  />
                  <p className="text-[9px] text-gray-500 mt-0.5 max-w-[48px] truncate">{film.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Scene (video) display */}
      {module11Data.type === "scene" && (
        <div className="space-y-2">
          {module11Data.videoId && (
            <div className="aspect-video rounded-xl overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${module11Data.videoId}?rel=0&modestbranding=1${module11Data.videoStart ? `&start=${module11Data.videoStart}` : ""}${module11Data.videoEnd ? `&end=${module11Data.videoEnd}` : ""}`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                allowFullScreen
              />
            </div>
          )}
          {module11Data.sourceTitle && (
            <p className="text-body-xs text-gray-500 text-center">
              {module11Data.sourceTitle} {module11Data.sourceYear ? `(${module11Data.sourceYear})` : ""}
            </p>
          )}
        </div>
      )}

      {/* Poster display */}
      {module11Data.type === "poster" && (
        <div className="space-y-2">
          {module11Data.imageUrl && (
            <div className="flex justify-center">
              <img
                src={module11Data.imageUrl}
                alt={module11Data.sourceTitle || "Affiche"}
                className="max-h-[200px] rounded-xl object-contain"
              />
            </div>
          )}
          {module11Data.sourceTitle && (
            <p className="text-body-xs text-gray-500 text-center">
              {module11Data.sourceTitle} {module11Data.sourceYear ? `(${module11Data.sourceYear})` : ""}
            </p>
          )}
          <p className="text-body-sm text-gray-700 leading-relaxed">{module11Data.text}</p>
        </div>
      )}

      {/* Debate display */}
      {module11Data.type === "debat" && (
        <div className="space-y-3">
          <div className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-body-md font-medium text-gray-900 italic leading-relaxed">{module11Data.text}</p>
          </div>
          {module11Data.debatOptions && (
            <div className="flex gap-2">
              {module11Data.debatOptions.map((opt) => (
                <span
                  key={opt.key}
                  className="px-2.5 py-1 rounded-full text-body-xs font-medium bg-gray-100 text-gray-600"
                >
                  {opt.key === "daccord" ? "👍" : opt.key === "pasdaccord" ? "👎" : "🤔"} {opt.label}
                </span>
              ))}
            </div>
          )}
          <p className="text-body-xs text-gray-400">Les eleves choisissent leur position puis justifient.</p>
        </div>
      )}
    </motion.div>
  );
}
