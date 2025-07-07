// /app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Now session.user is guaranteed to exist
    console.log('User signed out:', session.user.address)
    
    // You could also invalidate nonces, clear cache, etc.
    // await invalidateNonce(session.user.address)
    
    const response = NextResponse.json({ success: true })
    
    // Clear NextAuth cookies
    response.cookies.set('next-auth.session-token', '', {
      path: '/',
      expires: new Date(0),
      httpOnly: true,
      sameSite: 'lax'
    })
    
    response.cookies.set('__Secure-next-auth.session-token', '', {
      path: '/',
      expires: new Date(0),
      httpOnly: true,
      sameSite: 'lax',
      secure: true
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}