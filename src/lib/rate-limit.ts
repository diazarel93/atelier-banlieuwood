/**
 * Simple in-memory rate limiter for API routes.
 * Tracks requests per IP with a sliding window.
 * Not shared across instances — good enough for single-server/Vercel.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 60s to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 60_000);

interface RateLimitOptions {
  /** Max requests per window */
  max: number;
  /** Window duration in seconds */
  windowSec: number;
}

/**
 * Returns null if allowed, or { error, retryAfterSec } if rate limited.
 */
export function checkRateLimit(
  ip: string,
  route: string,
  opts: RateLimitOptions,
): { error: string; retryAfterSec: number } | null {
  const key = `${ip}:${route}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + opts.windowSec * 1000 });
    return null;
  }

  entry.count++;

  if (entry.count > opts.max) {
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
    return {
      error: "Trop de requêtes. Réessaie dans un moment.",
      retryAfterSec,
    };
  }

  return null;
}

/** Extract IP from request headers (works on Vercel + local) */
export function getIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
