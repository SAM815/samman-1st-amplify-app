'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, signOut, fetchUserAttributes } from 'aws-amplify/auth'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '@/amplify/data/resource'
import Navbar from '@/components/layout/Navbar'
import { User } from '@/types'
import outputs from '@/amplify_outputs.json'
import { Amplify } from 'aws-amplify'

Amplify.configure(outputs)

const client = generateClient<Schema>()

// Helper function to get a user-friendly display name
const getDisplayName = (attributes: any, user: User | null): string => {
  // If there's a preferred username, use it
  if (attributes?.preferred_username) {
    return attributes.preferred_username
  }
  
  // If user has an email, create a display name from email
  if (user?.email) {
    const emailPrefix = user.email.split('@')[0]
    return emailPrefix
  }
  
  // If username is not a UUID (doesn't contain hyphens and isn't 36 chars), use it
  if (user?.username && !isUUID(user.username)) {
    return user.username
  }
  
  // Default fallback
  return 'User'
}

// Helper function to check if a string is a UUID
const isUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [attributes, setAttributes] = useState<any>(null)
  const [stats, setStats] = useState({
    posts: 0,
    comments: 0,
    likes: 0
  })
  const [refreshingStats, setRefreshingStats] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [])

  // Auto-refresh stats when page gains focus
  useEffect(() => {
    const handleFocus = () => {
      if (!loading && !refreshingStats) {
        loadUserStats()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [loading, refreshingStats])

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
      
      // Fetch user statistics
      await loadUserStats()
      
      setLoading(false)
    } catch (error) {
      router.push('/login')
    }
  }

  const loadUserStats = async () => {
    try {
      setRefreshingStats(true)
      const currentUser = await getCurrentUser()
      
      let userPosts: any[] = []
      let userComments: any[] = []
      
      try {
        // Get user's posts
        const postsResult = await client.models.AnimeBlogPost.list({
          filter: {
            owner: { eq: currentUser.userId }
          }
        })
        userPosts = postsResult.data || []
      } catch (postsError) {
        console.warn('Error fetching posts:', postsError)
      }
      
      try {
        // Get user's comments
        const commentsResult = await client.models.Comment.list({
          filter: {
            owner: { eq: currentUser.userId }
          }
        })
        userComments = commentsResult.data || []
      } catch (commentsError) {
        console.warn('Error fetching comments:', commentsError)
      }
      
      // Calculate total likes on user's posts (safely)
      const totalLikes = userPosts.reduce((sum: number, post: any) => {
        const likesCount = post?.likesCount || 0
        return sum + (typeof likesCount === 'number' ? likesCount : 0)
      }, 0)
      
      setStats({
        posts: userPosts.length,
        comments: userComments.length,
        likes: totalLikes
      })
    } catch (error) {
      console.error('Error loading user stats:', error)
      // Set default values on error
      setStats({
        posts: 0,
        comments: 0,
        likes: 0
      })
    } finally {
      setRefreshingStats(false)
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
                {getDisplayName(attributes, user).charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{getDisplayName(attributes, user)}</h2>
              <p className="text-gray-400">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Account Information</h3>
              <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Username:</span>
                  <span className="text-white font-mono text-sm">{getDisplayName(attributes, user)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Email Verified:</span>
                  <span className="text-white">{attributes?.email_verified ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-white">Statistics</h3>
                <button
                  onClick={loadUserStats}
                  disabled={refreshingStats}
                  className="text-purple-400 hover:text-purple-300 disabled:text-gray-500 transition-colors text-sm"
                  title="Refresh statistics"
                >
                  {refreshingStats ? 'Updating...' : 'Refresh'}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-purple-400">{stats.posts}</div>
                  <div className="text-gray-400 text-sm">Posts</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-purple-400">{stats.comments}</div>
                  <div className="text-gray-400 text-sm">Comments</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-purple-400">{stats.likes}</div>
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