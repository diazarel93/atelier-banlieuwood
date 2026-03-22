// Configuration du scraper Education Nationale

export const USER_AGENT = "BanlieuwoodScraper/1.0 (+https://banlieuwood.fr; contact@banlieuwood.fr)";

// Crawl-delay en ms (robots.txt Eduscol = 10s)
export const CRAWL_DELAY_MS = 10_000;

// Chemins interdits par robots.txt Eduscol
export const FORBIDDEN_PATHS = ["/search", "/admin", "/user"];

// Dossier de sortie
export const OUTPUT_DIR = new URL("./output/", import.meta.url).pathname;

// Catégories de sortie
export const OUTPUT_CATEGORIES = [
  "cinema",
  "arts-plastiques",
  "francais",
  "emc",
  "numerique",
  "hors-eduscol",
] as const;

export type OutputCategory = (typeof OUTPUT_CATEGORIES)[number];

// Structure d'une source à scraper
export interface ScrapingSource {
  /** URL de la page portail à crawler */
  url: string;
  /** Catégorie de sortie */
  category: OutputCategory;
  /** Description courte */
  label: string;
  /** URLs directes de PDF à télécharger (en plus de ceux découverts par crawl) */
  directPdfs?: string[];
}

// Manifeste d'un fichier scrapé
export interface ManifestEntry {
  /** Nom du fichier local */
  filename: string;
  /** Chemin relatif depuis output/ */
  path: string;
  /** URL source d'origine */
  sourceUrl: string;
  /** Page portail d'où le lien a été découvert */
  discoveredFrom: string;
  /** Catégorie */
  category: OutputCategory;
  /** Date de téléchargement ISO */
  downloadedAt: string;
  /** Taille en octets */
  sizeBytes: number;
  /** Type : pdf ou html */
  type: "pdf" | "html";
}
