import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Allow public routes (login, register, and auth API)
  const publicRoutes = ['/login', '/register', '/api/auth']
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // For API routes, let them handle auth themselves
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  // Home page is special - it shows landing page if not authenticated
  // So we allow it through and let the component handle the display
  if (pathname === '/') {
    return NextResponse.next()
  }
  
  // All other page routes require authentication
  // Check for NextAuth session cookie
  const sessionToken = request.cookies.get('authjs.session-token') || 
                       request.cookies.get('__Secure-authjs.session-token')
  
  if (!sessionToken) {
    // Redirect to login, preserving the intended destination
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}

