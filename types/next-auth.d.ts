// types/auth.d.ts
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    address: string
    isAdmin: boolean
    name?: string | null
    email?: string | null
    image?: string | null
  }
  
  interface Session {
    user: {
      id: string
      address: string
      isAdmin: boolean
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    address: string
    isAdmin: boolean
  }
}