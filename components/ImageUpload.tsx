"use client";

import { useState } from 'react';
import { uploadData } from 'aws-amplify/storage';
import { Upload, X, Loader } from 'lucide-react';
import StorageImage from './StorageImage';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUpload({ images, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const filename = `blog-images/${Date.now()}-${file.name}`;
        const result = await uploadData({
          path: filename,
          data: file,
        }).result;
        
        uploadedUrls.push(filename);
      }
      
      onChange([...images, ...uploadedUrls]);
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  return (
    <div className="image-upload">
      <label className="upload-button">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          disabled={uploading}
          className="hidden"
        />
        {uploading ? (
          <>
            <Loader className="animate-spin" size={20} />
            Uploading...
          </>
        ) : (
          <>
            <Upload size={20} />
            Upload Images
          </>
        )}
      </label>
      
      {images.length > 0 && (
        <div className="image-preview-grid">
          {images.map((image, index) => (
            <div key={index} className="image-preview">
              <StorageImage
                path={image}
                alt={`Upload ${index + 1}`}
                width={100}
                height={100}
                className="preview-image"
              />
              <button
                onClick={() => removeImage(index)}
                className="remove-image"
                type="button"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}