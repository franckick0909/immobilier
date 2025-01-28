'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: {
    adminOnly?: boolean
  }
) {
  return function ProtectedRoute(props: P) {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
      if (status === 'loading') return

      if (!session) {
        router.push('/auth/login')
      } else if (options?.adminOnly && session.user.role !== 'ADMIN') {
        router.push('/dashboard')
      }
    }, [session, status, router])

    if (status === 'loading') {
      return <div>Chargement...</div>
    }

    if (!session) {
      return null
    }

    if (options?.adminOnly && session.user.role !== 'ADMIN') {
      return null
    }

    return <WrappedComponent {...props} />
  }
}