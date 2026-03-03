/**
 * PKCE (Proof Key for Code Exchange) utilities for OAuth 2.0
 * Uses S256 challenge method (SHA-256 of verifier, base64url encoded)
 */

/**
 * Generate a cryptographically secure random string for PKCE verifier.
 * 64+ bytes (512 bits) as per RFC 7636 recommendation.
 */
export function generatePKCEVerifier(): string {
  const bytes = new Uint8Array(64)
  crypto.getRandomValues(bytes)
  return base64UrlEncode(bytes)
}

/**
 * Generate PKCE challenge from verifier using SHA-256.
 * challenge = base64url(SHA256(verifier))
 */
export async function generatePKCEChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return base64UrlEncode(new Uint8Array(digest))
}

/**
 * Generate a secure random state token for CSRF protection.
 */
export function generateState(): string {
  return crypto.randomUUID()
}

/**
 * Base64url encode (RFC 4648) - no padding, URL-safe characters.
 */
function base64UrlEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
