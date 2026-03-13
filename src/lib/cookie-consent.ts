/**
 * Cookie consent helpers for RGPD compliance.
 * Cookie: bw-consent (JSON, 1 year, sameSite: lax)
 */

interface ConsentData {
  analytics: boolean;
  timestamp: number;
}

const COOKIE_NAME = "bw-consent";
const ONE_YEAR = 365 * 24 * 60 * 60 * 1000;

export function getConsent(): ConsentData | null {
  if (typeof document === "undefined") return null;

  const raw = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE_NAME}=`))
    ?.split("=")
    .slice(1)
    .join("=");

  if (!raw) return null;

  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return null;
  }
}

export function setConsent(analytics: boolean): void {
  if (typeof document === "undefined") return;

  const data: ConsentData = { analytics, timestamp: Date.now() };
  const expires = new Date(Date.now() + ONE_YEAR).toUTCString();
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(data))}; path=/; expires=${expires}; SameSite=Lax`;
}

export function hasAnalyticsConsent(): boolean {
  const consent = getConsent();
  return consent?.analytics === true;
}

export function hasRespondedToConsent(): boolean {
  return getConsent() !== null;
}
