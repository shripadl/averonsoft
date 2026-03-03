import { NextResponse } from 'next/server'
import { generatePKCEVerifier, generatePKCEChallenge, generateState } from '@/lib/pkce'
import { setPKCEVerifierCookie, setOAuthStateCookie } from '@/lib/cookies'
import { buildGoogleAuthUrl } from '@/lib/google-oauth'

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_URL ||
  'http://localhost:3000'

export async function GET() {
  try {
    const verifier = generatePKCEVerifier()
    const challenge = await generatePKCEChallenge(verifier)
    const state = generateState()

    const redirectUri = `${BASE_URL}/auth/google/callback`
    const authUrl = buildGoogleAuthUrl(redirectUri, challenge, state)

    const response = NextResponse.redirect(authUrl, { status: 302 })

    response.headers.append(
      'Set-Cookie',
      setPKCEVerifierCookie(verifier)
    )
    response.headers.append(
      'Set-Cookie',
      setOAuthStateCookie(state)
    )

    return response
  } catch (error) {
    console.error('Google OAuth start error:', error)
    return NextResponse.redirect(`${BASE_URL}/login?error=oauth_start_failed`, {
      status: 302,
    })
  }
}
