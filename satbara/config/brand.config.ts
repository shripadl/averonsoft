/**
 * Single source of truth for product branding.
 * Swap this file (or override via env) when detaching to a new domain / CNAME.
 */
export const brand = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? "Satbara",
  tagline:
    process.env.NEXT_PUBLIC_TAGLINE ??
    "Locate district → taluka → village, then open MahaBhulekh for live 7/12 extracts. Demo index only — not statewide live data.",
  /** Public hostname for CNAME / standalone deploy. */
  domain: process.env.NEXT_PUBLIC_DOMAIN ?? "satbara.averonsoft.com",
  baseUrl:
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://averonsoft.com/satbara",
  contactEmail:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@averonsoft.com",
  logoText: process.env.NEXT_PUBLIC_LOGO_TEXT ?? "Satbara",
  /** Official Maharashtra land records portal. */
  officialPortalUrl:
    process.env.NEXT_PUBLIC_OFFICIAL_PORTAL_URL ??
    "https://bhulekh.mahabhumi.gov.in/",
  footerLinks: [
    {
      label: "MahaBhulekh",
      href:
        process.env.NEXT_PUBLIC_OFFICIAL_PORTAL_URL ??
        "https://bhulekh.mahabhumi.gov.in/",
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
