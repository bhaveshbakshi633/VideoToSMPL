import Script from "next/script";

/**
 * Privacy-friendly analytics. Pick whichever is enabled via env:
 *   - NEXT_PUBLIC_PLAUSIBLE_DOMAIN  → Plausible (preferred: GDPR-friendly, no cookies)
 *   - NEXT_PUBLIC_CF_BEACON_TOKEN   → Cloudflare Web Analytics (free, no cookies)
 *   - NEXT_PUBLIC_UMAMI_WEBSITE_ID  → Umami (self-hosted)
 *
 * No config set → renders nothing (zero tracking by default).
 */
export function Analytics() {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const cfBeacon = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;
  const umamiId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const umamiSrc = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;

  return (
    <>
      {plausibleDomain && (
        <Script
          strategy="afterInteractive"
          src="https://plausible.io/js/script.outbound-links.tagged-events.js"
          data-domain={plausibleDomain}
        />
      )}
      {cfBeacon && (
        <Script
          strategy="afterInteractive"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon={`{"token":"${cfBeacon}"}`}
        />
      )}
      {umamiId && umamiSrc && (
        <Script
          strategy="afterInteractive"
          src={umamiSrc}
          data-website-id={umamiId}
        />
      )}
    </>
  );
}
