/**
 * Single source of truth for product branding.
 * Swap this file (or override via env) when detaching to a new domain.
 */
export const brand = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? "PayFrame",
  tagline:
    process.env.NEXT_PUBLIC_TAGLINE ??
    "See what actually lands in your account",
  domain: process.env.NEXT_PUBLIC_DOMAIN ?? "averonsoft.com",
  baseUrl:
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://averonsoft.com/uk-tax-calculator",
  contactEmail:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@averonsoft.com",
  logoText: process.env.NEXT_PUBLIC_LOGO_TEXT ?? "PayFrame",
  footerLinks: [
    {
      label: "Rates source (GOV.UK)",
      href: "https://www.gov.uk/income-tax-rates",
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
