'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ size = 'md', text, fullScreen = false }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
    xl: 'w-24 h-24 border-4'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        {/* Outer ring */}
        <div className={`${sizeClasses[size]} border-gray-700 border-t-brand-gold rounded-full animate-spin`}></div>
        {/* Inner glow effect */}
        <div className="absolute inset-0 rounded-full bg-brand-gold/10 blur-xl animate-pulse"></div>
      </div>
      {text && (
        <p className="text-gray-300 text-sm font-medium animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

// Re-export skeleton components for convenience
export { ArtworkCardSkeleton as SkeletonCard, ArtistCardSkeleton, BlogCardSkeleton } from './Skeleton';
export { default as Skeleton } from './Skeleton';

// Skeleton loader for list items
export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-gray-800 rounded-lg p-4 border border-gray-700 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-700 rounded w-1/4"></div>
              <div className="h-3 bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
