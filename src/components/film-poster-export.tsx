"use client";

import { useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { exportElementAsImage } from "@/lib/export-image";
import FilmPoster from "@/components/film-poster";
import type { FilmPosterProps } from "@/components/film-poster";
import { Button } from "@/components/ui/button";

interface FilmPosterExportProps extends FilmPosterProps {}

/**
 * Wrapper around FilmPoster that adds a "Download poster" button.
 * Uses html-to-image (via exportElementAsImage) to export the poster as a PNG.
 */
export default function FilmPosterExport(props: FilmPosterExportProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (!posterRef.current) return;
    setExporting(true);
    try {
      const slug = props.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      await exportElementAsImage(posterRef.current, `${slug}-affiche.png`);
      toast.success("Affiche téléchargée !");
    } catch {
      toast.error("Erreur lors de la génération de l'affiche");
    } finally {
      setExporting(false);
    }
  }, [props.title]);

  return (
    <div className="space-y-4">
      {/* Poster preview — centered, with shadow */}
      <div className="flex justify-center">
        <div className="rounded-xl overflow-hidden shadow-[0_8px_40px_rgba(212,168,67,0.15)]">
          <FilmPoster ref={posterRef} {...props} />
        </div>
      </div>

      {/* Export button */}
      <div className="flex justify-center">
        <Button
          onClick={handleExport}
          disabled={exporting}
          className="bg-gradient-to-r from-bw-gold to-bw-primary hover:from-bw-gold-500 hover:to-bw-primary-500 text-white shadow-none"
        >
          {exporting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Génération en cours...
            </>
          ) : (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Télécharger l&apos;affiche
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
