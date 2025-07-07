import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import AuthGuard from './AuthGuard'

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession()
  const router = useRouter()

  if (!session?.user || !session.user.isAdmin) {
    router.push('/unauthorized')
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Redirecting...</p>
      </div>
    )
  }

  return <AuthGuard>{children}</AuthGuard>
}

export default AdminGuard