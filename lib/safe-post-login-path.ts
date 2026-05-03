/**
 * Same-site path only — mitigates open redirects (e.g. next=https://evil.com).
 */
export function safePostLoginPath(raw: string | null | undefined): string | null {
  if (raw == null || typeof raw !== 'string') return null
  const s = raw.trim()
  if (!s.startsWith('/')) return null
  if (s.startsWith('//')) return null
  if (s.includes('://')) return null
  if (s.includes('\\')) return null
  if (s.length > 2048) return null
  return s
}
