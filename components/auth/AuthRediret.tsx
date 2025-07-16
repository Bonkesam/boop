// components/auth/AuthRedirect.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useAccount } from 'wagmi'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthRedirect() {
  const { data: session, status } = useSession()
  const { address, isConnected } = useAccount()
  const router = useRouter()

  useEffect(() => {
    // Only redirect if we have a proper session AND wallet connection
    if (session && isConnected && address && session.user.address === address) {
      const isAdmin = session.user.isAdmin
      const redirectUrl = isAdmin ? '/admin' : '/dashboard'
      
      console.log('Redirecting authenticated user to:', redirectUrl)
      router.push(redirectUrl)
    }
  }, [session, isConnected, address, router])

  // This component doesn't render anything
  return null
}