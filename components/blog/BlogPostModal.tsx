'use client'

import { useState, useEffect } from 'react'
import { X, Heart, MessageCircle, Star, Calendar, Clock, User, Bookmark } from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  fullContent?: string
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
}

interface BlogPostModalProps {
  isOpen: boolean
  onClose: () => void
  post: BlogPost | null
}

export default function BlogPostModal({ isOpen, onClose, post }: BlogPostModalProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  useEffect(() => {
    if (post) {
      setLikeCount(post.likes)
      setIsLiked(false) // Reset state when post changes
      setIsBookmarked(false)
    }
  }, [post])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
  }

  if (!isOpen || !post) return null

  // Mock full content - in a real app, this would come from the API
  const fullContent = post.fullContent || `
    ${post.excerpt}
    
    This is where the full blog post content would appear. In a real application, this would be fetched from your backend API or database.
    
    The author ${post.author.name} has written an in-depth analysis of ${post.animeName}, giving it a rating of ${post.rating}/10.
    
    This detailed review covers various aspects of the anime including:
    - Character development and storytelling
    - Animation quality and visual design
    - Music and sound design
    - Overall impact and themes
    
    Whether you're a longtime fan or new to the series, this review provides valuable insights into what makes ${post.animeName} worth watching.
  `

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header with close button */}
        <div className="sticky top-0 z-10 bg-gray-800/95 backdrop-blur border-b border-gray-700 p-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-gray-700 hover:bg-gray-600 rounded-full text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Cover Image */}
          <div className="relative h-64 md:h-80 bg-gray-800">
            <img 
              src={post.coverImage} 
              alt={post.title}
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-800/60 via-transparent to-transparent"></div>
            
            {/* Rating badge */}
            <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full font-bold text-sm flex items-center space-x-1">
              <Star className="w-4 h-4 fill-current" />
              <span>{post.rating}/10</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            {/* Anime name */}
            <div className="mb-4">
              <span className="text-purple-400 font-semibold text-lg">{post.animeName}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta information */}
            <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <img 
                  src={post.author.avatar} 
                  alt={post.author.name}
                  className="w-8 h-8 rounded-full"
                />
                <span>{post.author.name}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{post.publishedAt}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{post.readTime} min read</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm hover:bg-gray-600 transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between mb-8 p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-6">
                <button 
                  onClick={handleLike}
                  className={`flex items-center space-x-2 transition-colors ${
                    isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="font-medium">{likeCount}</span>
                </button>
                
                <div className="flex items-center space-x-2 text-gray-400">
                  <MessageCircle className="w-6 h-6" />
                  <span className="font-medium">{post.comments}</span>
                </div>
              </div>
              
              <button 
                onClick={handleBookmark}
                className={`p-2 rounded-full transition-colors ${
                  isBookmarked 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Full content */}
            <div className="prose prose-lg prose-invert max-w-none">
              <div className="text-gray-200 leading-relaxed whitespace-pre-line">
                {fullContent}
              </div>
            </div>

            {/* Comments section placeholder */}
            <div className="mt-12 pt-8 border-t border-gray-700">
              <h3 className="text-xl font-bold text-white mb-6">Comments ({post.comments})</h3>
              
              {/* Comment input */}
              <div className="mb-8">
                <textarea
                  placeholder="Share your thoughts about this review..."
                  className="w-full p-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={3}
                />
                <div className="flex justify-end mt-3">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                    Post Comment
                  </button>
                </div>
              </div>

              {/* Sample comments */}
              <div className="space-y-6">
                <div className="flex space-x-4">
                  <img 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=commenter1" 
                    alt="Commenter"
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-white">AnimeWatcher2024</span>
                        <span className="text-gray-400 text-sm">2 hours ago</span>
                      </div>
                      <p className="text-gray-200">
                        Great review! I completely agree with your analysis of the character development. This anime really exceeded my expectations.
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                      <button className="hover:text-white transition-colors">Reply</button>
                      <button className="hover:text-red-400 transition-colors">❤️ 5</button>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <img 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=commenter2" 
                    alt="Commenter"
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-white">OtakuReviewer</span>
                        <span className="text-gray-400 text-sm">1 day ago</span>
                      </div>
                      <p className="text-gray-200">
                        Thanks for the spoiler-free review! Adding this to my watchlist now 📝
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                      <button className="hover:text-white transition-colors">Reply</button>
                      <button className="hover:text-red-400 transition-colors">❤️ 12</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}