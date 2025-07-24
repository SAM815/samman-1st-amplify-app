"use client";

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function PostSkeleton() {
  return (
    <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f0f0f0">
      <div className="blog-post skeleton">
        <h2><Skeleton height={30} /></h2>
        <div className="post-meta">
          <Skeleton width={100} />
          <Skeleton width={80} />
          <Skeleton width={100} />
        </div>
        <div className="post-content">
          <Skeleton count={3} />
        </div>
        <div className="post-images">
          <Skeleton height={150} width="30%" inline />
          <Skeleton height={150} width="30%" inline style={{ marginLeft: '3%' }} />
        </div>
        <div className="post-tags">
          <Skeleton width={60} height={24} inline />
          <Skeleton width={80} height={24} inline style={{ marginLeft: '8px' }} />
        </div>
      </div>
    </SkeletonTheme>
  );
}