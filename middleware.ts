import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/admin',
  '/profile'
]

// Admin-only routes
const adminRoutes = [
  '/admin'
]

// Public routes that don't need authentication
const publicRoutes = [
  '/',
  '/auth-error',
  '/unauthorized'
]

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  
  // Skip API routes, static files, and public routes
  if (
    path.startsWith('/api') ||
    path.startsWith('/_next') ||
    path.startsWith('/favicon') ||
    publicRoutes.includes(path)
  ) {
    return NextResponse.next()
  }

  // Get the token
  const token = await getToken({ 
    req, 
    secret: process.env.AUTH_SECRET,
    // Add these cookie options to match NextAuth's configuration
    cookieName: process.env.NODE_ENV === 'production' 
      ? '__Secure-next-auth.session-token' 
      : 'next-auth.session-token',
    secureCookie: process.env.NODE_ENV === 'production'
  })
  
  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  
  if (isProtectedRoute) {
    // If no token, redirect to login
    if (!token) {
      const url = new URL('/', req.url)
      // Don't add callbackUrl for the root path to avoid loops
      if (path !== '/') {
        url.searchParams.set('callbackUrl', path)
      }
      return NextResponse.redirect(url)
    }
    
    // Check admin access for admin routes
    if (adminRoutes.some(route => path.startsWith(route))) {
      if (!token.isAdmin) {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }
  }
  
  return NextResponse.next()
}

// Updated matcher to include root path
export const config = {
  matcher: [
    '/', // Added root path
    '/dashboard/:path*',
    '/admin/:path*',
    '/profile/:path*'
  ]
}