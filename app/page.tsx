"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import "./../app/app.css";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App() {
  const [posts, setPosts] = useState<Array<Schema["AnimeBlogPost"]["type"]>>([]);
  const [showForm, setShowForm] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    anime: "",
    rating: 5,
  });

  function listPosts() {
    client.models.AnimeBlogPost.observeQuery().subscribe({
      next: (data) => setPosts([...data.items].sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      )),
    });
  }

  useEffect(() => {
    listPosts();
  }, []);

  async function createPost() {
    if (newPost.title && newPost.content && newPost.anime) {
      await client.models.AnimeBlogPost.create({
        ...newPost,
        createdAt: new Date().toISOString(),
      });
      setNewPost({ title: "", content: "", anime: "", rating: 5 });
      setShowForm(false);
    }
  }

  return (
    <main>
      <div className="header">
        <h1>🌸 My Anime Blog 🌸</h1>
        <p>Reviews, thoughts, and recommendations from the anime world!</p>
      </div>

      <button className="new-post-btn" onClick={() => setShowForm(!showForm)}>
        ✨ Write New Review
      </button>

      {showForm && (
        <div className="post-form">
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
          <textarea
            placeholder="Write your review..."
            rows={4}
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
          />
          <label>
            Rating: {newPost.rating}/10
            <input
              type="range"
              min="1"
              max="10"
              value={newPost.rating}
              onChange={(e) => setNewPost({ ...newPost, rating: parseInt(e.target.value) })}
            />
          </label>
          <div className="form-buttons">
            <button onClick={createPost}>Post Review</button>
            <button onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="posts-container">
        {posts.length === 0 ? (
          <p className="no-posts">No anime reviews yet. Start by writing your first review!</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="blog-post">
              <h2>{post.title}</h2>
              <div className="post-meta">
                <span className="anime-name">📺 {post.anime}</span>
                <span className="rating">⭐ {post.rating}/10</span>
                <span className="date">
                  {new Date(post.createdAt || "").toLocaleDateString()}
                </span>
              </div>
              <p className="post-content">{post.content}</p>
            </div>
          ))
        )}
      </div>
    </main>
  );
}