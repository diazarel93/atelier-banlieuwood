import type { ScrapingSource } from "../config.js";

/**
 * Phase 2 — Extension disciplines : Francais, EMC, Numerique
 * ~8 pages HTML portail, ~150-200 PDF estimés
 */
export const phase2Sources: ScrapingSource[] = [
  // --- Français ---
  {
    url: "https://eduscol.education.gouv.fr/4698/le-developpement-et-la-structuration-du-langage-oral-et-ecrit-au-cycle-1",
    category: "francais",
    label: "Français cycle 1 (maternelle, langage oral/écrit)",
  },
  {
    url: "https://eduscol.education.gouv.fr/4740/ressources-d-accompagnement-du-programme-de-francais-au-cycle-2",
    category: "francais",
    label: "Français cycle 2 (CP-CE2)",
  },
  {
    url: "https://eduscol.education.gouv.fr/4800/ressources-d-accompagnement-du-programme-de-francais-au-cycle-3",
    category: "francais",
    label: "Français cycle 3 (CM1-6e)",
  },
  {
    url: "https://eduscol.education.gouv.fr/5733/ressources-d-accompagnement-du-programme-de-francais-au-cycle-4",
    category: "francais",
    label: "Français cycle 4 (5e-3e)",
  },
  {
    url: "https://eduscol.education.gouv.fr/5793/programmes-et-ressources-en-francais-voie-gt",
    category: "francais",
    label: "Français lycée GT (programmes, EAF, oeuvres bac)",
  },
  {
    url: "https://eduscol.education.gouv.fr/5886/programmes-et-ressources-en-francais-voie-professionnelle",
    category: "francais",
    label: "Français voie professionnelle (CAP + Bac Pro)",
  },

  // --- EMC ---
  {
    url: "https://eduscol.education.gouv.fr/4752/ressources-d-accompagnement-pour-l-enseignement-moral-et-civique-aux-cycles-2-3-et-4",
    category: "emc",
    label: "EMC cycles 2-3-4 (livrets, vadémécum citoyenneté)",
  },
  {
    url: "https://eduscol.education.gouv.fr/5787/programmes-et-ressources-en-enseignement-moral-et-civique-voie-gt",
    category: "emc",
    label: "EMC lycée GT (nouveau programme 2024)",
  },
  {
    url: "https://eduscol.education.gouv.fr/5883/programmes-et-ressources-en-enseignement-moral-et-civique-voie-professionnelle",
    category: "emc",
    label: "EMC voie professionnelle",
  },

  // --- Numérique ---
  {
    url: "https://eduscol.education.gouv.fr/5520/evaluer-developper-et-certifier-les-competences-numeriques",
    category: "numerique",
    label: "CRCN / Pix (16 compétences, certification)",
  },
  {
    url: "https://eduscol.education.gouv.fr/5841/programmes-et-ressources-en-sciences-numeriques-et-technologie-voie-gt",
    category: "numerique",
    label: "SNT 2nde (7 thèmes dont photo numérique)",
  },
  {
    url: "https://eduscol.education.gouv.fr/5823/programmes-et-ressources-en-numerique-et-sciences-informatiques-voie-g",
    category: "numerique",
    label: "NSI 1re-Tle (programmation, algorithmes)",
  },
];
