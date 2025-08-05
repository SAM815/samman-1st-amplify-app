'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Send, Trash2 } from 'lucide-react'
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth'
import { generateClient } from 'aws-amplify/api'
import type { Schema } from '@/amplify/data/resource'
import toast from 'react-hot-toast'

const client = generateClient<Schema>()

// Helper function to check if a string is a UUID
const isUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

// Helper function to get a user-friendly display name
const getDisplayName = (attributes: any, user: any): string => {
  // If there's a preferred username, use it
  if (attributes?.preferred_username) {
    return attributes.preferred_username
  }
  
  // If user has an email, create a display name from email
  if (attributes?.email) {
    const emailPrefix = attributes.email.split('@')[0]
    return emailPrefix
  }
  
  // If username is not a UUID, use it
  if (user?.username && !isUUID(user.username)) {
    return user.username
  }
  
  // Default fallback
  return 'User'
}

interface Comment {
  id: string
  content: string
  authorName: string
  createdAt: string
  owner: string
  replies?: Comment[]
}

interface CommentSectionProps {
  postId: string
  onCommentCountChange?: (count: number) => void
}

export default function CommentSection({ postId, onCommentCountChange }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentUserId, setCurrentUserId] = useState('')

  useEffect(() => {
    initializeComponent()
  }, [postId])

  const initializeComponent = async () => {
    try {
      const user = await getCurrentUser()
      setCurrentUserId(user.userId)
      await fetchComments()
    } catch (error) {
      console.error('Error initializing comment section:', error)
    }
  }

  const fetchComments = async () => {
    try {
      setLoading(true)
      const response = await client.models.Comment.list({
        filter: { 
          postId: { eq: postId },
          parentId: { attributeExists: false } // Only get top-level comments
        },
        authMode: 'userPool'
      })

      const commentsData = response.data || []
      
      // Sort by creation date (newest first)
      const sortedComments = commentsData
        .map(comment => ({
          id: comment.id,
          content: comment.content || '',
          authorName: comment.authorName || 'Anonymous',
          createdAt: comment.createdAt || '',
          owner: comment.owner || ''
        }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      setComments(sortedComments)
      
      // Update parent component with comment count
      if (onCommentCountChange) {
        onCommentCountChange(sortedComments.length)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast.error('Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    try {
      setSubmitting(true)
      const user = await getCurrentUser()
      const userAttributes = await fetchUserAttributes()
      const displayName = getDisplayName(userAttributes, user)

      await client.models.Comment.create({
        content: newComment.trim(),
        postId,
        authorName: displayName
      }, {
        authMode: 'userPool'
      })

      // Update comment count on the post
      const post = await client.models.AnimeBlogPost.get({ id: postId }, {
        authMode: 'userPool'
      })
      
      if (post.data) {
        await client.models.AnimeBlogPost.update({
          id: postId,
          commentsCount: (post.data.commentsCount || 0) + 1
        }, {
          authMode: 'userPool'
        })
      }

      setNewComment('')
      await fetchComments()
      toast.success('Comment added!')
    } catch (error) {
      console.error('Error submitting comment:', error)
      toast.error('Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await client.models.Comment.delete({ id: commentId }, {
        authMode: 'userPool'
      })

      // Update comment count on the post
      const post = await client.models.AnimeBlogPost.get({ id: postId }, {
        authMode: 'userPool'
      })
      
      if (post.data) {
        await client.models.AnimeBlogPost.update({
          id: postId,
          commentsCount: Math.max((post.data.commentsCount || 0) - 1, 0)
        }, {
          authMode: 'userPool'
        })
      }

      await fetchComments()
      toast.success('Comment deleted!')
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('Failed to delete comment')
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-gray-300">
        <MessageCircle className="w-5 h-5" />
        <h3 className="text-lg font-semibold">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Add Comment Form */}
      <div className="bg-gray-700 rounded-lg p-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts about this post..."
          className="w-full bg-gray-600 text-white rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows={3}
          maxLength={500}
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-sm text-gray-400">
            {newComment.length}/500 characters
          </span>
          <button
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || submitting}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Posting...' : 'Post Comment'}</span>
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-400">Loading comments...</div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400">No comments yet.</p>
            <p className="text-gray-500 text-sm">Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.authorName}`}
                      alt={comment.authorName}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <span className="font-medium text-white">{comment.authorName}</span>
                      <span className="text-gray-400 text-sm ml-2">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
                
                {comment.owner === currentUserId && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors ml-2"
                    title="Delete comment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}