import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const origin = url.origin

  // 1. Read stored state from cookie
  const cookieHeader = request.headers.get('cookie') || ''
  const storedState = cookieHeader
    .split('; ')
    .find(c => c.startsWith('oauth_state='))
    ?.split('=')[1]

  // 2. Validate state (CSRF protection)
  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(`${origin}/login?error=invalid_state`)
  }

  // 3. Reject missing or invalid codes
  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  // 4. Exchange the code for a Supabase session
  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
  }

  // 5. Safe redirect handling
  const redirectTo = url.searchParams.get('redirect_to')
  const safeRedirect =
    redirectTo && redirectTo.startsWith('/')
      ? redirectTo
      : '/dashboard'

  return NextResponse.redirect(`${origin}${safeRedirect}`)
}
