import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from "@sentry/nextjs";
import withBundleAnalyzer from "@next/bundle-analyzer";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "image.pollinations.ai" },
    ],
  },
  // Phase 7 — V2 route swap: redirect old routes to V2
  // Note: /session/[id]/pilot and /session/[id]/screen are kept as-is (not redirected)
  async redirects() {
    return [
      { source: "/dashboard", destination: "/v2", permanent: true },
      { source: "/fiche-cours", destination: "/v2/fiche-cours", permanent: true },
      { source: "/session/new", destination: "/v2/seances/new", permanent: true },
      { source: "/session/:id/results", destination: "/v2/seances/:id/results", permanent: true },
      { source: "/session/:id", destination: "/v2/seances/:id", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} browser.sentry-cdn.com`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://image.tmdb.org https://images.unsplash.com https://image.pollinations.ai",
              "media-src 'self' assets.mixkit.co",
              "font-src 'self'",
              `connect-src 'self' *.supabase.co generativelanguage.googleapis.com eu.i.posthog.com *.i.posthog.com${isDev ? " localhost:11434" : ""} *.sentry.io *.ingest.sentry.io`,
              "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "report-uri /api/csp-report",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

const analyzeBundles = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withSentryConfig(analyzeBundles(withNextIntl(nextConfig)), {
  // Sentry options
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});
