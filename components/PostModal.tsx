'use client';

import { useEffect, useState } from 'react';
import { X, Heart, MessageCircle, Eye, Star, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { StorageImage } from '@aws-amplify/ui-react-storage';
import CommentSection from './blog/CommentSection';
import { amplifyPostsAPI } from '@/src/services/amplify-api';

interface Post {
  _id: string;
  title: string;
  content: string;
  animeName?: string;
  rating?: number;
  images?: string[];
  tags?: string[];
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  createdAt: string;
  isLiked?: boolean;
}

interface PostModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
}

export function PostModal({ post, isOpen, onClose, currentUserId }: PostModalProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (post) {
      setIsLiked(post.isLiked || false);
      setLikesCount(post.likesCount);
    }
  }, [post]);

  if (!isOpen || !post) return null;

  const handleLike = async () => {
    if (!currentUserId) return;
    
    try {
      await amplifyPostsAPI.toggleLike(post._id);
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {post.title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
            <div className="p-6">
              {/* Anime Info */}
              {post.animeName && (
                <div className="mb-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Anime: </span>
                  <span className="text-lg font-medium text-purple-600 dark:text-purple-400">
                    {post.animeName}
                  </span>
                  {post.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      {renderStars(post.rating)}
                    </div>
                  )}
                </div>
              )}

              {/* Images */}
              {post.images && post.images.length > 0 && (
                <div className="mb-6">
                  <div className={`grid ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                    {post.images.map((image, index) => (
                      <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <StorageImage
                          path={image}
                          alt={`Post image ${index + 1}`}
                          className="w-full h-full object-cover"
                          fallbackSrc="/placeholder-image.svg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="prose dark:prose-invert max-w-none mb-6">
                <p className="whitespace-pre-wrap">{post.content}</p>
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Metadata */}
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {post.viewsCount} views
                </span>
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-6 py-4 border-t border-b dark:border-gray-700">
                <button
                  onClick={handleLike}
                  disabled={!currentUserId}
                  className={`flex items-center gap-2 transition-colors ${
                    isLiked
                      ? 'text-red-500'
                      : 'text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400'
                  } ${!currentUserId ? 'cursor-not-allowed' : ''}`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{likesCount} Likes</span>
                </button>

                <button
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center gap-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{post.commentsCount} Comments</span>
                </button>

                <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400 transition-colors ml-auto">
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>
              </div>

              {/* Comments Section */}
              {showComments && (
                <div className="mt-6">
                  <CommentSection
                    postId={post._id}
                    onCommentCountChange={(count) => {
                      // Update the post's comment count if needed
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}