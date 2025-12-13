"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';

const CATEGORIES = [
  'All',
  'Abstract',
  'Landscape',
  'Portrait',
  'Modern Art',
  'Traditional Art',
  'Nature & Wildlife',
  'Cityscape',
  'Floral Art',
  'Minimalist',
  'Pop Art',
  'Digital Art',
  'Acrylic',
  'Oil',
  'Watercolor',
  'Mixed Media',
];

interface Artwork {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  status: 'available' | 'sold' | 'reserved';
  featured: boolean;
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
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchArtworks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [category, searchQuery, priceRange, sortBy, artworks]);

  const fetchArtworks = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/artworks');
      const data = await res.json();
      setArtworks(data.artworks || []);
    } catch (error) {
      console.error('Failed to fetch artworks:', error);
      setArtworks([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...artworks];

    // Category filter
    if (category !== 'All') {
      filtered = filtered.filter((art) => art.category === category);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (art) =>
          art.title.toLowerCase().includes(query) ||
          art.description?.toLowerCase().includes(query) ||
          art.artist?.name.toLowerCase().includes(query)
      );
    }

    // Price range filter
    if (priceRange.min) {
      filtered = filtered.filter((art) => art.price >= Number(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter((art) => art.price <= Number(priceRange.max));
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        // Already sorted by createdAt desc from backend
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
    }

    setFilteredArtworks(filtered);
  };

  const handleArtworkClick = (id: string) => {
    router.push(`/artworks/${id}`);
  };

  const handleArtistClick = (e: React.MouseEvent, artistId: string) => {
    e.stopPropagation();
    router.push(`/artist/${artistId}`);
  };

  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-brand-maroon to-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-heading mb-4">
            Discover Authentic Artworks
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
            Explore unique creations by talented Bengali artists
          </p>
        </div>
      </section>

      {/* Filters Bar */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search artworks or artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            {/* Mobile Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden px-4 py-2 bg-brand-gold text-gray-900 font-semibold rounded-lg hover:bg-brand-gold-antique transition-colors"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {/* Filters Info */}
          <div className="mt-4 text-sm text-gray-400">
            <p>💡 Browse categories at our <a href="/categories" className="text-brand-gold hover:underline">dedicated Categories page</a></p>
          </div>

          {/* Price Range */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block mt-4`}>
            <div className="flex gap-4 items-center">
              <span className="text-gray-300 text-sm">Price Range (৳):</span>
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                className="w-24 px-3 py-1 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
              <span className="text-gray-300">-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                className="w-24 px-3 py-1 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
              {(priceRange.min || priceRange.max) && (
                <button
                  onClick={() => setPriceRange({ min: '', max: '' })}
                  className="text-sm text-brand-gold hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="container mx-auto px-4 py-6">
        <p className="text-gray-300">
          {loading ? 'Loading...' : `${filteredArtworks.length} ${filteredArtworks.length === 1 ? 'artwork' : 'artworks'} found`}
        </p>
      </div>

      {/* Artworks Grid */}
      <div className="container mx-auto px-4 pb-16">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
          </div>
        ) : filteredArtworks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No artworks found matching your criteria</p>
            <button
              onClick={() => {
                setCategory('All');
                setSearchQuery('');
                setPriceRange({ min: '', max: '' });
              }}
              className="mt-4 text-brand-gold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredArtworks.map((artwork) => (
              <div
                key={artwork._id}
                onClick={() => handleArtworkClick(artwork._id)}
                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group"
              >
                {/* Artwork Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-700">
                  <img
                    src={artwork.images[0] || 'https://placehold.co/400x400/333/fff.png'}
                    alt={artwork.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* Status Badge */}
                  {artwork.status !== 'available' && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase">
                      {artwork.status}
                    </div>
                  )}
                  {artwork.featured && (
                    <div className="absolute top-2 left-2 bg-brand-gold text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">
                      Featured
                    </div>
                  )}
                </div>

                {/* Artwork Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1 group-hover:text-brand-gold transition-colors">
                    {artwork.title}
                  </h3>

                  {/* Artist Info */}
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
                      ></span>
                    </div>
                    <p className="text-sm text-gray-400">{artwork.artist.name}</p>
                  </div>

                  {/* Price and Category */}
                  <div className="flex justify-between items-center">
                    <p className="text-xl font-bold text-brand-gold">
                      ৳{artwork.price.toLocaleString()}
                    </p>
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                      {artwork.category}
                    </span>
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
