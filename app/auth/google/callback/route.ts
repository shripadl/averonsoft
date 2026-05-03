import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getPKCEVerifier,
  getOAuthState,
  getOAuthPostLoginPath,
  clearCookie,
} from '@/lib/cookies'
import { exchangeCodeForTokens } from '@/lib/google-oauth'
import { getBaseUrl } from '@/lib/base-url'
import { safePostLoginPath } from '@/lib/safe-post-login-path'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  const cookieHeader = request.headers.get('cookie') || ''
  const storedState = getOAuthState(cookieHeader)
  const pkceVerifier = getPKCEVerifier(cookieHeader)

  const fromCookie = safePostLoginPath(getOAuthPostLoginPath(cookieHeader))
  const fromQuery = safePostLoginPath(url.searchParams.get('redirect_to'))
  const safeRedirect = fromCookie || fromQuery || '/dashboard'

  const baseUrl = getBaseUrl(request)

  const clearAuthCookies = (response: NextResponse) => {
    response.headers.append('Set-Cookie', clearCookie('pkce_verifier'))
    response.headers.append('Set-Cookie', clearCookie('oauth_state'))
    response.headers.append('Set-Cookie', clearCookie('oauth_post_login_path'))
    return response
  }

  const loginWithError = (code: string) => {
    const u = new URL(`${baseUrl}/login`)
    u.searchParams.set('error', code)
    if (fromCookie) u.searchParams.set('next', fromCookie)
    return u.toString()
  }

  if (error) {
    const res = NextResponse.redirect(loginWithError('oauth_denied'), { status: 302 })
    return clearAuthCookies(res)
  }

  if (!state || !storedState || state !== storedState) {
    const res = NextResponse.redirect(loginWithError('invalid_state'), { status: 302 })
    return clearAuthCookies(res)
  }

  if (!code) {
    const res = NextResponse.redirect(loginWithError('missing_code'), { status: 302 })
    return clearAuthCookies(res)
  }

  if (!pkceVerifier) {
    const res = NextResponse.redirect(loginWithError('invalid_state'), { status: 302 })
    return clearAuthCookies(res)
  }

  try {
    const redirectUri = `${baseUrl}/auth/google/callback`
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
      const res = NextResponse.redirect(loginWithError('oauth_failed'), { status: 302 })
      return clearAuthCookies(res)
    }

    const res = NextResponse.redirect(`${baseUrl}${safeRedirect}`, {
      status: 302,
    })
    return clearAuthCookies(res)
  } catch (err) {
    console.error('Google OAuth callback error:', err)
    const res = NextResponse.redirect(loginWithError('oauth_failed'), { status: 302 })
    return clearAuthCookies(res)
  }
}
