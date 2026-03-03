import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getPKCEVerifier,
  getOAuthState,
  clearCookie,
} from '@/lib/cookies'
import { exchangeCodeForTokens } from '@/lib/google-oauth'

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_URL ||
  'http://localhost:3000'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  const cookieHeader = request.headers.get('cookie') || ''
  const storedState = getOAuthState(cookieHeader)
  const pkceVerifier = getPKCEVerifier(cookieHeader)

  const redirectTo = url.searchParams.get('redirect_to')
  const safeRedirect =
    redirectTo && redirectTo.startsWith('/') ? redirectTo : '/dashboard'

  const clearAuthCookies = (response: NextResponse) => {
    response.headers.append('Set-Cookie', clearCookie('pkce_verifier'))
    response.headers.append('Set-Cookie', clearCookie('oauth_state'))
    return response
  }

  if (error) {
    const res = NextResponse.redirect(
      `${BASE_URL}/login?error=oauth_denied`,
      { status: 302 }
    )
    return clearAuthCookies(res)
  }

  if (!state || !storedState || state !== storedState) {
    const res = NextResponse.redirect(
      `${BASE_URL}/login?error=invalid_state`,
      { status: 302 }
    )
    return clearAuthCookies(res)
  }

  if (!code) {
    const res = NextResponse.redirect(
      `${BASE_URL}/login?error=missing_code`,
      { status: 302 }
    )
    return clearAuthCookies(res)
  }

  if (!pkceVerifier) {
    const res = NextResponse.redirect(
      `${BASE_URL}/login?error=invalid_state`,
      { status: 302 }
    )
    return clearAuthCookies(res)
  }

  try {
    const redirectUri = `${BASE_URL}/auth/google/callback`
    const tokens = await exchangeCodeForTokens(code, pkceVerifier, redirectUri)

    if (!tokens.id_token) {
      throw new Error('No id_token in Google response')
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: tokens.id_token,
    })

    if (error) {
      console.error('Supabase signInWithIdToken error:', error)
      const res = NextResponse.redirect(
        `${BASE_URL}/login?error=oauth_failed`,
        { status: 302 }
      )
      return clearAuthCookies(res)
    }

    const res = NextResponse.redirect(`${BASE_URL}${safeRedirect}`, {
      status: 302,
    })
    return clearAuthCookies(res)
  } catch (err) {
    console.error('Google OAuth callback error:', err)
    const res = NextResponse.redirect(
      `${BASE_URL}/login?error=oauth_failed`,
      { status: 302 }
    )
    return clearAuthCookies(res)
  }
}
