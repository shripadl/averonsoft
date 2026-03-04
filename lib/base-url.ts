/**
 * Resolves the app base URL for OAuth redirects and similar.
 * Prefers the request's Host header so redirect URI matches the domain the user is on
 * (fixes mismatch when visiting www.averonsoft.com vs averonsoft-nine.vercel.app).
 */
export function getBaseUrl(request?: Request): string {
  const host = request?.headers.get('host')
  if (host) {
    const isLocalhost = host.startsWith('localhost') || host.startsWith('127.0.0.1')
    const proto = request?.headers.get('x-forwarded-proto') ?? (isLocalhost ? 'http' : 'https')
    return `${proto}://${host}`
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  }
  if (process.env.NEXT_PUBLIC_URL) {
    return process.env.NEXT_PUBLIC_URL.replace(/\/$/, '')
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'http://localhost:3000'
}
