'use client'

import { useState, useRef, useEffect } from 'react'
import { Heart, MessageCircle, BookOpen, Clock, Star, Trash2, MoreVertical } from 'lucide-react'

interface BlogPostCardProps {
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
  isLikedByUser?: boolean
  isUserPost?: boolean
  onLike?: (postId: string, isCurrentlyLiked: boolean) => void
  onDelete?: (postId: string) => void
  onClick?: () => void
}

export default function BlogPostCard({
  id,
  title,
  excerpt,
  author,
  animeName,
  rating,
  coverImage,
  tags,
  publishedAt,
  readTime,
  likes,
  comments,
  isLikedByUser = false,
  isUserPost = false,
  onLike,
  onDelete,
  onClick,
}: BlogPostCardProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    if (onLike && !isUserPost) {
      onLike(id, isLikedByUser)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    if (onDelete && isUserPost) {
      if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        onDelete(id)
      }
    }
    setShowDropdown(false)
  }

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    setShowDropdown(!showDropdown)
  }

  return (
    <article 
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer"
      onClick={onClick}
    >
      <div className="relative h-48 md:h-56 bg-gray-700">
        {coverImage ? (
          <img 
            src={coverImage} 
            alt={title}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-700">
            <div className="text-center text-gray-400">
              <div className="text-4xl mb-2">📷</div>
              <div className="text-sm">No Image</div>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-800/80 via-transparent to-transparent"></div>
        <div className="absolute top-3 right-3 flex items-center space-x-2">
          <div className="bg-purple-600 text-white px-3 py-1 rounded-full font-bold text-sm flex items-center space-x-1">
            <Star className="w-4 h-4" />
            <span>{rating}/10</span>
          </div>
          
          {isUserPost && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="bg-gray-700/80 hover:bg-gray-600 text-white p-2 rounded-full transition-colors"
                title="Post options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-gray-700 rounded-lg shadow-xl border border-gray-600 py-1 z-10 min-w-[120px]">
                  <button
                    onClick={handleDelete}
                    className="w-full px-3 py-2 text-left text-red-400 hover:bg-gray-600 flex items-center space-x-2 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-purple-400 text-sm font-semibold">{animeName}</span>
          <div className="flex items-center text-gray-400 text-sm">
            <Clock className="w-4 h-4 mr-1" />
            <span>{readTime} min read</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 hover:text-purple-400 transition-colors cursor-pointer">
          {title}
        </h3>
        
        <p className="text-gray-300 mb-4 line-clamp-3">{excerpt}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.slice(0, 3).map((tag) => (
            <span 
              key={tag} 
              className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="text-xs text-gray-500">+{tags.length - 3} more</span>
          )}
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <img 
              src={author.avatar} 
              alt={author.name}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <p className="text-sm font-medium text-white">{author.name}</p>
              <p className="text-xs text-gray-400">{publishedAt}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleLike}
              disabled={isUserPost}
              className={`flex items-center space-x-1 transition-colors ${
                isUserPost 
                  ? 'text-gray-500 cursor-not-allowed' 
                  : isLikedByUser 
                    ? 'text-red-500' 
                    : 'text-gray-400 hover:text-red-500'
              }`}
              title={isUserPost ? "You can't like your own post" : (isLikedByUser ? "Unlike" : "Like")}
            >
              <Heart className={`w-5 h-5 ${isLikedByUser && !isUserPost ? 'fill-current' : ''}`} />
              <span className="text-sm">{likes}</span>
            </button>
            
            <div className="flex items-center space-x-1 text-gray-400">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">{comments}</span>
            </div>
            
            <button className="text-purple-400 hover:text-purple-300 transition-colors">
              <BookOpen className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}