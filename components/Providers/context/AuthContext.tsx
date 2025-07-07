import { createContext, useContext, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import type { Session } from 'next-auth'
import { useAccount } from 'wagmi'
type AuthUser = {
  name?: string | null
  email?: string | null
  image?: string | null
  isAdmin?: boolean
}

// Extend the Session type to include isAdmin on user
declare module 'next-auth' {
  interface User {
    address: string
    isAdmin?: boolean
  }
  interface Session {
    user?: {
      address: string
      isAdmin?: boolean
    }
  }
}


export const AuthContext = createContext<{
  user: AuthUser | null
  isAdmin: boolean
  status: 'loading' | 'authenticated' | 'unauthenticated'
}>({
  user: null,
  isAdmin: false,
  status: 'loading'
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession()
  const { address, isDisconnected } = useAccount()
  
  // Auto-logout if wallet disconnects
  useEffect(() => {
    if (isDisconnected && status === 'authenticated') {
      signOut()
    }
  }, [isDisconnected, status])

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        isAdmin: session?.user?.isAdmin || false,
        status
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)