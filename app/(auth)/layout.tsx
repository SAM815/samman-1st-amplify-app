'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from 'aws-amplify/auth'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      await getCurrentUser()
      router.push('/home')
    } catch {
      // User is not authenticated, stay on auth pages
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {children}
    </div>
  )
}