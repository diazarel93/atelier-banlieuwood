import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { DiscoveredLink } from "./crawler.js";
import { sleep } from "./crawler.js";
import {
  CRAWL_DELAY_MS,
  OUTPUT_DIR,
  USER_AGENT,
  type ManifestEntry,
  type OutputCategory,
} from "./config.js";

/** Sanitize un nom de fichier (supprime caractères dangereux) */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9À-ÿ._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 200); // Limiter la longueur
}

/** Extrait un nom de fichier depuis une URL */
function filenameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const lastSegment = pathname.split("/").pop() || "document.pdf";
    return sanitizeFilename(decodeURIComponent(lastSegment));
  } catch {
    return "document.pdf";
  }
}

/** Assure l'existence d'un dossier de catégorie */
function ensureCategoryDir(category: OutputCategory): string {
  const dir = join(OUTPUT_DIR, category);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/** Télécharge un fichier PDF */
async function downloadPdf(
  url: string,
  destPath: string
): Promise<{ ok: boolean; sizeBytes: number }> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      redirect: "follow",
    });

    if (!res.ok) {
      console.log(`  [FAIL] HTTP ${res.status} — ${url}`);
      return { ok: false, sizeBytes: 0 };
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    writeFileSync(destPath, buffer);
    return { ok: true, sizeBytes: buffer.length };
  } catch (err) {
    console.log(`  [ERR] ${(err as Error).message} — ${url}`);
    return { ok: false, sizeBytes: 0 };
  }
}

/**
 * Télécharge tous les PDF découverts pour une catégorie donnée.
 * Respecte le crawl-delay entre chaque requête.
 * Retourne les entrées de manifeste pour les fichiers téléchargés.
 */
export async function downloadAll(
  links: DiscoveredLink[],
  category: OutputCategory
): Promise<ManifestEntry[]> {
  const dir = ensureCategoryDir(category);
  const entries: ManifestEntry[] = [];
  const seenFilenames = new Set<string>();

  for (let i = 0; i < links.length; i++) {
    const link = links[i];

    // Générer un nom unique
    let filename = filenameFromUrl(link.url);
    if (seenFilenames.has(filename)) {
      const ext = filename.includes(".") ? filename.slice(filename.lastIndexOf(".")) : "";
      const base = filename.includes(".")
        ? filename.slice(0, filename.lastIndexOf("."))
        : filename;
      filename = `${base}_${i}${ext}`;
    }
    seenFilenames.add(filename);

    const destPath = join(dir, filename);

    // Skip si déjà téléchargé
    if (existsSync(destPath)) {
      console.log(`  [SKIP] Déjà présent : ${filename}`);
      continue;
    }

    console.log(`  [DL ${i + 1}/${links.length}] ${filename}`);
    const { ok, sizeBytes } = await downloadPdf(link.url, destPath);

    if (ok) {
      entries.push({
        filename,
        path: `${category}/${filename}`,
        sourceUrl: link.url,
        discoveredFrom: link.discoveredFrom,
        category,
        downloadedAt: new Date().toISOString(),
        sizeBytes,
        type: "pdf",
      });
    }

    // Crawl-delay entre chaque téléchargement
    if (i < links.length - 1) {
      await sleep(CRAWL_DELAY_MS);
    }
  }

  return entries;
}
