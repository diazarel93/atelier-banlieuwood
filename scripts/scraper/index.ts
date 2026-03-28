/**
 * Scraper Education Nationale — Point d'entrée
 *
 * Usage : npx tsx scripts/scraper/index.ts [--phase 1|2|3|all]
 *
 * Scrape les programmes officiels (Eduscol + sources externes)
 * et télécharge les PDF dans scripts/scraper/output/
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { OUTPUT_DIR, type ManifestEntry, type ScrapingSource } from "./config.js";
import { crawlAllSources, type DiscoveredLink } from "./crawler.js";
import { downloadAll } from "./downloader.js";
import { phase1Sources } from "./sources/phase1-cinema-arts.js";
import { phase2Sources } from "./sources/phase2-francais-emc-num.js";
import { phase3Sources } from "./sources/phase3-hors-eduscol.js";

// --- Argument parsing ---

function parsePhase(args: string[]): "all" | 1 | 2 | 3 {
  const idx = args.indexOf("--phase");
  if (idx === -1) return "all";
  const val = args[idx + 1];
  if (val === "1" || val === "2" || val === "3") return Number(val) as 1 | 2 | 3;
  return "all";
}

// --- Manifeste ---

const MANIFEST_PATH = join(OUTPUT_DIR, "index.json");

function loadManifest(): ManifestEntry[] {
  if (existsSync(MANIFEST_PATH)) {
    try {
      return JSON.parse(readFileSync(MANIFEST_PATH, "utf-8"));
    } catch {
      return [];
    }
  }
  return [];
}

function saveManifest(entries: ManifestEntry[]): void {
  writeFileSync(MANIFEST_PATH, JSON.stringify(entries, null, 2), "utf-8");
}

// --- Orchestration ---

async function runPhase(
  phaseName: string,
  sources: ScrapingSource[]
): Promise<ManifestEntry[]> {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${phaseName}`);
  console.log(`  ${sources.length} source(s) à crawler`);
  console.log(`${"=".repeat(60)}`);

  // 1. Crawl : découvrir les liens PDF
  const crawlResults = await crawlAllSources(sources);

  // 2. Download : télécharger les PDF par catégorie
  const allEntries: ManifestEntry[] = [];

  for (const [source, links] of crawlResults) {
    if (links.length === 0) {
      console.log(`\n[SKIP] Aucun PDF trouvé pour : ${source.label}`);
      continue;
    }

    console.log(`\n[DOWNLOAD] ${source.label} — ${links.length} PDF`);
    const entries = await downloadAll(links, source.category);
    allEntries.push(...entries);
    console.log(`  ${entries.length} fichier(s) téléchargé(s)`);
  }

  return allEntries;
}

async function main() {
  const phase = parsePhase(process.argv);

  console.log("Scraper Education Nationale — Banlieuwood");
  console.log(`Phase : ${phase === "all" ? "toutes (1+2+3)" : phase}`);
  console.log(`Sortie : ${OUTPUT_DIR}`);

  // Créer le dossier de sortie
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Charger le manifeste existant (pour reprendre un scraping interrompu)
  const manifest = loadManifest();
  const startCount = manifest.length;

  // Lancer les phases demandées
  const phases: [string, ScrapingSource[]][] = [];
  if (phase === "all" || phase === 1)
    phases.push(["Phase 1 — Cinéma + Arts plastiques", phase1Sources]);
  if (phase === "all" || phase === 2)
    phases.push(["Phase 2 — Français + EMC + Numérique", phase2Sources]);
  if (phase === "all" || phase === 3)
    phases.push(["Phase 3 — Sources hors Eduscol", phase3Sources]);

  for (const [name, sources] of phases) {
    const entries = await runPhase(name, sources);
    manifest.push(...entries);

    // Sauvegarder le manifeste après chaque phase (reprise possible)
    saveManifest(manifest);
  }

  // Résumé final
  const newCount = manifest.length - startCount;
  console.log(`\n${"=".repeat(60)}`);
  console.log("  TERMINÉ");
  console.log(`  ${newCount} nouveau(x) fichier(s) téléchargé(s)`);
  console.log(`  ${manifest.length} fichier(s) total dans le manifeste`);
  console.log(`  Manifeste : ${MANIFEST_PATH}`);
  console.log(`${"=".repeat(60)}\n`);
}

main().catch((err) => {
  console.error("Erreur fatale :", err);
  process.exit(1);
});
