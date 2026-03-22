import type { ScrapingSource } from "../config.js";

/**
 * Phase 3 — Sources strategiques hors Eduscol
 * CNC, Pass Culture, Légifrance, etc.
 * ~15 pages HTML, ~50 PDF estimés
 */
export const phase3Sources: ScrapingSource[] = [
  // --- Priorité 0 : Indispensables ---
  {
    url: "https://www.cnc.fr/cinema/education-a-l-image",
    category: "hors-eduscol",
    label: "CNC — Éducation à l'image (dispositifs, 2M élèves/an)",
  },
  {
    url: "https://pass.culture.fr/lessentiel-du-pass-enseignants",
    category: "hors-eduscol",
    label: "Pass Culture — Part collective enseignants (62M EUR/an)",
  },
  {
    url: "https://travail-emploi.gouv.fr/qualiopi-marque-de-certification-qualite-des-prestataires-de-formation",
    category: "hors-eduscol",
    label: "Qualiopi — Certification qualité formation",
  },
  {
    url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006071191/LEGISCTA000006182399/",
    category: "hors-eduscol",
    label: "Légifrance — Code Éducation Arts (L312-5 à L312-8)",
  },

  // --- Priorité 1 : Forte valeur stratégique ---
  {
    url: "https://www.citeseducatives.fr/le-projet/les-cites-educatives",
    category: "hors-eduscol",
    label: "ANCT — Cités éducatives (208 quartiers)",
  },
  {
    url: "https://www.archipel-lucioles.fr/dispositif-passeurs-dimages",
    category: "hors-eduscol",
    label: "Passeurs d'images — Éducation image QPV 12-25 ans",
  },
  {
    url: "https://www.francecompetences.fr/recherche/rncp/37020/",
    category: "hors-eduscol",
    label: "France Compétences — RNCP BTS Audiovisuel",
  },
  {
    url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000030852198",
    category: "hors-eduscol",
    label: "Légifrance — Arrêté PEAC 2015 (3 piliers)",
  },

  // --- Priorité 2 : Appui ---
  {
    url: "https://eduscol.education.gouv.fr/6048/adage-application-dediee-la-generalisation-de-l-education-artistique-et-culturelle",
    category: "hors-eduscol",
    label: "ADAGE — Plateforme partenaires EAC",
  },
  {
    url: "https://www.education.gouv.fr/le-socle-commun-de-connaissances-de-competences-et-de-culture-12512",
    category: "hors-eduscol",
    label: "Socle commun (5 domaines, révision 2025)",
  },
];
