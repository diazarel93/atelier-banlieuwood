import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

/**
 * Detect locale from:
 * 1. Cookie `locale` (user preference)
 * 2. Accept-Language header
 * 3. Default to French
 */
async function getLocale(): Promise<Locale> {
  // 1. Cookie override
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }

  // 2. Accept-Language header
  const headerStore = await headers();
  const acceptLang = headerStore.get("accept-language") || "";
  for (const locale of locales) {
    if (acceptLang.toLowerCase().includes(locale)) {
      return locale;
    }
  }

  // 3. Default
  return defaultLocale;
}

export default getRequestConfig(async () => {
  const locale = await getLocale();

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
