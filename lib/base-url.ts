/**
 * Resolves the app base URL for OAuth redirects and similar.
 * Prefers the request's Host header so redirect URI matches the domain the user is on.
 * When visiting via *.vercel.app, uses NEXT_PUBLIC_APP_URL if set so Google shows
 * the branded domain (e.g. averonsoft.com) instead of averonsoft-nine.vercel.app.
 */
export function getBaseUrl(request?: Request): string {
  const host = request?.headers.get('host')
  const isVercelApp = host?.includes('.vercel.app')

  // When on vercel.app and we have a custom domain configured, use it for OAuth
  // so Google shows "averonsoft.com" instead of "averonsoft-nine.vercel.app"
  if (isVercelApp && process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  }

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
