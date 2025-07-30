"use client";

import { useEffect, useState } from 'react';
import { getUrl } from 'aws-amplify/storage';
import Image from 'next/image';

interface StorageImageProps {
  path: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function StorageImage({ path, alt, width = 300, height = 200, className }: StorageImageProps) {
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    const loadImage = async () => {
      try {
        const urlResult = await getUrl({
          path,
          options: {
            validateObjectExistence: false,
            expiresIn: 3600 // 1 hour
          }
        });
        setImageUrl(urlResult.url.toString());
      } catch (error) {
        console.error('Error loading image:', error);
      }
    };

    loadImage();
  }, [path]);

  if (!imageUrl) {
    return <div className={`${className} bg-gray-200 animate-pulse`} style={{ width, height }} />;
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      unoptimized
    />
  );
}