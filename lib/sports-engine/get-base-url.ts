import { headers } from 'next/headers'

function normalizeBaseUrl(raw: string | undefined): string | null {
  if (!raw?.trim()) return null
  // Duplicate or merged env entries can produce "http://a;http://b" on some setups.
  const first = raw.split(/[;,]/)[0]?.trim()
  if (!first) return null
  try {
    const u = new URL(first)
    return `${u.protocol}//${u.host}`
  } catch {
    return null
  }
}

/**
 * Base URL for server-side fetch to this app's own API routes (e.g. /api/sports/**).
 * Prefer the incoming request host so dev works on any localhost port.
 */
export async function getServerFetchBaseUrl(): Promise<string> {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  if (host) {
    const isLocal =
      host.startsWith('localhost') ||
      host.startsWith('127.0.0.1') ||
      host.startsWith('[::1]')
    const proto = h.get('x-forwarded-proto') ?? (isLocal ? 'http' : 'https')
    return `${proto}://${host}`
  }

  const explicit =
    normalizeBaseUrl(process.env.NEXT_PUBLIC_BASE_URL) ||
    normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL) ||
    normalizeBaseUrl(process.env.NEXT_PUBLIC_URL)
  if (explicit) return explicit

  return 'http://localhost:3000'
}
