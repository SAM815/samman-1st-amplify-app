'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Eye, Star } from 'lucide-react';
import { StorageImage } from '@aws-amplify/ui-react-storage';

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

interface CompactPostCardProps {
  post: Post;
  currentUserId?: string;
  onLikeUpdate?: (postId: string, isLiked: boolean, newCount: number) => void;
}

export function CompactPostCard({ post, currentUserId, onLikeUpdate }: CompactPostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentUserId) return;
    
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    onLikeUpdate?.(post._id, !isLiked, isLiked ? likesCount - 1 : likesCount + 1);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-3">
        <div className="flex gap-3">
          {/* Thumbnail */}
          {post.images && post.images.length > 0 && (
            <div className="flex-shrink-0">
              <div className="w-16 h-16 relative rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
                <StorageImage
                  path={post.images[0]}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  fallbackSrc="/placeholder-image.svg"
                />
              </div>
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-1">
              {post.title}
            </h3>
            
            {post.animeName && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-purple-600 dark:text-purple-400">
                  {post.animeName}
                </span>
                {post.rating && (
                  <div className="flex items-center gap-0.5">
                    {renderStars(post.rating)}
                  </div>
                )}
              </div>
            )}
            
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mt-1">
              {post.content}
            </p>
            
            {/* Meta info */}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span className="flex items-center gap-0.5">
                <Heart className={`w-3 h-3 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                {likesCount}
              </span>
              <span className="flex items-center gap-0.5">
                <MessageCircle className="w-3 h-3" />
                {post.commentsCount}
              </span>
              <span className="ml-auto text-xs">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </article>
  );
}