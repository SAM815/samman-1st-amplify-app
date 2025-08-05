'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from 'aws-amplify/auth'
import Navbar from '@/components/layout/Navbar'
import { MessageSquare } from 'lucide-react'

export default function MessagesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      await getCurrentUser()
      setLoading(false)
    } catch (error) {
      router.push('/login')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8 flex items-center gap-3">
          <MessageSquare className="w-10 h-10 text-purple-500" />
          Messages
        </h1>
        
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No messages yet</h3>
            <p className="text-gray-400">
              The messaging feature is coming soon. You'll be able to connect with other anime fans directly!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}