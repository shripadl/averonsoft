import { headers } from 'next/headers'

/**
 * Base URL for server-side fetch to this app's own API routes (e.g. /api/sports/**).
 * Prefer NEXT_PUBLIC_BASE_URL; otherwise derive from request headers.
 */
export async function getServerFetchBaseUrl(): Promise<string> {
  const explicit =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_URL
  if (explicit) {
    return explicit.replace(/\/$/, '')
  }
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}
