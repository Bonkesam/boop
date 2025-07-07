import { useSession } from 'next-auth/react'
// import { useRouter } from 'next/router' // No longer needed for redirect
// import { useEffect } from 'react' // No longer needed

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { status } = useSession()

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