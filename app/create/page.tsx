'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from 'aws-amplify/auth'
import Navbar from '@/components/layout/Navbar'
// import RichTextEditor from '@/components/blog/RichTextEditorWrapper'
import SimpleTextEditor from '@/components/blog/SimpleTextEditor'
import TagsInput from '@/components/blog/TagsInput'
import ImageUpload from '@/components/common/ImageUpload'
import { GENRES } from '@/lib/utils/constants'

export default function CreatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [animeName, setAnimeName] = useState('')
  const [rating, setRating] = useState(5)
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      await getCurrentUser()
      setLoading(false)
    } catch (error) {
      router.push('/login')
    }
  }

  const handlePublish = async () => {
    if (!title.trim() || !content.trim() || !animeName.trim()) {
      alert('Please fill in all required fields')
      return
    }

    setPublishing(true)
    
    // TODO: Implement actual publish functionality with Amplify Data
    setTimeout(() => {
      alert('Blog post published successfully!')
      router.push('/home')
    }, 1500)
  }

  const handleSaveDraft = () => {
    // TODO: Implement draft saving
    alert('Draft saved!')
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
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Create New Blog Post</h1>
          <p className="text-gray-400">Share your thoughts about your favorite anime</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Post Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-600"
              placeholder="Enter your blog post title..."
              maxLength={100}
            />
            <p className="text-gray-500 text-sm mt-1">{title.length}/100 characters</p>
          </div>

          {/* Anime Name and Rating */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Anime Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={animeName}
                onChange={(e) => setAnimeName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-600"
                placeholder="Which anime are you reviewing?"
              />
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Your Rating
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="flex-1 accent-purple-600"
                />
                <div className="bg-purple-600 text-white px-3 py-1 rounded-lg font-bold min-w-[3rem] text-center">
                  {rating}/10
                </div>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Cover Image
            </label>
            <ImageUpload
              onImageSelect={(file) => {
                const reader = new FileReader()
                reader.onloadend = () => {
                  setCoverImage(reader.result as string)
                }
                reader.readAsDataURL(file)
              }}
            />
            {coverImage && (
              <div className="mt-4 relative">
                <img
                  src={coverImage}
                  alt="Cover"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  onClick={() => setCoverImage(null)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Content <span className="text-red-400">*</span>
            </label>
            <SimpleTextEditor
              content={content}
              onChange={setContent}
              placeholder="Share your thoughts about this anime..."
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Tags
            </label>
            <TagsInput
              tags={tags}
              onChange={setTags}
              suggestions={[...GENRES, 'Review', 'First Impressions', 'Analysis', 'Character Study', 'Season Review']}
            />
            <p className="text-gray-500 text-sm mt-1">Add tags to help others find your post</p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-700">
            <button
              onClick={handleSaveDraft}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              Save as Draft
            </button>
            
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/home')}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing || !title.trim() || !content.trim() || !animeName.trim()}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {publishing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Publishing...</span>
                  </>
                ) : (
                  <span>Publish Post</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Writing Tips */}
        <div className="mt-8 bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Writing Tips</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span>
              <span>Start with a compelling introduction that hooks your readers</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span>
              <span>Include specific examples and scenes to support your points</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span>
              <span>Avoid major spoilers or use spoiler warnings</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span>
              <span>Share your personal connection to the anime</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}