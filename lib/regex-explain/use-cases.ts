import type { RegexFlavor } from './python-flavor'

export interface RegexUseCasePreset {
  slug: string
  title: string
  shortTitle: string
  metaDescription: string
  pattern: string
  flags: string
  test: string
  initialFlavor?: RegexFlavor
}

export const REGEX_USE_CASES: RegexUseCasePreset[] = [
  {
    slug: 'email',
    shortTitle: 'Email',
    title: 'Regex for email addresses',
    metaDescription:
      'Example regular expression to match common email-shaped strings. Explain and test in your browser with RegExplain.',
    pattern: String.raw`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`,
    flags: 'gi',
    test: 'Contact support@example.com or sales@sub.company.co.uk for details.',
  },
  {
    slug: 'phone',
    shortTitle: 'Phone',
    title: 'Regex for phone numbers (US-style)',
    metaDescription:
      'Example pattern for digits grouped like a US phone number. Adjust for your country rules.',
    pattern: String.raw`\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b`,
    flags: 'g',
    test: 'Call 555-123-4567, (555) 987-6543, or +1 202 555 0199.',
  },
  {
    slug: 'url',
    shortTitle: 'URL',
    title: 'Regex for HTTP/HTTPS URLs',
    metaDescription:
      'Simple pattern to match http(s) URLs in text. Tighten for production validation.',
    pattern: 'https?://[^\\s<>"]+',
    flags: 'gi',
    test: 'Visit https://example.com/path?q=1 and http://test.local/page.',
  },
  {
    slug: 'ipv4',
    shortTitle: 'IPv4',
    title: 'Regex for IPv4 addresses',
    metaDescription:
      'Example regular expression for dotted IPv4 quads. Useful for logs and configs.',
    pattern: String.raw`\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\b`,
    flags: 'g',
    test: 'Gateways 192.168.0.1 and 10.0.0.255 should match.',
  },
  {
    slug: 'uuid',
    shortTitle: 'UUID',
    title: 'Regex for UUIDs',
    metaDescription:
      'Match hyphenated UUIDs (hex digits). Switch to Python `re` in the tool to compare.',
    pattern: String.raw`\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b`,
    flags: 'g',
    test: 'id: 550e8400-e29b-41d4-a716-446655440000 and 6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  },
  {
    slug: 'date',
    shortTitle: 'Date',
    title: 'Regex for ISO dates (YYYY-MM-DD)',
    metaDescription:
      'Match calendar dates in ISO 8601 form. Does not validate month/day ranges—tighten if needed.',
    pattern: String.raw`\b\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])\b`,
    flags: 'g',
    test: 'Released 2024-03-15; legacy 1999-12-31 and bad 2025-02-30 still match shape.',
  },
  {
    slug: 'credit-card',
    shortTitle: 'Credit card',
    title: 'Regex for credit card numbers (digits)',
    metaDescription:
      'Groups of 13–19 digits with optional separators—handy for spotting card-like strings, not Luhn validation.',
    pattern: String.raw`\b(?:\d{4}[-\s]?){3}\d{1,7}\b`,
    flags: 'g',
    test: 'Card 4532 1488 0343 6467 or 4532148803436467 (sample only).',
  },
  {
    slug: 'postal-code',
    shortTitle: 'ZIP',
    title: 'Regex for US ZIP codes',
    metaDescription:
      'US 5-digit ZIP or ZIP+4. Adjust for international postal formats.',
    pattern: String.raw`\b\d{5}(?:-\d{4})?\b`,
    flags: 'g',
    test: 'Ship to 90210 or 10001-1234.',
  },
  {
    slug: 'slug',
    shortTitle: 'Slug',
    title: 'Regex for URL slugs',
    metaDescription:
      'Lowercase hyphenated slugs (letters, numbers, hyphens). Good for blog paths and IDs.',
    pattern: String.raw`\b[a-z0-9]+(?:-[a-z0-9]+)*\b`,
    flags: 'g',
    test: 'Paths: /blog/my-first-post and tag/seo-tools-2025',
  },
  {
    slug: 'hex-color',
    shortTitle: 'Hex color',
    title: 'Regex for hex colors (#RGB / #RRGGBB)',
    metaDescription:
      'Match CSS-style hex colors with optional alpha (#RRGGBBAA).',
    pattern: String.raw`#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b`,
    flags: 'g',
    test: 'Theme: #fff, #0d1117, and #336699cc',
  },
]

export function getUseCaseBySlug(slug: string): RegexUseCasePreset | undefined {
  return REGEX_USE_CASES.find((c) => c.slug === slug)
}
