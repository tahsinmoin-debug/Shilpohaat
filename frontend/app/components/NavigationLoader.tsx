"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { 
  ArtworkGridSkeleton, 
  ArtistGridSkeleton, 
  ArtworkDetailSkeleton,
  DashboardSkeleton,
  BlogListSkeleton,
  CategoryGridSkeleton,
  PageHeaderSkeleton
} from './SkeletonLoaders';
import Header from './Header';

export default function NavigationLoader() {
  const [loading, setLoading] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    // When pathname changes, hide the loader
    setLoading(false);
  }, [pathname]);

  useEffect(() => {
    // Intercept all link clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href && !link.href.startsWith('#') && !link.target) {
        const currentUrl = window.location.href;
        const newUrl = link.href;
        
        // Only show loader if navigating to a different page
        if (currentUrl !== newUrl && !newUrl.includes('#')) {
          setTargetUrl(newUrl);
          setLoading(true);
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, []);

  if (!loading) return null;

  // Determine which skeleton to show based on target URL
  const getSkeletonContent = () => {
    const url = targetUrl.toLowerCase();
    
    // Check for artwork detail page (has ID after /artworks/)
    const artworkMatch = url.match(/\/artworks\/([a-f0-9]{24})/i);
    if (artworkMatch) {
      return <ArtworkDetailSkeleton />;
    }
    
    if (url.includes('/artworks')) {
      // Artworks listing
      return (
        <div className="container mx-auto px-4 py-12">
          <PageHeaderSkeleton />
          <ArtworkGridSkeleton count={12} />
        </div>
      );
    } else if (url.includes('/artist/') && !url.includes('/artists')) {
      // Artist profile page
      return (
        <div className="container mx-auto px-4 py-12">
          <PageHeaderSkeleton />
          <ArtworkGridSkeleton count={6} />
        </div>
      );
    } else if (url.includes('/artists')) {
      // Artists listing
      return (
        <div className="container mx-auto px-4 py-12">
          <PageHeaderSkeleton />
          <ArtistGridSkeleton count={9} />
        </div>
      );
    } else if (url.includes('/blog/') && url.split('/blog/')[1]) {
      // Blog post detail
      return (
        <div className="container mx-auto px-4 py-12">
          <PageHeaderSkeleton />
          <div className="space-y-4 animate-pulse max-w-4xl mx-auto">
            <div className="h-64 bg-gray-800 rounded-xl" />
            <div className="h-8 bg-gray-800 rounded w-3/4" />
            <div className="h-4 bg-gray-800 rounded w-1/2" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-800 rounded" />
              <div className="h-4 bg-gray-800 rounded" />
              <div className="h-4 bg-gray-800 rounded w-5/6" />
            </div>
          </div>
        </div>
      );
    } else if (url.includes('/blog')) {
      // Blog listing
      return (
        <div className="container mx-auto px-4 py-12">
          <PageHeaderSkeleton />
          <BlogListSkeleton count={6} />
        </div>
      );
    } else if (url.includes('/categories')) {
      // Categories
      return (
        <div className="container mx-auto px-4 py-12">
          <PageHeaderSkeleton />
          <CategoryGridSkeleton count={8} />
        </div>
      );
    } else if (url.includes('/dashboard') || url.includes('/account') || url.includes('/analytics') || url.includes('/promotions') || url.includes('/verify')) {
      // Dashboard pages
      return <DashboardSkeleton />;
    } else if (url.includes('/cart') || url.includes('/checkout') || url.includes('/wishlist')) {
      // Cart/checkout pages
      return (
        <div className="container mx-auto px-4 py-12">
          <PageHeaderSkeleton />
          <div className="space-y-4 animate-pulse">
            <div className="h-48 bg-gray-800 rounded-xl" />
            <div className="h-48 bg-gray-800 rounded-xl" />
          </div>
        </div>
      );
    } else {
      // Default skeleton for other pages
      return (
        <div className="container mx-auto px-4 py-12">
          <PageHeaderSkeleton />
          <div className="space-y-4 animate-pulse">
            <div className="h-32 bg-gray-800 rounded-xl" />
            <div className="h-48 bg-gray-800 rounded-xl" />
            <div className="h-64 bg-gray-800 rounded-xl" />
          </div>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[9998] bg-gray-900 overflow-y-auto">
      <Header />
      {getSkeletonContent()}
    </div>
  );
}

