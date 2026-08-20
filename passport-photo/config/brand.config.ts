/**
 * Single source of truth for product branding.
 * Swap this file (or override via env) when detaching to a new domain / CNAME.
 */
export const brand = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? "PhotoSpec",
  tagline:
    process.env.NEXT_PUBLIC_TAGLINE ??
    "Format a UK passport portrait in your browser. Photos never leave this device.",
  /** Public hostname for CNAME / standalone deploy. */
  domain: process.env.NEXT_PUBLIC_DOMAIN ?? "photospec.averonsoft.com",
  baseUrl:
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://photospec.averonsoft.com",
  contactEmail:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@averonsoft.com",
  logoText: process.env.NEXT_PUBLIC_LOGO_TEXT ?? "PhotoSpec",
  govPhotoGuideUrl:
    process.env.NEXT_PUBLIC_GOV_PHOTO_GUIDE_URL ??
    "https://www.gov.uk/photos-for-passports",
  footerLinks: [
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
