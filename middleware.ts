import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ADMIN_ROLES = ['admin', 'super_admin', 'support']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
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
          supabaseResponse = NextResponse.next({
            request,
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
  const publicToolPaths = ['/tools/character-counter', '/tools/business-card']
  const isPublicTool = publicToolPaths.some(path =>
    request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path + '/')
  )

  // Protected routes (excluding public tools)
  const protectedRoutes = ['/dashboard', '/admin', '/super-admin']
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )
  const isProtectedTool = request.nextUrl.pathname.startsWith('/tools') && !isPublicTool

  // Redirect to login if accessing protected route without auth
  if ((isProtectedRoute || isProtectedTool) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Admin routes and banned check: fetch profile once for protected routes
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
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

  // Redirect to dashboard if logged in and accessing login/signup
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
