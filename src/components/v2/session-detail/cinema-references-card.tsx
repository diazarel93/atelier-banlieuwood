"use client";

import Image from "next/image";
import { GlassCardV2 } from "@/components/v2/glass-card";

const TMDB_IMG = "https://image.tmdb.org/t/p";

const CINEMA_REFS = [
  {
    title: "La Haine",
    year: 1995,
    director: "Kassovitz",
    theme: "Tension sociale",
    color: "#EF4444",
    poster: "/gfdhSzPyAWtAizqs4ytc0MwOlQg.jpg",
  },
  {
    title: "Les Misérables",
    year: 2019,
    director: "Ladj Ly",
    theme: "Banlieue & regard",
    color: "#FF6B35",
    poster: "/sOy9Sa9Noro1VjZjdTTh7U3XmcU.jpg",
  },
  {
    title: "Divines",
    year: 2016,
    director: "Houda Benyamina",
    theme: "Rêves de grandeur",
    color: "#8B5CF6",
    poster: "/6P12dmdR0XFXXOPx1HsI8kT6yMX.jpg",
  },
  {
    title: "Intouchables",
    year: 2011,
    director: "Nakache & Toledano",
    theme: "Amitié inattendue",
    color: "#4ECDC4",
    poster: "/i97FM40bOMKvKIo3hjQviETE5yf.jpg",
  },
  {
    title: "Les 400 Coups",
    year: 1959,
    director: "Truffaut",
    theme: "Enfance & liberté",
    color: "#F59E0B",
    poster: "/nHZQrKd96pCytnuTCsFibhrRyIR.jpg",
  },
  {
    title: "La Graine et le Mulet",
    year: 2007,
    director: "Kechiche",
    theme: "Famille & persévérance",
    color: "#10B981",
    poster: "/fqEJAEiFlo8flo5AQMeLLP5Rmno.jpg",
  },
  {
    title: "Bande de filles",
    year: 2014,
    director: "Sciamma",
    theme: "Identité & sororité",
    color: "#EC4899",
    poster: "/nFHw4N7eEpbXwFkUH61P0zs1FTm.jpg",
  },
  {
    title: "Caché",
    year: 2005,
    director: "Haneke",
    theme: "Secrets & culpabilité",
    color: "#6366F1",
    poster: "/vSIGVNCLDnw1NYH8mgSrxC5jYQn.jpg",
  },
];

export function CinemaReferencesCard() {
  return (
    <GlassCardV2 className="p-5">
      <p className="text-sm font-semibold text-bw-heading uppercase tracking-wide mb-4">
        Références cinéma
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CINEMA_REFS.map((film) => (
          <div
            key={film.title}
            className="group relative rounded-xl overflow-hidden border border-[var(--color-bw-border)] hover:border-[var(--color-bw-border)] hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="relative aspect-[2/3] overflow-hidden bg-[var(--color-bw-surface-dim)]">
              <Image
                src={`${TMDB_IMG}/w342${film.poster}`}
                alt={film.title}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
              <span className="absolute top-2 right-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/50 text-white/80">
                {film.year}
              </span>
            </div>

            <div className="p-2.5 bg-card">
              <p className="font-semibold text-xs text-bw-heading leading-tight">
                {film.title}
              </p>
              <p className="text-[10px] text-bw-muted mt-0.5">
                {film.director}
              </p>
              <p
                className="text-[10px] font-medium mt-1.5 px-2 py-0.5 rounded-full inline-block border"
                style={{
                  borderColor: `${film.color}25`,
                  color: film.color,
                  backgroundColor: `${film.color}08`,
                }}
              >
                {film.theme}
              </p>
            </div>
          </div>
        ))}
      </div>
    </GlassCardV2>
  );
}
