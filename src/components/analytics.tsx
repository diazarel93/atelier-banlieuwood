"use client";

import Script from "next/script";

/**
 * PostHog Analytics + Sentry Error Monitoring
 * Only loads in production when env vars are set.
 * Add <Analytics /> to your root layout.
 */
export function Analytics() {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost =
    process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";
  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

  return (
    <>
      {/* PostHog — privacy-friendly analytics */}
      {posthogKey && (
        <Script
          id="posthog"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group identify setPersonProperties setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags startSessionRecording stopSessionRecording isSessionRecordingActive getDistinctId alias".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
              posthog.init('${posthogKey}', {
                api_host: '${posthogHost}',
                person_profiles: 'identified_only',
                capture_pageview: true,
                capture_pageleave: true,
                autocapture: false,
              });
            `,
          }}
        />
      )}

      {/* Sentry — error monitoring */}
      {sentryDsn && (
        <Script
          id="sentry"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var script = document.createElement('script');
                script.src = 'https://browser.sentry-cdn.com/8.0.0/bundle.tracing.min.js';
                script.crossOrigin = 'anonymous';
                script.onload = function() {
                  Sentry.init({
                    dsn: '${sentryDsn}',
                    tracesSampleRate: 0.1,
                    replaysSessionSampleRate: 0,
                    replaysOnErrorSampleRate: 1.0,
                    environment: window.location.hostname === 'banlieuwood.fr' ? 'production' : 'development',
                  });
                };
                document.head.appendChild(script);
              })();
            `,
          }}
        />
      )}
    </>
  );
}
