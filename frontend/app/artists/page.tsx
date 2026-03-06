"use client";

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/config';
import Header from '../components/Header';
import CloudinaryResponsiveImage from '../components/CloudinaryResponsiveImage';

const PAGE_SIZE = 18;

interface Artist {
  _id: string;
  bio: string;
  specializations: string[];
  profilePicture: string;
  portfolioImages: string[];
  availability: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [followedArtists, setFollowedArtists] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalArtists, setTotalArtists] = useState(0);

  const fetchArtists = useCallback(async (
    pageToLoad = 1,
    append = false,
    query = searchTerm
  ) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const params = new URLSearchParams();
      const trimmedQuery = query.trim();
      if (trimmedQuery) {
        params.append('search', trimmedQuery);
      }
      params.append('fields', 'card');
      params.append('thumbnailOnly', 'true');
      params.append('page', String(pageToLoad));
      params.append('limit', String(PAGE_SIZE));

      const res = await fetch(`${API_BASE_URL}/api/artist/all?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        const pageArtists = data.artists || [];
        setArtists((prev) => (append ? [...prev, ...pageArtists] : pageArtists));
        setCurrentPage(pageToLoad);
        setTotalArtists(Number(data.total) || pageArtists.length);
        setHasMore(pageToLoad < (Number(data.pages) || 1));
      }
    } catch (error) {
      console.error('Failed to fetch artists:', error);
      if (!append) {
        setArtists([]);
        setTotalArtists(0);
      }
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchArtists(1, false);
  }, [fetchArtists]);

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;
    fetchArtists(currentPage + 1, true);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchInput.trim();

    if (trimmed === searchTerm) {
      fetchArtists(1, false, trimmed);
      return;
    }

    setSearchTerm(trimmed);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    if (!searchTerm) return;
    setSearchTerm('');
  };

  const toggleFollow = (artistId: string) => {
    setFollowedArtists(prev => {
      const next = new Set(prev);
      if (next.has(artistId)) {
        next.delete(artistId);
      } else {
        next.add(artistId);
      }
      return next;
    });
  };

  return (
    <main className="min-h-screen">
      <Header />
      <div className="min-h-screen py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="mb-6 md:mb-8 bg-[rgba(6,21,35,0.32)] backdrop-blur-sm border border-white/10 rounded-xl p-4 md:p-6 shadow-xl">
            <h1 className="text-2xl md:text-4xl font-heading text-white mb-2">
              Featured Artists
            </h1>
            <p className="text-gray-200 text-base md:text-lg">
              {searchTerm ? `Showing results for "${searchTerm}"` : `Browse over ${totalArtists || artists.length} artists`}
            </p>
          </div>

          <div className="bg-[rgba(6,21,35,0.32)] backdrop-blur-md border border-white/10 rounded-lg p-3 md:p-4 mb-6 md:mb-8 shadow-lg">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search artists by name or specialization..."
                aria-label="Search artists"
                className="flex-1 px-4 py-2.5 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold min-h-[44px]"
              />
              <div className="flex gap-2 sm:gap-3">
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-brand-gold text-[#0b1926] rounded-lg font-semibold hover:bg-brand-gold-antique transition-colors min-h-[44px]"
                >
                  Search
                </button>
                {(searchInput || searchTerm) && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg font-semibold hover:bg-gray-600 transition-colors min-h-[44px]"
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-white text-lg">Loading artists...</p>
            </div>
          ) : artists.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                No artists found {searchTerm ? `for "${searchTerm}"` : ''}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {artists.map((artist) => (
                <div
                  key={artist._id}
                  className="bg-gray-800 rounded-lg overflow-hidden md:hover:shadow-2xl transition-shadow group"
                >
                  <Link href={`/artist/${artist._id}`}>
                    <div className="relative h-52 sm:h-64 w-full overflow-hidden bg-gradient-to-br from-gray-700 to-gray-900">
                      {artist.portfolioImages?.[0] ? (
                        <CloudinaryResponsiveImage
                          src={artist.portfolioImages[0]}
                          alt={artist.user?.name || 'Artist artwork preview'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          widths={[320, 480, 640, 800]}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-20 h-20 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-4 md:p-6">
                    <div className="flex items-start gap-3 md:gap-4 mb-4">
                      <Link href={`/artist/${artist._id}`}>
                        <div className="relative flex-shrink-0">
                          {artist.profilePicture ? (
                            <CloudinaryResponsiveImage
                              src={artist.profilePicture}
                              alt={artist.user?.name || 'Artist profile'}
                              className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-gray-700"
                              sizes="64px"
                              widths={[64, 96, 128]}
                            />
                          ) : (
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600">
                              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${
                            artist.availability === 'available' ? 'bg-green-500' :
                            artist.availability === 'busy' ? 'bg-yellow-500' : 'bg-gray-500'
                          }`}></div>
                        </div>
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link href={`/artist/${artist._id}`}>
                          <h3 className="text-lg font-semibold text-white mb-1 hover:text-brand-gold transition-colors truncate">
                            {artist.user?.name || 'Artist'}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                          {artist.bio || 'No artist bio available yet.'}
                        </p>
                        <p className="text-sm text-gray-400 line-clamp-1">
                          {artist.specializations.length > 0 ? artist.specializations.join(', ') : 'No specializations listed'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleFollow(artist._id)}
                      className={`w-full py-2.5 px-4 rounded-md font-semibold transition-colors min-h-[44px] ${
                        followedArtists.has(artist._id)
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-brand-gold text-gray-900 hover:bg-brand-gold-antique'
                      }`}
                    >
                      {followedArtists.has(artist._id) ? 'Following' : 'Follow'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && hasMore && (
            <div className="flex justify-center mt-10">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-3 bg-brand-gold text-[#0b1926] font-semibold rounded-lg hover:bg-brand-gold-antique transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingMore ? 'Loading more...' : 'Load More Artists'}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
