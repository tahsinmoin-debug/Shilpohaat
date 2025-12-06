"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

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
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [followedArtists, setFollowedArtists] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchArtists();
  }, [selectedLetter]);

  const fetchArtists = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedLetter) {
        params.append('letter', selectedLetter);
      }

      const res = await fetch(`http://localhost:5000/api/artist/all?${params.toString()}`);
      const data = await res.json();
      
      if (data.success) {
        setArtists(data.artists);
      }
    } catch (error) {
      console.error('Failed to fetch artists:', error);
    } finally {
      setLoading(false);
    }
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
    <main>
      <Header />
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-heading text-white mb-3">
              Featured Artists
            </h1>
            <p className="text-gray-300 text-lg">
              Browse over {artists.length} artists
            </p>
          </div>

          {/* Alphabet Filter */}
          <div className="bg-gray-800 rounded-lg p-4 mb-8 sticky top-20 z-40 shadow-lg">
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setSelectedLetter(null)}
                className={`px-3 py-1 rounded font-semibold transition-colors ${
                  selectedLetter === null
                    ? 'bg-brand-gold text-gray-900'
                    : 'text-gray-300 hover:text-brand-gold'
                }`}
              >
                All
              </button>
              {ALPHABET.map((letter) => (
                <button
                  key={letter}
                  onClick={() => setSelectedLetter(letter)}
                  className={`px-3 py-1 rounded font-semibold transition-colors ${
                    selectedLetter === letter
                      ? 'bg-brand-gold text-gray-900'
                      : 'text-gray-300 hover:text-brand-gold'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          {/* Artists Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-white text-lg">Loading artists...</p>
            </div>
          ) : artists.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                No artists found {selectedLetter ? `starting with "${selectedLetter}"` : ''}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artists.map((artist) => (
                <div
                  key={artist._id}
                  className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-2xl transition-shadow group"
                >
                  {/* Artist Cover Image */}
                  <Link href={`/artist/${artist._id}`}>
                    <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-gray-700 to-gray-900">
                      {artist.portfolioImages?.[0] ? (
                        <img
                          src={artist.portfolioImages[0]}
                          alt={artist.bio}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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

                  {/* Artist Info */}
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      {/* Profile Picture */}
                      <Link href={`/artist/${artist._id}`}>
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
                          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${
                            artist.availability === 'available' ? 'bg-green-500' :
                            artist.availability === 'busy' ? 'bg-yellow-500' : 'bg-gray-500'
                          }`}></div>
                        </div>
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link href={`/artist/${artist._id}`}>
                          <h3 className="text-xl font-heading text-white mb-1 hover:text-brand-gold transition-colors truncate">
                            {artist.bio}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-400 mb-2">
                          {artist.user?.name || 'Artist'}
                        </p>
                        <p className="text-sm text-gray-400 line-clamp-1">
                          {artist.specializations.join(', ')}
                        </p>
                      </div>
                    </div>

                    {/* Follow Button */}
                    <button
                      onClick={() => toggleFollow(artist._id)}
                      className={`w-full py-2 px-4 rounded-md font-semibold transition-colors ${
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
        </div>
      </div>
    </main>
  );
}
