import { NextRequest, NextResponse } from 'next/server'
import { generatePKCEVerifier, generatePKCEChallenge, generateState } from '@/lib/pkce'
import {
  setPKCEVerifierCookie,
  setOAuthStateCookie,
  setOAuthPostLoginPathCookie,
} from '@/lib/cookies'
import { buildGoogleAuthUrl } from '@/lib/google-oauth'
import { getBaseUrl } from '@/lib/base-url'
import { safePostLoginPath } from '@/lib/safe-post-login-path'

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request)
  const safeNext = safePostLoginPath(request.nextUrl.searchParams.get('next'))

  try {
    const verifier = generatePKCEVerifier()
    const challenge = await generatePKCEChallenge(verifier)
    const state = generateState()

    const redirectUri = `${baseUrl}/auth/google/callback`
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
    if (safeNext) {
      response.headers.append('Set-Cookie', setOAuthPostLoginPathCookie(safeNext))
    }

    return response
  } catch (error) {
    console.error('Google OAuth start error:', error)
    const login = new URL(`${baseUrl}/login`)
    login.searchParams.set('error', 'oauth_start_failed')
    if (safeNext) login.searchParams.set('next', safeNext)
    return NextResponse.redirect(login.toString(), {
      status: 302,
    })
  }
}
