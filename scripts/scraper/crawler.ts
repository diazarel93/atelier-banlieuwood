import * as cheerio from "cheerio";
import {
  CRAWL_DELAY_MS,
  FORBIDDEN_PATHS,
  USER_AGENT,
  type ScrapingSource,
} from "./config.js";

export interface DiscoveredLink {
  /** URL absolue du PDF */
  url: string;
  /** Texte du lien (description) */
  label: string;
  /** Page source où le lien a été trouvé */
  discoveredFrom: string;
}

/** Pause entre les requêtes (respect robots.txt) */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Vérifie qu'un chemin n'est pas interdit par robots.txt */
function isAllowedPath(url: string): boolean {
  try {
    const { pathname } = new URL(url);
    return !FORBIDDEN_PATHS.some((p) => pathname.startsWith(p));
  } catch {
    return false;
  }
}

/** Normalise une URL relative en absolue */
function resolveUrl(base: string, href: string): string | null {
  try {
    return new URL(href, base).href;
  } catch {
    return null;
  }
}

/** Fetch une page HTML avec le User-Agent identifié */
async function fetchPage(url: string): Promise<string | null> {
  if (!isAllowedPath(url)) {
    console.log(`  [SKIP] Chemin interdit par robots.txt : ${url}`);
    return null;
  }

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      redirect: "follow",
    });

    if (!res.ok) {
      console.log(`  [WARN] HTTP ${res.status} pour ${url}`);
      return null;
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      console.log(`  [SKIP] Pas du HTML : ${contentType}`);
      return null;
    }

    return await res.text();
  } catch (err) {
    console.log(`  [ERR] Impossible de fetch ${url} : ${(err as Error).message}`);
    return null;
  }
}

/** Extrait tous les liens PDF d'une page HTML */
function extractPdfLinks(html: string, pageUrl: string): DiscoveredLink[] {
  const $ = cheerio.load(html);
  const links: DiscoveredLink[] = [];
  const seen = new Set<string>();

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    const resolved = resolveUrl(pageUrl, href);
    if (!resolved) return;

    // Garder uniquement les liens vers des PDF
    if (!resolved.toLowerCase().endsWith(".pdf")) return;

    // Dédupliquer
    if (seen.has(resolved)) return;
    seen.add(resolved);

    const label = $(el).text().trim() || resolved.split("/").pop() || "PDF";

    links.push({
      url: resolved,
      label,
      discoveredFrom: pageUrl,
    });
  });

  return links;
}

/**
 * Crawle une source : fetch la page HTML, extrait les liens PDF,
 * ajoute les PDF directs configurés.
 */
export async function crawlSource(source: ScrapingSource): Promise<DiscoveredLink[]> {
  console.log(`\n[CRAWL] ${source.label}`);
  console.log(`  URL: ${source.url}`);

  const html = await fetchPage(source.url);
  const links: DiscoveredLink[] = [];

  if (html) {
    const discovered = extractPdfLinks(html, source.url);
    console.log(`  Trouvé ${discovered.length} lien(s) PDF sur la page`);
    links.push(...discovered);
  }

  // Ajouter les PDF directs configurés
  if (source.directPdfs) {
    for (const pdfUrl of source.directPdfs) {
      if (!links.some((l) => l.url === pdfUrl)) {
        links.push({
          url: pdfUrl,
          label: pdfUrl.split("/").pop() || "PDF direct",
          discoveredFrom: source.url,
        });
      }
    }
    console.log(`  + ${source.directPdfs.length} PDF direct(s) ajouté(s)`);
  }

  return links;
}

/**
 * Crawle toutes les sources d'une phase en respectant le crawl-delay.
 */
export async function crawlAllSources(
  sources: ScrapingSource[]
): Promise<Map<ScrapingSource, DiscoveredLink[]>> {
  const results = new Map<ScrapingSource, DiscoveredLink[]>();

  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    const links = await crawlSource(source);
    results.set(source, links);

    // Respecter le crawl-delay entre les requêtes
    if (i < sources.length - 1) {
      console.log(`  Attente ${CRAWL_DELAY_MS / 1000}s (crawl-delay)...`);
      await sleep(CRAWL_DELAY_MS);
    }
  }

  return results;
}
