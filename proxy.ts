import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { safePostLoginPath } from '@/lib/safe-post-login-path'
import { isAreaMapHost } from '@/lib/area-map-host'
import { isHomeDecorHost } from '@/lib/home-decor-host'
import { isSatbaraHost } from '@/lib/satbara-host'
import { isPassportPhotoHost } from '@/lib/passport-photo-host'

const ADMIN_ROLES = ['admin', 'super_admin', 'support']

export async function proxy(request: NextRequest) {
  const host = request.headers.get('host')
  let pathname = request.nextUrl.pathname

  // CNAME / subdomain → product mount (same Vercel project)
  let rewritePath: string | null = null
  if (isAreaMapHost(host)) {
    if (
      !pathname.startsWith('/area-map') &&
      !pathname.startsWith('/_next') &&
      !pathname.startsWith('/api')
    ) {
      rewritePath = pathname === '/' ? '/area-map' : `/area-map${pathname}`
      pathname = rewritePath
    }
  } else if (isHomeDecorHost(host)) {
    if (
      !pathname.startsWith('/home-decor') &&
      !pathname.startsWith('/_next') &&
      !pathname.startsWith('/api')
    ) {
      rewritePath = pathname === '/' ? '/home-decor' : `/home-decor${pathname}`
      pathname = rewritePath
    }
  } else if (isSatbaraHost(host)) {
    if (
      !pathname.startsWith('/satbara') &&
      !pathname.startsWith('/_next') &&
      !pathname.startsWith('/api')
    ) {
      rewritePath = pathname === '/' ? '/satbara' : `/satbara${pathname}`
      pathname = rewritePath
    }
  } else if (isPassportPhotoHost(host)) {
    if (
      !pathname.startsWith('/passport-photo') &&
      !pathname.startsWith('/_next') &&
      !pathname.startsWith('/api')
    ) {
      rewritePath = pathname === '/' ? '/passport-photo' : `/passport-photo${pathname}`
      pathname = rewritePath
    }
  }

  let supabaseResponse = NextResponse.next({
    request: {
      headers: (() => {
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set('x-pathname', pathname)
        return requestHeaders
      })(),
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          const requestHeaders = new Headers(request.headers)
          requestHeaders.set('x-pathname', pathname)
          supabaseResponse = NextResponse.next({
            request: { headers: requestHeaders },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Stateless tools - no login required
  const publicToolPaths = [
    '/tools/pdf-converter',
    '/tools/character-counter',
    '/tools/json-formatter',
    '/tools/smart-image-resizer',
    '/tools/business-card',
    '/tools/resize-image-without-cropping',
    '/tools/resize-image-to-square',
    '/tools/resize-image-for-instagram',
    '/tools/resize-image-for-youtube-thumbnail',
    '/tools/regex-explainer',
    '/tools/sip-swp',
    '/resume-builder',
    '/uk-tax-calculator',
    '/area-map',
    '/home-decor',
    '/satbara',
    '/passport-photo',
  ]
  const isPublicTool = publicToolPaths.some(path =>
    pathname === path || pathname.startsWith(path + '/')
  )

  // Protected routes (excluding public tools)
  const protectedRoutes = ['/dashboard', '/admin', '/super-admin']
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )
  const isProtectedTool = pathname.startsWith('/tools') && !isPublicTool

  // Redirect to login if accessing protected route without auth
  if ((isProtectedRoute || isProtectedTool) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Admin routes and banned check: fetch profile once for protected routes
  const isAdminRoute = pathname.startsWith('/admin')
  if ((isProtectedRoute || isAdminRoute) && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, banned')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'user'
    const banned = profile?.banned === true

    if (banned) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    if (isAdminRoute && !ADMIN_ROLES.includes(role)) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // Redirect if logged in and accessing login/signup (prefer ?next= post-login destination)
  if (user && (pathname === '/login' || pathname === '/signup')) {
    const dest = safePostLoginPath(request.nextUrl.searchParams.get('next')) || '/dashboard'
    const url = new URL(dest, request.nextUrl.origin)
    return NextResponse.redirect(url)
  }

  if (rewritePath) {
    const url = request.nextUrl.clone()
    url.pathname = rewritePath
    const rewriteHeaders = new Headers(request.headers)
    rewriteHeaders.set('x-pathname', rewritePath)
    const rewriteResponse = NextResponse.rewrite(url, {
      request: { headers: rewriteHeaders },
    })
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      rewriteResponse.cookies.set(cookie.name, cookie.value)
    })
    return rewriteResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
