"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import WishlistButton from '../components/WishlistButton';
import { ArtworkCardSkeleton } from '../components/Skeleton';
import SearchInterface from '../components/Filters/SearchInterface';
import { API_BASE_URL } from '@/lib/config';

interface Artwork {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  status: 'available' | 'sold' | 'reserved';
  featured: boolean;
  material?: string;
  dimensions?: {
    width: number;
    height: number;
    unit: string;
  };
  artist: {
    _id: string;
    name: string;
    artistProfile: {
      profilePicture: string;
      availability: string;
    };
  };
}

export default function ArtworksPage() {
  const router = useRouter();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/artworks`);
        const data = await res.json();
        const allArtworks = data.artworks || [];
        setArtworks(allArtworks);
        setFilteredArtworks(allArtworks);
      } catch (error) {
        console.error('Failed to fetch artworks:', error);
        setArtworks([]);
        setFilteredArtworks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  const handleArtworkClick = (id: string) => {
    router.push(`/artworks/${id}`);
  };

  const handleArtistClick = (e: React.MouseEvent, artistId: string) => {
    e.stopPropagation();
    router.push(`/artist/${artistId}`);
  };

  const handleFilteredResultsChange = useCallback((filtered: Artwork[]) => {
    setFilteredArtworks(filtered);
  }, []);

  return (
    <main className="min-h-screen">
      <Header />

      <section className="text-white py-16 bg-[rgba(6,21,35,0.3)] backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-heading mb-4">Discover Authentic Artworks</h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">Explore unique creations by talented Bengali artists</p>
        </div>
      </section>

      {!loading && (
        <SearchInterface artworks={artworks} onFilteredResultsChange={handleFilteredResultsChange} />
      )}

      <div className="container mx-auto px-4 py-6">
        <p className="text-gray-300">
          {loading ? 'Loading...' : `${filteredArtworks.length} ${filteredArtworks.length === 1 ? 'artwork' : 'artworks'} found`}
        </p>
      </div>

      <div className="container mx-auto px-4 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <ArtworkCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredArtworks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No artworks found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredArtworks.map((artwork) => (
              <div
                key={artwork._id}
                onClick={() => handleArtworkClick(artwork._id)}
                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-700">
                  <img
                    src={artwork.images[0] || 'https://placehold.co/400x400/333/fff.png'}
                    alt={artwork.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />

                  <div className="absolute top-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-gray-900/40 backdrop-blur-sm rounded-full p-0.5 hover:bg-gray-900/60 transition-colors">
                      <WishlistButton artworkId={artwork._id} />
                    </div>
                  </div>

                  {artwork.status !== 'available' && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase">
                      {artwork.status}
                    </div>
                  )}
                  {artwork.featured && (
                    <div className="absolute top-10 left-2 bg-brand-gold text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">
                      Featured
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1 group-hover:text-brand-gold transition-colors">
                    {artwork.title}
                  </h3>

                  <div
                    onClick={(e) => handleArtistClick(e, artwork.artist._id)}
                    className="flex items-center gap-2 mb-3 hover:text-brand-gold transition-colors"
                  >
                    <div className="relative">
                      <img
                        src={artwork.artist.artistProfile?.profilePicture || 'https://placehold.co/32x32/666/fff.png'}
                        alt={artwork.artist.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-gray-600"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${
                          artwork.artist.artistProfile?.availability === 'available'
                            ? 'bg-green-500'
                            : artwork.artist.artistProfile?.availability === 'busy'
                              ? 'bg-yellow-500'
                              : 'bg-gray-500'
                        }`}
                      />
                    </div>
                    <p className="text-sm text-gray-400">{artwork.artist.name}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-xl font-bold text-brand-gold">Tk {artwork.price.toLocaleString()}</p>
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">{artwork.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
