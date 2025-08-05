'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth'
import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/api'
import outputs from '@/amplify_outputs.json'
import type { Schema } from '@/amplify/data/resource'
import Navbar from '@/components/layout/Navbar'
import BlogPostCard from '@/components/blog/BlogPostCard'
import BlogPostModal from '@/components/blog/BlogPostModal'
import AnimeQuotes from '@/components/home/AnimeQuotes'
import { PenSquare, BookOpen, TrendingUp, Clock, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

// Configure Amplify
Amplify.configure(outputs)

// Generate the client after configuration
const client = generateClient<Schema>()

interface BlogPost {
  id: string
  title: string
  excerpt: string
  author: {
    name: string
    avatar: string
  }
  animeName: string
  rating: number
  coverImage: string
  tags: string[]
  publishedAt: string
  readTime: number
  likes: number
  comments: number
  isUserPost?: boolean
  isLikedByUser?: boolean
}

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [userId, setUserId] = useState('')
  const [userPosts, setUserPosts] = useState<BlogPost[]>([])
  const [communityPosts, setCommunityPosts] = useState<BlogPost[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const fetchCommunityPosts = async () => {
    try {
      const user = await getCurrentUser()
      const response = await client.models.AnimeBlogPost.list({
        authMode: 'userPool'
      })
      
      // Filter out current user's posts (handle null owners and null posts)
      const otherPosts = response.data?.filter(post => post && post.owner && post.owner !== user.userId) || []
      
      // Get current user display name for anonymous posts
      const userAttributes = await fetchUserAttributes()
      const currentUserDisplayName = userAttributes.preferred_username || user.username || userAttributes.email?.split('@')[0] || 'Anonymous'
      
      // For each post, check if current user has liked it
      const postsWithLikeStatus = await Promise.all(
        otherPosts.map(async (post) => {
          // Check if user liked this post
          const userLikeResponse = await client.models.PostLike.list({
            filter: {
              postId: { eq: post.id },
              userId: { eq: user.userId }
            },
            authMode: 'userPool'
          })
          
          // Get comment count
          const commentsResponse = await client.models.Comment.list({
            filter: { postId: { eq: post.id } },
            authMode: 'userPool'
          })
          
          return {
            id: post.id,
            title: post.title || '',
            excerpt: post.content?.substring(0, 150) + '...' || '',
            fullContent: post.content || '',
            author: {
              name: post.authorName || 'Anonymous',
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorName || 'Anonymous'}`
            },
            animeName: post.anime || '',
            rating: post.rating || 0,
            coverImage: post.images?.[0] || '',
            tags: (post.tags || []).filter((tag): tag is string => tag !== null),
            publishedAt: new Date(post.createdAt || '').toLocaleDateString(),
            readTime: Math.ceil((post.content?.length || 0) / 200),
            likes: post.likesCount || 0,
            comments: commentsResponse.data?.length || 0,
            isLikedByUser: (userLikeResponse.data?.length || 0) > 0,
            isUserPost: false
          }
        })
      )
      
      setCommunityPosts(postsWithLikeStatus)
    } catch (error) {
      console.error('Error fetching community posts:', error)
    }
  }

  const handleLikePost = async (postId: string, isCurrentlyLiked: boolean) => {
    try {
      const user = await getCurrentUser()
      const userAttributes = await fetchUserAttributes()
      const displayName = userAttributes.preferred_username || user.username || userAttributes.email?.split('@')[0]
      
      if (isCurrentlyLiked) {
        // Unlike: Remove like from database
        const existingLike = await client.models.PostLike.list({
          filter: {
            postId: { eq: postId },
            userId: { eq: user.userId }
          },
          authMode: 'userPool'
        })
        
        if (existingLike.data && existingLike.data.length > 0) {
          await client.models.PostLike.delete({ id: existingLike.data[0].id }, {
            authMode: 'userPool'
          })
          
          // Update likes count
          const post = await client.models.AnimeBlogPost.get({ id: postId }, {
            authMode: 'userPool'
          })
          
          if (post.data) {
            await client.models.AnimeBlogPost.update({
              id: postId,
              likesCount: Math.max((post.data.likesCount || 0) - 1, 0)
            }, {
              authMode: 'userPool'
            })
          }
        }
      } else {
        // Like: Add like to database
        await client.models.PostLike.create({
          postId,
          userId: user.userId,
          userName: displayName || 'User'
        }, {
          authMode: 'userPool'
        })
        
        // Update likes count
        const post = await client.models.AnimeBlogPost.get({ id: postId }, {
          authMode: 'userPool'
        })
        
        if (post.data) {
          await client.models.AnimeBlogPost.update({
            id: postId,
            likesCount: (post.data.likesCount || 0) + 1
          }, {
            authMode: 'userPool'
          })
        }
      }
      
      // Refresh the posts to show updated counts
      await fetchCommunityPosts()
      
      // If it's a user post, refresh user posts too
      const isUserPost = userPosts.some(post => post.id === postId)
      if (isUserPost) {
        await fetchUserPosts()
      }
      
      // Update the selected post in modal if it's the same post
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost({
          ...selectedPost,
          likes: isCurrentlyLiked ? selectedPost.likes - 1 : selectedPost.likes + 1,
          isLikedByUser: !isCurrentlyLiked
        })
      }
      
      toast.success(isCurrentlyLiked ? 'Post unliked!' : 'Post liked!')
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error('Failed to update like')
    }
  }

  const handleDeletePost = async (postId: string) => {
    try {
      const user = await getCurrentUser()
      
      // First, delete all associated likes
      const likes = await client.models.PostLike.list({
        filter: { postId: { eq: postId } },
        authMode: 'userPool'
      })
      
      for (const like of likes.data || []) {
        await client.models.PostLike.delete({ id: like.id }, {
          authMode: 'userPool'
        })
      }
      
      // Delete all associated comments
      const comments = await client.models.Comment.list({
        filter: { postId: { eq: postId } },
        authMode: 'userPool'
      })
      
      for (const comment of comments.data || []) {
        await client.models.Comment.delete({ id: comment.id }, {
          authMode: 'userPool'
        })
      }
      
      // Finally, delete the post itself
      await client.models.AnimeBlogPost.delete({ id: postId }, {
        authMode: 'userPool'
      })
      
      // Refresh the posts
      await fetchUserPosts()
      await fetchCommunityPosts()
      
      toast.success('Post deleted successfully!')
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Failed to delete post')
    }
  }

  const fetchUserPosts = async () => {
    try {
      const user = await getCurrentUser()
      const userAttributes = await fetchUserAttributes()
      const displayName = userAttributes.preferred_username || user.username || userAttributes.email?.split('@')[0]
      
      // Get all posts and filter manually to handle any null owners
      const response = await client.models.AnimeBlogPost.list({
        authMode: 'userPool'
      })
      
      // Filter for current user's posts (handle null owners and null posts)
      const userPostsData = response.data?.filter(post => post && post.owner && post.owner === user.userId) || []
      
      // For each user post, get comment count and like status
      const postsWithCounts = await Promise.all(
        userPostsData.map(async (post) => {
          const commentsResponse = await client.models.Comment.list({
            filter: { postId: { eq: post.id } },
            authMode: 'userPool'
          })
          
          return {
            id: post.id,
            title: post.title || '',
            excerpt: post.content?.substring(0, 150) + '...' || '',
            fullContent: post.content || '',
            author: {
              name: post.authorName || displayName || 'Anonymous',
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorName || displayName || 'Anonymous'}`
            },
            animeName: post.anime || '',
            rating: post.rating || 0,
            coverImage: post.images?.[0] || '',
            tags: (post.tags || []).filter((tag): tag is string => tag !== null),
            publishedAt: new Date(post.createdAt || '').toLocaleDateString(),
            readTime: Math.ceil((post.content?.length || 0) / 200),
            likes: post.likesCount || 0,
            comments: commentsResponse.data?.length || 0,
            isUserPost: true,
            isLikedByUser: false // User can't like their own posts
          }
        })
      )
      
      setUserPosts(postsWithCounts)
    } catch (error) {
      console.error('Error fetching user posts:', error)
      toast.error('Failed to load your posts')
    }
  }

  const checkAuth = async () => {
    try {
      const user = await getCurrentUser()
      const userAttributes = await fetchUserAttributes()
      
      // Use actual username from preferred_username
      const displayName = userAttributes.preferred_username || user.username || userAttributes.email?.split('@')[0]
      setUserName(displayName || 'User')
      setUserId(user.userId || '')
      
      // Fetch user posts with proper counts
      await fetchUserPosts()
      
      // Fetch community posts
      await fetchCommunityPosts()
      
      setLoading(false)
    } catch (error) {
      router.push('/login')
    }
  }

  const allTags = ['all', ...Array.from(new Set(communityPosts.flatMap(post => post.tags)))]

  const filteredPosts = communityPosts
    .filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.animeName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesTag = selectedTag === 'all' || post.tags.includes(selectedTag)
      return matchesSearch && matchesTag
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return b.likes - a.likes
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'comments') return b.comments - a.comments
      return 0 // recent (default order)
    })

  const handlePostClick = (post: BlogPost) => {
    setSelectedPost(post)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedPost(null)
  }

  const handleCommentCountChange = (postId: string, newCount: number) => {
    // Update the selected post in modal
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({
        ...selectedPost,
        comments: newCount
      })
    }
    
    // Update the post in the respective arrays
    setUserPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId ? { ...post, comments: newCount } : post
      )
    )
    
    setCommunityPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId ? { ...post, comments: newCount } : post
      )
    )
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
        {/* Anime Quotes Section */}
        <div className="mb-12">
          <AnimeQuotes />
        </div>

        {/* Create Post Button */}
        <div className="mb-12 flex justify-center">
          <button
            onClick={() => router.push('/create')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-3"
          >
            <PenSquare className="w-6 h-6" />
            <span className="text-lg">Create New Post</span>
          </button>
        </div>

        {/* Your Posts Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <BookOpen className="w-6 h-6 mr-2" />
              Your Posts
            </h2>
            {userPosts.length > 0 && (
              <Link href="/profile" className="text-purple-400 hover:text-purple-300 text-sm">
                View all →
              </Link>
            )}
          </div>

          {userPosts.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PenSquare className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
                <p className="text-gray-400 mb-6">
                  Start sharing your anime thoughts with the community! Your first post is just a click away.
                </p>
                <button
                  onClick={() => router.push('/create')}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors inline-flex items-center space-x-2"
                >
                  <PenSquare className="w-5 h-5" />
                  <span>Write Your First Post</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPosts.map((post) => (
                <BlogPostCard 
                  key={post.id} 
                  {...post} 
                  onLike={handleLikePost}
                  onDelete={handleDeletePost}
                  onClick={() => handlePostClick(post)} 
                />
              ))}
            </div>
          )}
        </section>

        {/* Community Posts Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <TrendingUp className="w-6 h-6 mr-2" />
              Community Posts
            </h2>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1 max-w-xl">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search posts, anime titles, or authors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-10 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>
                      {tag === 'all' ? 'All Categories' : tag}
                    </option>
                  ))}
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="comments">Most Discussed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <BlogPostCard 
                key={post.id} 
                {...post} 
                onLike={handleLikePost}
                onDelete={handleDeletePost}
                onClick={() => handlePostClick(post)} 
              />
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No posts found matching your criteria.</p>
              <button 
                onClick={() => {
                  setSearchTerm('')
                  setSelectedTag('all')
                }}
                className="mt-4 text-purple-400 hover:text-purple-300 underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Blog Post Modal */}
      <BlogPostModal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
        post={selectedPost}
        onLike={handleLikePost}
        onCommentCountChange={handleCommentCountChange}
      />
    </div>
  )
}