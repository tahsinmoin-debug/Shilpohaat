// Skeleton loading components for different page types

export function ArtworkCardSkeleton() {
  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 animate-pulse">
      <div className="aspect-square bg-gray-700" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-700 rounded w-1/2" />
        <div className="h-5 bg-gray-700 rounded w-1/3" />
      </div>
    </div>
  );
}

export function ArtworkGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ArtworkCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ArtistCardSkeleton() {
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gray-700" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-700 rounded w-2/3" />
          <div className="h-3 bg-gray-700 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-700 rounded w-5/6" />
      </div>
    </div>
  );
}

export function ArtistGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ArtistCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ArtworkDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gallery skeleton */}
        <div className="lg:col-span-2 bg-gray-800 rounded-xl p-4 border border-gray-700 animate-pulse">
          <div className="aspect-[4/3] bg-gray-700 rounded-lg mb-4" />
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-700 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 animate-pulse space-y-4">
            <div className="h-8 bg-gray-700 rounded w-1/2" />
            <div className="h-12 bg-gray-700 rounded w-full" />
            <div className="h-12 bg-gray-700 rounded w-full" />
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 animate-pulse space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-2/3" />
                <div className="h-3 bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 bg-gray-800 rounded w-1/3" />
        <div className="h-4 bg-gray-800 rounded w-1/4" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-3">
            <div className="h-4 bg-gray-700 rounded w-2/3" />
            <div className="h-8 bg-gray-700 rounded w-1/2" />
          </div>
        ))}
      </div>

      {/* Content section */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-4">
        <div className="h-6 bg-gray-700 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-700 rounded-lg p-4 space-y-2">
              <div className="h-4 bg-gray-600 rounded w-3/4" />
              <div className="h-3 bg-gray-600 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BlogListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 animate-pulse">
          <div className="aspect-video bg-gray-700" />
          <div className="p-4 space-y-3">
            <div className="h-5 bg-gray-700 rounded w-4/5" />
            <div className="h-3 bg-gray-700 rounded w-full" />
            <div className="h-3 bg-gray-700 rounded w-3/4" />
            <div className="flex gap-2">
              <div className="h-6 bg-gray-700 rounded-full w-16" />
              <div className="h-6 bg-gray-700 rounded-full w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CategoryGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 animate-pulse">
          <div className="aspect-square bg-gray-700" />
          <div className="p-3">
            <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-3 mb-8 animate-pulse">
      <div className="h-10 bg-gray-800 rounded w-1/3" />
      <div className="h-4 bg-gray-800 rounded w-1/2" />
    </div>
  );
}
