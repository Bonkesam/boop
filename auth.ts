// auth.ts
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import  prisma  from '@/lib/prisma'
import { walletProvider } from '@/lib/providers'
import { invalidateNonce } from '@/lib/nonce'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [walletProvider],
  session: {
    strategy: 'jwt',
    maxAge: 12 * 60 * 60, // 12 hours
    updateAge: 15 * 60 // 15 minutes
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.address = user.address
        token.isAdmin = user.isAdmin ?? false
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          address: token.address as string,
          isAdmin: token.isAdmin as boolean
        }
      }
    },
    async signIn({ user, account, credentials }) {
      try {
        // Invalidate nonce after successful sign in
        if (credentials?.address) {
          await invalidateNonce(credentials.address as string)
        }
        return true
      } catch (error) {
        console.error('SignIn callback error:', error)
        return false
      }
    }
  },
  pages: {
    signIn: '/',
    error: '/auth-error',
  },
  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  trustHost: true,
  // Add these cookie settings
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
})