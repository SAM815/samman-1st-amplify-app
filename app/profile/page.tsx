'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, signOut, fetchUserAttributes } from 'aws-amplify/auth'
import Navbar from '@/components/layout/Navbar'
import { User } from '@/types'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [attributes, setAttributes] = useState<any>(null)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const currentUser = await getCurrentUser()
      const userAttributes = await fetchUserAttributes()
      
      setUser({
        id: currentUser.userId,
        email: userAttributes.email || '',
        username: currentUser.username,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      setAttributes(userAttributes)
      setLoading(false)
    } catch (error) {
      router.push('/login')
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
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
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Profile</h1>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-6 mb-6">
            <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-3xl font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user?.username || 'User'}</h2>
              <p className="text-gray-400">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Account Information</h3>
              <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">User ID:</span>
                  <span className="text-white font-mono text-sm">{user?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Email Verified:</span>
                  <span className="text-white">{attributes?.email_verified ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-2">Statistics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-purple-400">0</div>
                  <div className="text-gray-400 text-sm">Posts</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-purple-400">0</div>
                  <div className="text-gray-400 text-sm">Comments</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-purple-400">0</div>
                  <div className="text-gray-400 text-sm">Likes</div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleSignOut}
                className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}