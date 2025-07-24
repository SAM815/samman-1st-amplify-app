"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import "./../app/app.css";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Eye, MessageCircle, Plus } from "lucide-react";
import { useInView } from "react-intersection-observer";
import toast, { Toaster } from 'react-hot-toast';
import RichTextEditor from "@/components/RichTextEditor";
import TagsInput from "@/components/TagsInput";
import ImageUpload from "@/components/ImageUpload";
import CommentSection from "@/components/CommentSection";
import SearchFilter from "@/components/SearchFilter";
import PostSkeleton from "@/components/PostSkeleton";
import ThemeToggle from "@/components/ThemeToggle";
import StorageImage from "@/components/StorageImage";

Amplify.configure(outputs);

const client = generateClient<Schema>();

const POSTS_PER_PAGE = 5;

export default function App() {
  const [posts, setPosts] = useState<Array<Schema["AnimeBlogPost"]["type"]>>([]);
  const [filteredPosts, setFilteredPosts] = useState<Array<Schema["AnimeBlogPost"]["type"]>>([]);
  const [showForm, setShowForm] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    anime: "",
    rating: 5,
    tags: [] as string[],
    images: [] as string[],
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  const imageInputRef = useRef<HTMLInputElement>(null);

  function listPosts() {
    setLoading(true);
    client.models.AnimeBlogPost.observeQuery().subscribe({
      next: (data) => {
        const sortedPosts = [...data.items].sort((a, b) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        setPosts(sortedPosts);
        
        // Extract unique tags
        const tags = new Set<string>();
        sortedPosts.forEach(post => {
          post.tags?.forEach(tag => {
            if (tag) tags.add(tag);
          });
        });
        setAvailableTags(Array.from(tags));
        
        setLoading(false);
      },
    });
  }

  useEffect(() => {
    listPosts();
  }, []);

  useEffect(() => {
    // Filter posts based on search and filters
    let filtered = posts;

    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.anime?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (tagFilter.length > 0) {
      filtered = filtered.filter(post =>
        tagFilter.some(tag => post.tags?.includes(tag))
      );
    }

    if (ratingFilter !== null) {
      filtered = filtered.filter(post =>
        (post.rating || 0) >= ratingFilter
      );
    }

    setFilteredPosts(filtered);
    setPage(1);
    setHasMore(filtered.length > POSTS_PER_PAGE);
  }, [posts, searchQuery, tagFilter, ratingFilter]);

  useEffect(() => {
    // Load more posts when scrolling
    if (inView && hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  }, [inView, hasMore, loading]);

  const visiblePosts = filteredPosts.slice(0, page * POSTS_PER_PAGE);

  async function createPost() {
    if (newPost.title && newPost.content && newPost.anime) {
      try {
        await client.models.AnimeBlogPost.create({
          ...newPost,
          createdAt: new Date().toISOString(),
        });
        setNewPost({ title: "", content: "", anime: "", rating: 5, tags: [], images: [] });
        setShowForm(false);
        toast.success('Post created successfully!');
      } catch (error) {
        toast.error('Failed to create post');
        console.error(error);
      }
    }
  }

  const handleLike = async (postId: string, currentLikes: number) => {
    try {
      await client.models.AnimeBlogPost.update({
        id: postId,
        likes: currentLikes + 1,
      });
      toast.success('Liked!', { icon: '❤️' });
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };


  return (
    <main className="app-container">
      <Toaster position="bottom-right" />
      
      <div className="header">
        <div className="header-content">
          <h1>🌸 My Anime Blog 🌸</h1>
          <p>Reviews, thoughts, and recommendations from the anime world!</p>
        </div>
        <ThemeToggle />
      </div>

      <SearchFilter
        onSearch={setSearchQuery}
        onTagFilter={setTagFilter}
        onRatingFilter={setRatingFilter}
        availableTags={availableTags}
      />

      <motion.button
        className="new-post-btn"
        onClick={() => setShowForm(!showForm)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus size={20} />
        Write New Review
      </motion.button>

      <AnimatePresence>
        {showForm && (
          <motion.div
            className="post-form"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h3>Create New Post</h3>
            <input
              type="text"
              placeholder="Post Title"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            />
            <input
              type="text"
              placeholder="Anime Name"
              value={newPost.anime}
              onChange={(e) => setNewPost({ ...newPost, anime: e.target.value })}
            />
            
            <RichTextEditor
              content={newPost.content}
              onChange={(content) => setNewPost({ ...newPost, content })}
              onImageUpload={() => imageInputRef.current?.click()}
            />
            
            <TagsInput
              tags={newPost.tags}
              onChange={(tags) => setNewPost({ ...newPost, tags })}
            />
            
            <ImageUpload
              images={newPost.images}
              onChange={(images) => setNewPost({ ...newPost, images })}
            />
            
            <label className="rating-label">
              Rating: {newPost.rating}/10
              <input
                type="range"
                min="1"
                max="10"
                value={newPost.rating}
                onChange={(e) => setNewPost({ ...newPost, rating: parseInt(e.target.value) })}
                className="rating-slider"
              />
            </label>
            
            <div className="form-buttons">
              <button onClick={createPost} className="submit-btn">Post Review</button>
              <button onClick={() => setShowForm(false)} className="cancel-btn">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="posts-container">
        {loading && page === 1 ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : visiblePosts.length === 0 ? (
          <p className="no-posts">
            {searchQuery || tagFilter.length > 0 || ratingFilter
              ? "No posts match your filters. Try adjusting your search."
              : "No anime reviews yet. Start by writing your first review!"}
          </p>
        ) : (
          <>
            {visiblePosts.map((post, index) => (
              <motion.div
                key={post.id}
                className="blog-post"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <h2>{post.title}</h2>
                <div className="post-meta">
                  <span className="anime-name">📺 {post.anime}</span>
                  <span className="rating">⭐ {post.rating}/10</span>
                  <span className="date">
                    {new Date(post.createdAt || "").toLocaleDateString()}
                  </span>
                  <span className="stats">
                    <Eye size={16} /> {post.views || 0}
                  </span>
                </div>
                
                <div 
                  className="post-content"
                  dangerouslySetInnerHTML={{ __html: post.content || "" }}
                />
                
                {post.images && post.images.length > 0 && (
                  <div className="post-images">
                    {post.images.map((image, idx) => image ? (
                      <div key={idx} className="post-image">
                        <StorageImage
                          path={image}
                          alt={`${post.anime} screenshot ${idx + 1}`}
                          width={300}
                          height={200}
                          className="anime-image"
                        />
                      </div>
                    ) : null)}
                  </div>
                )}
                
                {post.tags && post.tags.length > 0 && (
                  <div className="post-tags">
                    {post.tags.map(tag => tag ? (
                      <span key={tag} className="post-tag">#{tag}</span>
                    ) : null)}
                  </div>
                )}
                
                <div className="post-actions">
                  <button
                    onClick={() => handleLike(post.id, post.likes || 0)}
                    className="like-button"
                  >
                    <Heart size={18} fill={post.likes ? "#ff6b6b" : "none"} />
                    {post.likes || 0}
                  </button>
                  <span className="comment-count">
                    <MessageCircle size={18} />
                    0
                  </span>
                </div>
                
                <CommentSection
                  postId={post.id}
                  comments={[]}
                />
              </motion.div>
            ))}
            
            {hasMore && (
              <div ref={ref} className="load-more">
                <PostSkeleton />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}