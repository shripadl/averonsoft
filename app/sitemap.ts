import type { MetadataRoute } from 'next'
import { TOOL_CONFIG } from '@/lib/tool-settings'
import { REGEX_USE_CASES } from '@/lib/regex-explain/use-cases'

/**
 * Does not list Smart Image Resizer SEO paths (`/tools/resize-image-*`); those routes stay in the
 * app and proxy — only omitted here for Search Console.
 */

/** Hub routes for disabled tools — omitted from the sitemap (pages may still exist). */
const EXCLUDED_TOOL_HREFS = new Set([
  '/tools/daw',
  '/tools/ai-workspace',
  '/tools/smart-image-resizer',
])

const STATIC_ROUTES: {
  path: string
  priority: number
  changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency']
}[] = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/faq', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/pricing', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/legal/privacy', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/legal/terms', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/legal/cookies', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/legal/refunds', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/legal/gdpr', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/legal/eula', priority: 0.4, changeFrequency: 'yearly' },
]

function siteOrigin(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`
  }
  return 'http://localhost:3000'
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteOrigin()
  const now = new Date()

  const toolEntries = TOOL_CONFIG.filter((t) => !EXCLUDED_TOOL_HREFS.has(t.href)).map((t) => ({
    url: `${base}${t.href}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  const regexUseCaseEntries = REGEX_USE_CASES.map((c) => ({
    url: `${base}/tools/regex-explainer/${c.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const staticEntries = STATIC_ROUTES.map((r) => ({
    url: `${base}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))

  return [...staticEntries, ...toolEntries, ...regexUseCaseEntries]
}
