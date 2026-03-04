/**
 * Resolves the app base URL for OAuth redirects and similar.
 * Works on localhost (dev) and Vercel (production/preview) without extra config.
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  }
  if (process.env.NEXT_PUBLIC_URL) {
    return process.env.NEXT_PUBLIC_URL.replace(/\/$/, '')
  }
  // Vercel sets VERCEL_URL automatically (e.g. "averonsoft.com" or "xxx.vercel.app")
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'http://localhost:3000'
}
