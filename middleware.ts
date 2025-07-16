// middleware.ts
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
  '/unauthorized',
  '/api/auth'
]

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  
  // Skip API routes, static files, and specific public routes
  if (
    path.startsWith('/api') ||
    path.startsWith('/_next') ||
    path.startsWith('/favicon') ||
    path.startsWith('/static') ||
    publicRoutes.includes(path) ||
    path.includes('.') // Skip files with extensions
  ) {
    return NextResponse.next()
  }

  // Get the token
  const token = await getToken({ 
    req, 
    secret: process.env.AUTH_SECRET,
    cookieName: process.env.NODE_ENV === 'production' 
      ? '__Secure-next-auth.session-token' 
      : 'next-auth.session-token',
    secureCookie: process.env.NODE_ENV === 'production'
  })
  
  console.log('Middleware - Path:', path, 'Token:', !!token, 'IsAdmin:', token?.isAdmin)
  
  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  
  if (isProtectedRoute) {
    // If no token, redirect to home page for authentication
    if (!token) {
      console.log('No token found, redirecting to home')
      const url = new URL('/', req.url)
      // Add callbackUrl to remember where they wanted to go
      if (path !== '/') {
        url.searchParams.set('callbackUrl', path)
      }
      return NextResponse.redirect(url)
    }
    
    // Check admin access for admin routes
    if (adminRoutes.some(route => path.startsWith(route))) {
      if (!token.isAdmin) {
        console.log('Non-admin user trying to access admin route, redirecting to unauthorized')
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }
  }
  
  // REMOVED: Special handling for root path when authenticated
  // Let the React component handle the authentication flow
  // This allows users to visit the login page even when authenticated
  // if (path === '/' && token) {
  //   if (token.isAdmin) {
  //     return NextResponse.redirect(new URL('/admin', req.url))
  //   } else {
  //     return NextResponse.redirect(new URL('/dashboard', req.url))
  //   }
  // }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all routes except static files and API routes
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ]
}