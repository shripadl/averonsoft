/**
 * Single source of truth for product branding.
 * Swap this file (or override via env) when detaching to a new domain / CNAME.
 */
export const brand = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? "PlotMeasure",
  tagline:
    process.env.NEXT_PUBLIC_TAGLINE ??
    "Draw a shape on the map. Get the area.",
  /** Public hostname for CNAME / standalone deploy (placeholder until DNS is set). */
  domain: process.env.NEXT_PUBLIC_DOMAIN ?? "map.averonsoft.com",
  baseUrl:
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://averonsoft.com/area-map",
  contactEmail:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@averonsoft.com",
  logoText: process.env.NEXT_PUBLIC_LOGO_TEXT ?? "PlotMeasure",
  /** OpenFreeMap style — no API key, OSM-derived, MapLibre-compatible. */
  mapStyleUrl:
    process.env.NEXT_PUBLIC_MAP_STYLE_URL ??
    "https://tiles.openfreemap.org/styles/liberty",
  /**
   * Geocode API path (Nominatim proxy). Host mount uses /api/area-map/geocode;
   * standalone deploy defaults via NEXT_PUBLIC_GEOCODE_PATH=/api/geocode.
   */
  geocodePath:
    process.env.NEXT_PUBLIC_GEOCODE_PATH ?? "/api/area-map/geocode",
  footerLinks: [
    {
      label: "OpenStreetMap",
      href: "https://www.openstreetmap.org/copyright",
    },
    {
      label: "Contact",
      href: `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@averonsoft.com"}`,
    },
  ],
  /** Optional parent-site credit; leave empty when fully detached. */
  parentCredit: process.env.NEXT_PUBLIC_PARENT_CREDIT ?? "Built by Averonsoft",
  parentUrl: process.env.NEXT_PUBLIC_PARENT_URL ?? "https://averonsoft.com",
} as const;

export type BrandConfig = typeof brand;
