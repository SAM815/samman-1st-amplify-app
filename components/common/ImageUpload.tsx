'use client'

import React, { useRef } from 'react'

interface ImageUploadProps {
  onImageSelect: (file: File) => void
  accept?: string
  maxSize?: number // in MB
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageSelect, 
  accept = 'image/*',
  maxSize = 5 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSize) {
      alert(`File size must be less than ${maxSize}MB`)
      return
    }

    onImageSelect(file)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div 
      onClick={handleClick}
      className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors bg-gray-700/50"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
      <div className="space-y-2">
        <svg 
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor" 
          fill="none" 
          viewBox="0 0 48 48"
        >
          <path 
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
            strokeWidth={2} 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </svg>
        <p className="text-gray-300">Click to upload image</p>
        <p className="text-xs text-gray-500">PNG, JPG, GIF up to {maxSize}MB</p>
      </div>
    </div>
  )
}

export default ImageUpload