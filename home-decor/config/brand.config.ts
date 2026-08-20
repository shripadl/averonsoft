/**
 * Single source of truth for product branding.
 * Swap this file (or override via env) when detaching to a new domain / CNAME.
 */
export const brand = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? "RoomScale",
  tagline:
    process.env.NEXT_PUBLIC_TAGLINE ??
    "Plan rooms to real dimensions. Place furniture before you buy.",
  /** Public hostname for CNAME / standalone deploy. */
  domain: process.env.NEXT_PUBLIC_DOMAIN ?? "decor.averonsoft.com",
  baseUrl:
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://averonsoft.com/home-decor",
  contactEmail:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@averonsoft.com",
  logoText: process.env.NEXT_PUBLIC_LOGO_TEXT ?? "RoomScale",
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
