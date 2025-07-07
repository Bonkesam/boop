import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=${encodeURIComponent(router.asPath)}`)
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Verifying authentication...</p>
      </div>
    )
  }

  if (status === 'authenticated') {
    return <>{children}</>
  }

  return null
}

export default AuthGuard