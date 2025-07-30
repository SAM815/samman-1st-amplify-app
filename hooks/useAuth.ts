'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth'
import { AuthState, User } from '@/types'

export function useAuth(redirectTo?: string) {
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>('loading')
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser()
      const attributes = await fetchUserAttributes()
      
      setUser({
        id: currentUser.userId,
        email: attributes.email || '',
        username: currentUser.username,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      setAuthState('authenticated')
    } catch {
      setAuthState('unauthenticated')
      if (redirectTo) {
        router.push(redirectTo)
      }
    }
  }

  return { authState, user, checkAuth }
}