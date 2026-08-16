/**
 * Analytics wrapper driven entirely by env vars.
 * No provider is loaded unless an ID is configured.
 */

type EventProps = Record<string, string | number | boolean | undefined>;

const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const ga4Id = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

export function trackEvent(name: string, props?: EventProps): void {
  if (typeof window === "undefined") return;

  if (plausibleDomain && "plausible" in window) {
    (
      window as Window & {
        plausible?: (n: string, o?: { props?: EventProps }) => void;
      }
    ).plausible?.(name, props ? { props } : undefined);
  }

  if (ga4Id && "gtag" in window) {
    (
      window as Window & {
        gtag?: (...args: unknown[]) => void;
      }
    ).gtag?.("event", name, props);
  }
}

export function getAnalyticsConfig() {
  return {
    plausibleDomain: plausibleDomain || null,
    ga4Id: ga4Id || null,
  };
}
