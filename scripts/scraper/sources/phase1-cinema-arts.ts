import type { ScrapingSource } from "../config.js";

/**
 * Phase 1 — Coeur de metier : Cinema-Audiovisuel + Arts Plastiques
 * ~5 pages HTML portail, ~80-100 PDF estimés
 */
export const phase1Sources: ScrapingSource[] = [
  // --- Cinema-Audiovisuel ---
  {
    url: "https://eduscol.education.gouv.fr/6934/cinema-et-audiovisuel",
    category: "cinema",
    label: "Cinéma-audiovisuel tous cycles (dispositifs, concours)",
  },
  {
    url: "https://eduscol.education.gouv.fr/5775/programmes-et-ressources-en-cinema-audiovisuel-voie-gt",
    category: "cinema",
    label: "Cinéma-audiovisuel lycée GT (programmes, ressources péda)",
    directPdfs: [
      // Guide diffusion oeuvres cinéma en classe
      "https://eduscol.education.gouv.fr/sites/default/files/document/guide-comment-diffuser-des-oeuvres-cinematographiques-et-audiovisuelles-en-classe-73053.pdf",
    ],
  },
  {
    url: "https://sti.eduscol.education.fr/formations/bts/bts-metiers-de-laudiovisuel-mav",
    category: "cinema",
    label: "BTS Métiers de l'Audiovisuel (référentiel)",
    directPdfs: [
      "https://sti.eduscol.education.fr/sites/eduscol.education.fr.sti/files/textes/bts/bts-metiers-de-laudiovisuel/4874-bts-metiers-audiovisuel.pdf",
    ],
  },

  // --- Arts Plastiques ---
  {
    url: "https://eduscol.education.gouv.fr/4731/ressources-d-accompagnement-des-enseignements-en-arts-plastiques-aux-cycles-2-et-3",
    category: "arts-plastiques",
    label: "Arts plastiques cycles 2-3 (CP-6e)",
  },
  {
    url: "https://eduscol.education.gouv.fr/5718/ressources-d-accompagnement-du-programme-d-arts-plastiques-au-cycle-4",
    category: "arts-plastiques",
    label: "Arts plastiques cycle 4 (5e-3e) — 38 PDF",
  },
  {
    url: "https://eduscol.education.gouv.fr/5772/programmes-et-ressources-en-arts-plastiques-voie-gt",
    category: "arts-plastiques",
    label: "Arts plastiques lycée GT (option + spécialité)",
  },
  {
    url: "https://eduscol.education.gouv.fr/5871/programmes-et-ressources-en-arts-appliques-et-cultures-artistiques-voie-professionnelle",
    category: "arts-plastiques",
    label: "Arts appliqués voie professionnelle (9 PDF)",
  },
];
