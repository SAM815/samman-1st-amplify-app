'use client'

import { useState, useEffect } from 'react'
import { X, Heart, MessageCircle, Star, Calendar, Clock, User, Bookmark } from 'lucide-react'
import CommentSection from './CommentSection'

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
  isLikedByUser?: boolean
  isUserPost?: boolean
}

interface BlogPostModalProps {
  isOpen: boolean
  onClose: () => void
  post: BlogPost | null
  onLike?: (postId: string, isCurrentlyLiked: boolean) => void
  onCommentCountChange?: (postId: string, newCount: number) => void
}

export default function BlogPostModal({ isOpen, onClose, post, onLike, onCommentCountChange }: BlogPostModalProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [commentCount, setCommentCount] = useState(0)

  useEffect(() => {
    if (post) {
      setIsBookmarked(false)
      setCommentCount(post.comments)
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
    if (onLike && post && !post.isUserPost) {
      onLike(post.id, post.isLikedByUser || false)
    }
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
  }

  const handleCommentCountUpdate = (newCount: number) => {
    setCommentCount(newCount)
    if (onCommentCountChange && post) {
      onCommentCountChange(post.id, newCount)
    }
  }

  if (!isOpen || !post) return null

  // Use the actual post content, not mock content
  const fullContent = post.fullContent || post.excerpt.replace('...', '')

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
            {post.coverImage ? (
              <img 
                src={post.coverImage} 
                alt={post.title}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-700">
                <div className="text-center text-gray-400">
                  <div className="text-6xl mb-4">📷</div>
                  <div className="text-lg">No Image</div>
                </div>
              </div>
            )}
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
                  disabled={post.isUserPost}
                  className={`flex items-center space-x-2 transition-colors ${
                    post.isUserPost 
                      ? 'text-gray-500 cursor-not-allowed' 
                      : post.isLikedByUser 
                        ? 'text-red-500' 
                        : 'text-gray-400 hover:text-red-500'
                  }`}
                  title={post.isUserPost ? "You can't like your own post" : (post.isLikedByUser ? "Unlike" : "Like")}
                >
                  <Heart className={`w-6 h-6 ${post.isLikedByUser && !post.isUserPost ? 'fill-current' : ''}`} />
                  <span className="font-medium">{post.likes}</span>
                </button>
                
                <div className="flex items-center space-x-2 text-gray-400">
                  <MessageCircle className="w-6 h-6" />
                  <span className="font-medium">{commentCount}</span>
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

            {/* Comments section */}
            <div className="mt-12 pt-8 border-t border-gray-700">
              <CommentSection 
                postId={post.id} 
                onCommentCountChange={handleCommentCountUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}