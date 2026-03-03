/**
 * Secure cookie helpers for OAuth flow.
 * All cookies: httpOnly, Secure, SameSite=Lax
 */

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 10, // 10 minutes - enough for OAuth flow
}

export function setPKCEVerifierCookie(verifier: string): string {
  return serializeCookie('pkce_verifier', verifier, COOKIE_OPTIONS)
}

export function setOAuthStateCookie(state: string): string {
  return serializeCookie('oauth_state', state, COOKIE_OPTIONS)
}

export function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {}
  const cookies: Record<string, string> = {}
  for (const part of cookieHeader.split('; ')) {
    const [name, ...valueParts] = part.split('=')
    if (name && valueParts.length > 0) {
      cookies[name] = valueParts.join('=').trim()
    }
  }
  return cookies
}

export function getPKCEVerifier(cookieHeader: string | null): string | null {
  return parseCookies(cookieHeader).pkce_verifier || null
}

export function getOAuthState(cookieHeader: string | null): string | null {
  return parseCookies(cookieHeader).oauth_state || null
}

/**
 * Build Set-Cookie header value for clearing a cookie.
 */
export function clearCookie(name: string): string {
  return `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax`
}

/**
 * Serialize a cookie for Set-Cookie header.
 */
function serializeCookie(
  name: string,
  value: string,
  options: {
    httpOnly?: boolean
    secure?: boolean
    sameSite?: 'lax' | 'strict' | 'none'
    path?: string
    maxAge?: number
  }
): string {
  const parts = [`${name}=${encodeURIComponent(value)}`]
  if (options.path) parts.push(`Path=${options.path}`)
  if (options.maxAge) parts.push(`Max-Age=${options.maxAge}`)
  if (options.httpOnly) parts.push('HttpOnly')
  if (options.secure) parts.push('Secure')
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`)
  return parts.join('; ')
}
