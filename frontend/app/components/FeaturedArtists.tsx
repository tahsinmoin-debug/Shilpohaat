'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Artist {
  _id: string;
  bio: string;
  specializations: string[];
  profilePicture: string;
  portfolioImages: string[];
  availability: string;
  rating: number;
  totalReviews: number;
  profileViews: number;
  isFeatured: boolean;
  user: {
    _id: string;
    name: string;
    email: string;
  };
}

// FEATURED ARTISTS COMPONENT
export default function FeaturedArtists() {
  const [artists, setArtists] = React.useState<Artist[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchFeaturedArtists = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/artist/featured?limit=6');
        const data = await res.json();
        setArtists(data.artists || []);
      } catch (error) {
        console.error('Failed to fetch featured artists:', error);
        setArtists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedArtists();
  }, []);

  if (loading) {
    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold mx-auto"></div>
        </div>
      </section>
    );
  }

  if (artists.length === 0) {
    return null; // Don't show section if no featured artists
  }

  return (
    <section className="py-16 md:py-24 bg-gray-900/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-heading text-4xl text-white mb-4">
            Featured Local Artists
          </h2>
          <p className="font-sans text-gray-300 text-lg max-w-2xl mx-auto">
            Discover trending Bangladeshi artists based on ratings, popularity, and curator selection
          </p>
        </div>

        {/* Artists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {artists.map((artist) => (
            <Link
              key={artist._id}
              href={`/artist/${artist._id}`}
              className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
            >
              {/* Artist Cover Image */}
              <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-gray-700 to-gray-900">
                {artist.portfolioImages?.[0] ? (
                  <img
                    src={artist.portfolioImages[0]}
                    alt={artist.bio}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-20 h-20 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                {/* Featured Badge */}
                {artist.isFeatured && (
                  <div className="absolute top-4 right-4 bg-brand-gold text-gray-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Featured
                  </div>
                )}
              </div>

              {/* Artist Info */}
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  {/* Profile Picture */}
                  <div className="relative flex-shrink-0">
                    {artist.profilePicture ? (
                      <img
                        src={artist.profilePicture}
                        alt={artist.bio}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-700"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600">
                        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    {/* Availability indicator */}
                    <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-gray-800 ${
                      artist.availability === 'available' ? 'bg-green-500' :
                      artist.availability === 'busy' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}></div>
                  </div>

                  {/* Artist Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-heading text-white mb-1 group-hover:text-brand-gold transition-colors truncate">
                      {artist.bio}
                    </h3>
                    <p className="text-sm text-gray-400 mb-2">
                      {artist.user?.name || 'Artist'}
                    </p>
                    
                    {/* Rating */}
                    {artist.rating > 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(artist.rating) ? 'text-brand-gold' : 'text-gray-600'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-gray-400">
                          {artist.rating.toFixed(1)} ({artist.totalReviews || 0})
                        </span>
                      </div>
                    )}

                    {/* Specializations */}
                    <p className="text-sm text-gray-400 line-clamp-1">
                      {artist.specializations.slice(0, 2).join(', ')}
                    </p>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {artist.profileViews || 0} views
                  </div>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Follow feature coming soon!');
                    }}
                    className="px-4 py-2 bg-brand-gold text-gray-900 text-sm font-semibold rounded-md hover:bg-brand-gold-antique transition-colors"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <Link
            href="/artists"
            className="inline-block px-8 py-3 bg-transparent border-2 border-brand-gold text-brand-gold font-semibold rounded-md hover:bg-brand-gold hover:text-gray-900 transition-all duration-300"
          >
            Explore All Artists
          </Link>
        </div>
      </div>
    </section>
  );
}