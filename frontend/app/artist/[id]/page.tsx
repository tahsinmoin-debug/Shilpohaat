"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';

interface ArtistProfile {
  _id: string;
  bio: string;
  specializations: string[];
  contactPhone?: string;
  profilePicture?: string;
  portfolioImages?: string[];
  artistStory?: string;
  skills?: string[];
  website?: string;
  instagram?: string;
  availability?: 'available' | 'busy' | 'unavailable';
  user: {
    _id: string;
    name: string;
    email: string;
  };
}

interface Artwork {
  _id: string;
  title: string;
  price: number;
  category: string;
  images: string[];
  status: 'available' | 'sold' | 'reserved';
  featured?: boolean;
}

interface PageProps {
  params: { id: string };
}

export default function ArtistDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/artist/${params.id}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to load artist');
        }
        setArtist(data.artist);
        setArtworks(data.artworks || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load artist');
      } finally {
        setLoading(false);
      }
    };

    fetchArtist();
  }, [params.id]);

  const coverImage = useMemo(() => {
    if (!artist?.portfolioImages || artist.portfolioImages.length === 0) {
      return 'https://placehold.co/1200x500/333/fff.png?text=Artist+Portfolio';
    }
    return artist.portfolioImages[0];
  }, [artist]);

  if (loading) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
        </div>
      </main>
    );
  }

  if (error || !artist) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <p className="text-red-400 text-lg mb-3">{error || 'Artist not found'}</p>
          <button
            onClick={() => router.push('/artists')}
            className="px-6 py-3 bg-brand-gold text-gray-900 font-semibold rounded-md hover:bg-brand-gold-antique transition-colors"
          >
            Back to Artists
          </button>
        </div>
      </main>
    );
  }

  const availabilityColor =
    artist.availability === 'available'
      ? 'bg-green-500'
      : artist.availability === 'busy'
      ? 'bg-yellow-500'
      : 'bg-gray-500';

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <Header />

      {/* Hero */}
      <section className="relative h-[320px] w-full overflow-hidden">
        <img
          src={coverImage}
          alt={artist.user.name}
          className="w-full h-full object-cover blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/70 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4 flex items-center gap-6">
            <div className="relative w-24 h-24">
              <img
                src={artist.profilePicture || 'https://placehold.co/200x200/555/fff.png?text=Artist'}
                alt={artist.user.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-900 shadow-xl"
              />
              <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-gray-900 ${availabilityColor}`}></span>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-brand-gold/80">Artist</p>
              <h1 className="text-3xl md:text-4xl font-heading mt-2">{artist.user.name}</h1>
              <p className="text-gray-200 max-w-3xl mt-2">{artist.bio}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {artist.specializations?.slice(0, 4).map((spec) => (
                  <span key={spec} className="px-3 py-1 bg-gray-800 rounded-full text-sm border border-gray-700">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 space-y-10">
        {/* About & Story */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
            <h2 className="text-xl font-heading mb-3">Artist Story</h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
              {artist.artistStory || 'No story provided yet.'}
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl space-y-4">
            <h3 className="text-lg font-semibold">Contact & Links</h3>
            <div className="text-sm text-gray-300 space-y-2">
              {artist.contactPhone && <p><span className="text-gray-400">Phone:</span> {artist.contactPhone}</p>}
              {artist.website && (
                <p>
                  <Link href={artist.website} target="_blank" className="text-brand-gold hover:underline">
                    Website
                  </Link>
                </p>
              )}
              {artist.instagram && (
                <p>
                  <Link href={artist.instagram} target="_blank" className="text-brand-gold hover:underline">
                    Instagram
                  </Link>
                </p>
              )}
              {!artist.contactPhone && !artist.website && !artist.instagram && (
                <p className="text-gray-500">No contact details shared.</p>
              )}
            </div>

            {artist.skills && artist.skills.length > 0 && (
              <div>
                <h4 className="text-sm text-gray-400 mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {artist.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-gray-700 rounded-full text-xs border border-gray-600">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Portfolio */}
        {artist.portfolioImages && artist.portfolioImages.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-heading">Portfolio</h2>
              <span className="text-sm text-gray-400">{artist.portfolioImages.length} pieces</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {artist.portfolioImages.map((img, idx) => (
                <div key={idx} className="relative aspect-square overflow-hidden rounded-lg border border-gray-700">
                  <img src={img} alt={`Portfolio ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Artworks by artist */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading">Artworks by {artist.user.name}</h2>
            <Link href="/artworks" className="text-sm text-brand-gold hover:underline">Browse all artworks</Link>
          </div>

          {artworks.length === 0 ? (
            <p className="text-gray-400">No artworks uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {artworks.map((art) => (
                <Link
                  key={art._id}
                  href={`/artworks/${art._id}`}
                  className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700 hover:border-brand-gold/70 transition-all group"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-800">
                    <img
                      src={art.images?.[0] || 'https://placehold.co/400x400/444/fff.png'}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {art.status !== 'available' && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full uppercase">
                        {art.status}
                      </span>
                    )}
                    {art.featured && (
                      <span className="absolute top-2 left-2 bg-brand-gold text-gray-900 text-xs px-2 py-1 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">{art.title}</h3>
                    <p className="text-sm text-gray-400 mb-2">{art.category}</p>
                    <p className="text-xl font-bold text-brand-gold">৳{art.price.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
