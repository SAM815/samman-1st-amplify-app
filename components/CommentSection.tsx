"use client";

import { useState } from 'react';
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { MessageCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const client = generateClient<Schema>();

interface Comment {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
  parentId?: string;
  replies?: Comment[];
}

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
}

export default function CommentSection({ postId, comments }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(true);

  const handleSubmitComment = async (parentId?: string) => {
    if (!newComment.trim()) return;

    try {
      await client.models.Comment.create({
        content: newComment,
        postId,
        parentId,
        authorName: authorName || 'Anonymous',
        createdAt: new Date().toISOString(),
      });

      setNewComment('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const CommentItem = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`comment-item depth-${depth}`}
    >
      <div className="comment-header">
        <span className="author-name">{comment.authorName}</span>
        <span className="comment-date">
          {new Date(comment.createdAt).toLocaleDateString()}
        </span>
      </div>
      <p className="comment-content">{comment.content}</p>
      <button
        onClick={() => setReplyingTo(comment.id)}
        className="reply-button"
      >
        Reply
      </button>
      
      {replyingTo === comment.id && (
        <div className="reply-form">
          <input
            type="text"
            placeholder="Your name (optional)"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
          />
          <textarea
            placeholder="Write your reply..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={2}
          />
          <div className="reply-actions">
            <button onClick={() => handleSubmitComment(comment.id)}>
              <Send size={16} /> Reply
            </button>
            <button onClick={() => setReplyingTo(null)}>Cancel</button>
          </div>
        </div>
      )}
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="replies">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="comment-section">
      <div className="comment-header">
        <h3>
          <MessageCircle size={20} />
          Comments ({comments.length})
        </h3>
        <button onClick={() => setShowComments(!showComments)}>
          {showComments ? 'Hide' : 'Show'}
        </button>
      </div>

      <div className="new-comment-form">
        <input
          type="text"
          placeholder="Your name (optional)"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
        />
        <textarea
          placeholder="Share your thoughts..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
        />
        <button onClick={() => handleSubmitComment()} className="submit-comment">
          <Send size={16} /> Post Comment
        </button>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="comments-list"
          >
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}