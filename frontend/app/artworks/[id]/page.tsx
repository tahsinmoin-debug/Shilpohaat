"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';

interface ArtistProfile {
  profilePicture?: string;
  specializations?: string[];
  bio?: string;
  contactPhone?: string;
  website?: string;
  instagram?: string;
  availability?: string;
}

interface Artist {
  _id: string;
  name: string;
  artistProfile?: ArtistProfile;
}

interface Artwork {
  _id: string;
  title: string;
  description?: string;
  category: string;
  price: number;
  images: string[];
  status: 'available' | 'sold' | 'reserved';
  featured?: boolean;
  materials?: string[];
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
    unit?: string;
  };
  views?: number;
  artist: Artist;
}

interface PageProps {
  params: { id: string };
}

export default function ArtworkDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/artworks/${params.id}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to load artwork');
        }
        setArtwork(data.artwork);
        setSelectedImage(data.artwork?.images?.[0] || null);
      } catch (err: any) {
        setError(err.message || 'Failed to load artwork');
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [params.id]);

  const mainImage = useMemo(() => {
    return selectedImage || artwork?.images?.[0] || 'https://placehold.co/1200x800/333/fff.png';
  }, [selectedImage, artwork]);

  const formatDimensions = (dims?: Artwork['dimensions']) => {
    if (!dims) return null;
    const parts = [] as string[];
    if (dims.width) parts.push(`${dims.width}`);
    if (dims.height) parts.push(`${dims.height}`);
    if (dims.depth) parts.push(`${dims.depth}`);
    if (!parts.length) return null;
    return `${parts.join(' x ')} ${dims.unit || ''}`.trim();
  };

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

  if (error || !artwork) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <p className="text-red-400 text-lg mb-3">{error || 'Artwork not found'}</p>
          <button
            onClick={() => router.push('/artworks')}
            className="px-6 py-3 bg-brand-gold text-gray-900 font-semibold rounded-md hover:bg-brand-gold-antique transition-colors"
          >
            Back to Artworks
          </button>
        </div>
      </main>
    );
  }

  const { artist } = artwork;
  const availability = artist.artistProfile?.availability;
  const dimensions = formatDimensions(artwork.dimensions);

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <Header />

      {/* Hero banner */}
      <section className="relative h-[340px] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={mainImage}
            alt={artwork.title}
            className="w-full h-full object-cover blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent" />
        </div>
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4">
            <p className="text-sm uppercase tracking-[0.2em] text-brand-gold/80">{artwork.category}</p>
            <h1 className="text-3xl md:text-4xl font-heading mt-2 mb-3">{artwork.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-gray-200">
              <Link href={`/artist/${artist._id}`} className="flex items-center gap-2 group">
                <div className="relative">
                  <img
                    src={artist.artistProfile?.profilePicture || 'https://placehold.co/48x48/666/fff.png'}
                    alt={artist.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-700"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${
                      availability === 'available'
                        ? 'bg-green-500'
                        : availability === 'busy'
                        ? 'bg-yellow-500'
                        : 'bg-gray-500'
                    }`}
                  />
                </div>
                <span className="font-semibold group-hover:text-brand-gold transition-colors">{artist.name}</span>
              </Link>
              <span className="text-sm bg-gray-800 px-3 py-1 rounded-full capitalize">{artwork.status}</span>
              {artwork.featured && (
                <span className="text-sm bg-brand-gold text-gray-900 px-3 py-1 rounded-full">Featured</span>
              )}
              {artwork.views !== undefined && (
                <span className="text-sm text-gray-400">{artwork.views} views</span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Gallery */}
          <div className="lg:col-span-2 bg-gray-800 rounded-xl p-4 shadow-2xl border border-gray-700">
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg bg-gray-900">
              <img
                src={mainImage}
                alt={artwork.title}
                className="w-full h-full object-contain"
              />
            </div>
            {artwork.images?.length > 1 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
                {artwork.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`aspect-square rounded-lg overflow-hidden border transition-all ${
                      selectedImage === img
                        ? 'border-brand-gold ring-2 ring-brand-gold/40'
                        : 'border-gray-700 hover:border-brand-gold/60'
                    }`}
                  >
                    <img src={img} alt={`Artwork ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar info */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-wide text-gray-400">Price</p>
                  <p className="text-3xl font-bold text-brand-gold mt-1">৳{artwork.price.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Category</p>
                  <p className="font-semibold">{artwork.category}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={() => alert('Cart functionality coming soon!')}
                  className="w-full bg-brand-gold text-gray-900 font-semibold py-3 rounded-lg hover:bg-brand-gold-antique transition-colors shadow-lg"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => alert('Contact seller feature coming soon!')}
                  className="w-full bg-gray-700 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition-colors border border-gray-600"
                >
                  Contact the Artist
                </button>
              </div>

              {dimensions && (
                <div className="mt-6">
                  <p className="text-sm text-gray-400">Dimensions</p>
                  <p className="font-semibold">{dimensions}</p>
                </div>
              )}

              {artwork.materials && artwork.materials.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm text-gray-400 mb-2">Materials</p>
                  <div className="flex flex-wrap gap-2">
                    {artwork.materials.map((mat) => (
                      <span
                        key={mat}
                        className="px-3 py-1 bg-gray-700 rounded-full text-sm border border-gray-600"
                      >
                        {mat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={artist.artistProfile?.profilePicture || 'https://placehold.co/64x64/666/fff.png'}
                  alt={artist.name}
                  className="w-12 h-12 rounded-full object-cover border border-gray-700"
                />
                <div>
                  <p className="text-sm text-gray-400">Artist</p>
                  <p className="font-semibold text-white">{artist.name}</p>
                  {artist.artistProfile?.specializations && (
                    <p className="text-xs text-gray-400">
                      {artist.artistProfile.specializations.slice(0, 2).join(', ')}
                    </p>
                  )}
                </div>
              </div>

              {artist.artistProfile?.bio && (
                <p className="text-gray-300 text-sm leading-relaxed mb-3">
                  {artist.artistProfile.bio}
                </p>
              )}

              <div className="flex flex-wrap gap-3 text-sm">
                {artist.artistProfile?.instagram && (
                  <Link
                    href={artist.artistProfile.instagram}
                    target="_blank"
                    className="text-brand-gold hover:underline"
                  >
                    Instagram
                  </Link>
                )}
                {artist.artistProfile?.website && (
                  <Link
                    href={artist.artistProfile.website}
                    target="_blank"
                    className="text-brand-gold hover:underline"
                  >
                    Website
                  </Link>
                )}
                {artist.artistProfile?.contactPhone && (
                  <span className="text-gray-300">Call: {artist.artistProfile.contactPhone}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
          <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
            <h2 className="text-xl font-heading mb-3">About this artwork</h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
              {artwork.description || 'No description provided.'}
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl space-y-4">
            <h3 className="text-lg font-semibold">Key details</h3>
            <div className="text-gray-300 text-sm space-y-2">
              <p><span className="text-gray-400">Category:</span> {artwork.category}</p>
              <p><span className="text-gray-400">Status:</span> {artwork.status}</p>
              {dimensions && <p><span className="text-gray-400">Size:</span> {dimensions}</p>}
              {artwork.materials && artwork.materials.length > 0 && (
                <p>
                  <span className="text-gray-400">Materials:</span> {artwork.materials.join(', ')}
                </p>
              )}
              {artwork.views !== undefined && (
                <p><span className="text-gray-400">Views:</span> {artwork.views}</p>
              )}
              {artwork.featured && <p className="text-brand-gold">Featured artwork</p>}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-10">
          <button
            onClick={() => router.push('/artworks')}
            className="text-brand-gold hover:underline"
          >
            ← Back to all artworks
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="text-sm text-gray-400 hover:text-brand-gold"
          >
            Share this artwork
          </button>
        </div>
      </section>
    </main>
  );
}
