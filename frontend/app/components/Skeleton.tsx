'use client';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string;
  height?: string;
  count?: number;
}

export default function Skeleton({ 
  className = '', 
  variant = 'rectangular',
  width,
  height,
  count = 1
}: SkeletonProps) {
  const baseClasses = 'skeleton bg-gray-700/50 animate-pulse';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl',
  };

  const skeletonElement = (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{
        width: width || (variant === 'circular' ? '40px' : '100%'),
        height: height || (variant === 'text' ? '1rem' : variant === 'circular' ? '40px' : '200px'),
      }}
    />
  );

  if (count > 1) {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="mb-2">
            {skeletonElement}
          </div>
        ))}
      </>
    );
  }

  return skeletonElement;
}

// Specialized skeleton components
export function ArtworkCardSkeleton() {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
      <Skeleton variant="rectangular" height="300px" />
      <div className="p-4 space-y-3">
        <Skeleton variant="text" width="80%" />
        <div className="flex items-center gap-2">
          <Skeleton variant="circular" width="32px" height="32px" />
          <Skeleton variant="text" width="120px" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton variant="text" width="100px" />
          <Skeleton variant="text" width="80px" />
        </div>
      </div>
    </div>
  );
}

export function ArtistCardSkeleton() {
  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton variant="circular" width="64px" height="64px" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="150px" />
          <Skeleton variant="text" width="100px" />
        </div>
      </div>
      <Skeleton variant="text" count={3} />
    </div>
  );
}

export function BlogCardSkeleton() {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <Skeleton variant="rectangular" height="224px" />
      <div className="p-5 space-y-3">
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="100%" count={2} />
      </div>
    </div>
  );
}
