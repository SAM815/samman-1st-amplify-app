'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from 'aws-amplify/auth'
import Navbar from '@/components/layout/Navbar'
import BlogPostCard from '@/components/blog/BlogPostCard'
import BlogPostModal from '@/components/blog/BlogPostModal'
import AnimeQuotes from '@/components/home/AnimeQuotes'
import { PenSquare, BookOpen, TrendingUp, Clock, Filter } from 'lucide-react'

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
}

const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Why Attack on Titan\'s Final Season is a Masterpiece',
    excerpt: 'An in-depth analysis of the storytelling, character development, and thematic brilliance that makes the final season of Attack on Titan one of the greatest anime conclusions ever...',
    author: {
      name: 'Sarah Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
    },
    animeName: 'Attack on Titan',
    rating: 10,
    coverImage: 'https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=800&h=400&fit=crop',
    tags: ['Analysis', 'Shonen', 'Dark Fantasy', 'Character Study'],
    publishedAt: '2 days ago',
    readTime: 12,
    likes: 342,
    comments: 67
  },
  {
    id: '2',
    title: 'The Philosophy of Death Note: Light vs L',
    excerpt: 'Exploring the moral complexities and philosophical debates at the heart of Death Note. Is Light a hero or villain? Let\'s dive deep into the psychology of these genius characters...',
    author: {
      name: 'Alex Kumar',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
    },
    animeName: 'Death Note',
    rating: 9,
    coverImage: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800&h=400&fit=crop',
    tags: ['Psychological', 'Thriller', 'Philosophy', 'Review'],
    publishedAt: '1 week ago',
    readTime: 15,
    likes: 523,
    comments: 128
  },
  {
    id: '3',
    title: 'One Piece Episode 1000: A Journey Worth Taking',
    excerpt: 'Celebrating 1000 episodes of adventure, friendship, and dreams. From East Blue to Wano, here\'s why One Piece remains the king of long-running shonen anime...',
    author: {
      name: 'Maria Rodriguez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria'
    },
    animeName: 'One Piece',
    rating: 9,
    coverImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&h=400&fit=crop',
    tags: ['Adventure', 'Shonen', 'Milestone', 'Review'],
    publishedAt: '3 days ago',
    readTime: 8,
    likes: 891,
    comments: 234
  },
  {
    id: '4',
    title: 'Demon Slayer: The Art of Visual Storytelling',
    excerpt: 'How Ufotable\'s stunning animation and Koyoharu Gotouge\'s emotional narrative combine to create one of the most visually spectacular anime of the decade...',
    author: {
      name: 'James Wilson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James'
    },
    animeName: 'Demon Slayer',
    rating: 8,
    coverImage: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=400&fit=crop',
    tags: ['Animation', 'Action', 'Visual Analysis', 'Ufotable'],
    publishedAt: '5 days ago',
    readTime: 10,
    likes: 456,
    comments: 89
  },
  {
    id: '5',
    title: 'My Hero Academia: Deku\'s Journey from Zero to Hero',
    excerpt: 'Tracking the incredible character development of Izuku Midoriya and how his journey embodies the true meaning of heroism in modern anime...',
    author: {
      name: 'Emily Zhang',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily'
    },
    animeName: 'My Hero Academia',
    rating: 8,
    coverImage: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=800&h=400&fit=crop',
    tags: ['Superhero', 'Character Development', 'Shonen', 'Review'],
    publishedAt: '1 day ago',
    readTime: 11,
    likes: 267,
    comments: 45
  },
  {
    id: '6',
    title: 'Steins;Gate: A Time Travel Masterpiece Explained',
    excerpt: 'Breaking down the complex timeline, scientific concepts, and emotional core of Steins;Gate. Why this anime stands as the pinnacle of sci-fi storytelling...',
    author: {
      name: 'David Park',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David'
    },
    animeName: 'Steins;Gate',
    rating: 10,
    coverImage: 'https://images.unsplash.com/photo-1533709752211-118fcaf03312?w=800&h=400&fit=crop',
    tags: ['Sci-Fi', 'Time Travel', 'Analysis', 'Thriller'],
    publishedAt: '4 days ago',
    readTime: 18,
    likes: 612,
    comments: 156
  }
]

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [userPosts, setUserPosts] = useState<BlogPost[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const user = await getCurrentUser()
      setUserName(user.username)
      // Mock user posts - in real app, fetch from backend
      setUserPosts([]) // Empty for now to show empty state
      setLoading(false)
    } catch (error) {
      router.push('/login')
    }
  }

  const allTags = ['all', ...Array.from(new Set(mockBlogPosts.flatMap(post => post.tags)))]

  const filteredPosts = mockBlogPosts
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
                <BlogPostCard key={post.id} {...post} onClick={() => handlePostClick(post)} />
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
              <BlogPostCard key={post.id} {...post} onClick={() => handlePostClick(post)} />
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
      />
    </div>
  )
}