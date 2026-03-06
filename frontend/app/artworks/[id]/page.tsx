"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/config';
import Header from '../../components/Header';
import CloudinaryResponsiveImage from '../../components/CloudinaryResponsiveImage';
import { useCart } from '../../components/CartProvider';
import ArtworkReviews from '../../components/Reviews/ArtworkReviews';
import ARViewer from '../../components/ARViewer';
import CameraARViewer from '../../components/CameraARViewer';
import WebXRViewer from '../../components/WebXRViewer';
import ARBadge from '../../components/ARBadge';
import WishlistButton from '../../components/WishlistButton';

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
  firebaseUID?: string;
  artistProfile?: ArtistProfile;
}

interface ArtworkCard {
  _id: string;
  title: string;
  price: number;
  images: string[];
  category: string;
}

interface Artwork {
  _id: string;
  title: string;
  description?: string;
  inspiration?: string;
  creationYear?: number;
  category: string;
  price: number;
  images: string[];
  arModelUrl?: string;
  status: 'available' | 'sold' | 'reserved';
  featured?: boolean;
  materials?: string[];
  framingStatus?: 'framed' | 'unframed' | 'not-applicable';
  shippingInfo?: {
    scope?: 'domestic' | 'international' | 'pickup-only';
    dispatchDays?: number;
    notes?: string;
  };
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

const shippingScopeLabel: Record<string, string> = {
  domestic: 'Domestic shipping',
  international: 'International shipping',
  'pickup-only': 'Pickup only',
};

const framingLabel: Record<string, string> = {
  framed: 'Framed',
  unframed: 'Unframed',
  'not-applicable': 'Not applicable',
};

const fallbackImage = 'https://placehold.co/1200x800/333/fff.png';

export default function ArtworkDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [shareFeedback, setShareFeedback] = useState('');
  const [artistArtworks, setArtistArtworks] = useState<ArtworkCard[]>([]);
  const [relatedArtworks, setRelatedArtworks] = useState<ArtworkCard[]>([]);

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/artworks/${params.id}`);
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

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!artwork?._id || !artwork.artist?._id) return;

      try {
        const [artistRes, relatedRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/artworks?artistId=${artwork.artist._id}&limit=8&fields=card`),
          fetch(`${API_BASE_URL}/api/artworks?category=${encodeURIComponent(artwork.category)}&limit=8&fields=card`),
        ]);

        const [artistData, relatedData] = await Promise.all([artistRes.json(), relatedRes.json()]);

        if (artistRes.ok) {
          const nextArtistArtworks = (artistData.artworks || []).filter((item: ArtworkCard) => item._id !== artwork._id);
          setArtistArtworks(nextArtistArtworks.slice(0, 6));
        }

        if (relatedRes.ok) {
          const nextRelated = (relatedData.artworks || []).filter(
            (item: ArtworkCard) => item._id !== artwork._id && item.category === artwork.category
          );
          setRelatedArtworks(nextRelated.slice(0, 6));
        }
      } catch (suggestionError) {
        console.error('Failed to load related artworks:', suggestionError);
      }
    };

    fetchSuggestions();
  }, [artwork?._id, artwork?.artist?._id, artwork?.category]);

  const mainImage = useMemo(() => {
    return selectedImage || artwork?.images?.[0] || fallbackImage;
  }, [selectedImage, artwork]);

  const imageList = useMemo(() => {
    return artwork?.images?.length ? artwork.images : [fallbackImage];
  }, [artwork]);

  const activeImageIndex = useMemo(() => {
    return Math.max(0, imageList.findIndex((img) => img === mainImage));
  }, [imageList, mainImage]);

  const aboutDescription = useMemo(() => {
    if (!artwork) return '';

    const description = artwork.description?.trim();
    if (description && description.length >= 40) {
      return description;
    }

    const medium = artwork.materials?.length ? artwork.materials.join(', ') : 'mixed media';
    const year = artwork.creationYear || 'recent years';
    const dims = formatDimensions(artwork.dimensions);

    return `This ${artwork.category.toLowerCase()} artwork explores a reflective mood and visual storytelling. It was created in ${year} using ${medium}${dims ? `, with a size of ${dims}` : ''}. The composition focuses on texture, balance, and a gallery-ready presentation that suits both home and office spaces.`;
  }, [artwork]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = artwork ? `${artwork.title} by ${artwork.artist.name}` : 'Artwork on Shilpohaat';

  function formatDimensions(dims?: Artwork['dimensions']) {
    if (!dims) return null;
    const parts = [] as string[];
    if (dims.width) parts.push(`${dims.width}`);
    if (dims.height) parts.push(`${dims.height}`);
    if (dims.depth) parts.push(`${dims.depth}`);
    if (!parts.length) return null;
    return `${parts.join(' x ')} ${dims.unit || ''}`.trim();
  }

  const handleZoomMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({ x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) });
  };

  const showPreviousImage = () => {
    if (!imageList.length) return;
    const prevIndex = (activeImageIndex - 1 + imageList.length) % imageList.length;
    setSelectedImage(imageList[prevIndex]);
  };

  const showNextImage = () => {
    if (!imageList.length) return;
    const nextIndex = (activeImageIndex + 1) % imageList.length;
    setSelectedImage(imageList[nextIndex]);
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareFeedback('Link copied');
      setTimeout(() => setShareFeedback(''), 2000);
    } catch {
      setShareFeedback('Copy failed');
      setTimeout(() => setShareFeedback(''), 2000);
    }
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

      <section className="relative h-[340px] w-full overflow-hidden">
        <div className="absolute inset-0">
          <CloudinaryResponsiveImage
            src={mainImage}
            alt={artwork.title}
            className="w-full h-full object-cover blur-sm scale-105"
            sizes="100vw"
            widths={[640, 960, 1200, 1600, 1920]}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent" />
        </div>
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-2">
              <p className="text-sm uppercase tracking-[0.2em] text-brand-gold/80">{artwork.category}</p>
              {artwork.images?.length > 0 && artwork.dimensions && <ARBadge hasARModel={true} compact />}
            </div>
            <h1 className="text-3xl md:text-4xl font-heading mt-2 mb-3">{artwork.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-gray-200">
              <Link href={`/artist/${artist._id}`} className="flex items-center gap-2 group">
                <div className="relative">
                  <CloudinaryResponsiveImage
                    src={artist.artistProfile?.profilePicture || 'https://placehold.co/48x48/666/fff.png'}
                    alt={artist.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-700"
                    sizes="40px"
                    widths={[40, 64, 96]}
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
              {artwork.views !== undefined && <span className="text-sm text-gray-400">{artwork.views} views</span>}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-gray-800 rounded-xl p-4 shadow-2xl border border-gray-700">
            <div
              className="relative w-full aspect-[4/3] overflow-hidden rounded-lg bg-gray-900"
              onMouseMove={handleZoomMove}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
            >
              <CloudinaryResponsiveImage
                src={mainImage}
                alt={artwork.title}
                className="w-full h-full object-contain transition-transform duration-200"
                style={{
                  transform: isZoomed ? 'scale(1.6)' : 'scale(1)',
                  transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                }}
                sizes="(max-width: 1024px) 100vw, 66vw"
                widths={[480, 640, 960, 1200]}
                crop="fit"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => setIsGalleryOpen(true)}
                  className="px-3 py-2 bg-black/60 hover:bg-black/75 text-sm rounded-md border border-white/10 transition-colors"
                >
                  Full screen
                </button>
              </div>
              <p className="hidden md:block absolute bottom-3 left-3 text-xs bg-black/50 px-2 py-1 rounded">
                Hover to zoom
              </p>
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
                    <CloudinaryResponsiveImage
                      src={img}
                      alt={`Artwork ${idx + 1}`}
                      className="w-full h-full object-cover"
                      sizes="(max-width: 768px) 25vw, 12vw"
                      widths={[120, 180, 240, 320]}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

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

              <div className="mt-4 p-3 rounded-lg border border-gray-700 bg-gray-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Save to wishlist</span>
                  <WishlistButton artworkId={artwork._id} />
                </div>
              </div>

              <div className="mt-3 p-3 rounded-lg border border-gray-700 bg-gray-900/40">
                <p className="text-sm text-gray-400 mb-2">Share</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={copyShareLink}
                    className="px-3 py-2 text-sm rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
                  >
                    Copy link
                  </button>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 text-sm rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
                  >
                    Facebook
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 text-sm rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
                  >
                    X
                  </a>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 text-sm rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
                  >
                    WhatsApp
                  </a>
                </div>
                {shareFeedback && <p className="text-xs text-green-400 mt-2">{shareFeedback}</p>}
              </div>

              <div className="mt-6 flex flex-col gap-3">
                {artwork.images?.length > 0 && artwork.dimensions && (
                  <>
                    {artwork.arModelUrl && /\.(glb|gltf)$/i.test(artwork.arModelUrl) ? (
                      <WebXRViewer
                        modelUrl={artwork.arModelUrl}
                        artworkTitle={artwork.title}
                        dimensions={artwork.dimensions}
                        fallback={
                          <ARViewer
                            modelUrl={artwork.arModelUrl}
                            artworkTitle={artwork.title}
                            dimensions={artwork.dimensions}
                            poster={artwork.images?.[0]}
                          />
                        }
                      />
                    ) : (
                      <CameraARViewer
                        imageUrl={artwork.images[0]}
                        artworkTitle={artwork.title}
                        dimensions={artwork.dimensions}
                      />
                    )}
                  </>
                )}

                <button
                  onClick={async () => {
                    setIsAddingToCart(true);
                    addToCart({
                      artworkId: artwork._id,
                      title: artwork.title,
                      price: artwork.price,
                      quantity: 1,
                      image: artwork.images?.[0],
                    });
                    alert('Added to cart');
                    setIsAddingToCart(false);
                  }}
                  disabled={isAddingToCart || artwork.status !== 'available'}
                  className={`w-full font-semibold py-3 rounded-lg transition-colors shadow-lg ${
                    artwork.status !== 'available'
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-brand-gold text-gray-900 hover:bg-brand-gold-antique'
                  }`}
                >
                  {artwork.status !== 'available' ? `Not Available (${artwork.status})` : isAddingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
                <button
                  onClick={() => {
                    const artistId = artwork.artist?.firebaseUID || artwork.artist?._id || artwork.artist;
                    if (artistId) {
                      router.push(`/messages?artistId=${artistId}`);
                    } else {
                      alert('Artist information not available');
                    }
                  }}
                  className="w-full bg-gray-700 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition-colors border border-gray-600"
                >
                  Contact Artist
                </button>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <CloudinaryResponsiveImage
                  src={artist.artistProfile?.profilePicture || 'https://placehold.co/64x64/666/fff.png'}
                  alt={artist.name}
                  className="w-12 h-12 rounded-full object-cover border border-gray-700"
                  sizes="48px"
                  widths={[64, 96]}
                />
                <div>
                  <p className="text-sm text-gray-400">Artist</p>
                  <p className="font-semibold text-white">{artist.name}</p>
                  {artist.artistProfile?.specializations && (
                    <p className="text-xs text-gray-400">{artist.artistProfile.specializations.slice(0, 2).join(', ')}</p>
                  )}
                </div>
              </div>

              {artist.artistProfile?.bio && (
                <p className="text-gray-300 text-sm leading-relaxed mb-3">{artist.artistProfile.bio}</p>
              )}

              <Link
                href={`/artist/${artist._id}`}
                className="inline-block mb-3 text-brand-gold hover:text-brand-gold-antique text-sm font-semibold"
              >
                View Artist Profile
              </Link>

              {artistArtworks.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">More from this artist</p>
                  <div className="grid grid-cols-3 gap-2">
                    {artistArtworks.slice(0, 3).map((item) => (
                      <Link key={item._id} href={`/artworks/${item._id}`} className="rounded-md overflow-hidden border border-gray-700">
                        <CloudinaryResponsiveImage
                          src={item.images?.[0] || fallbackImage}
                          alt={item.title}
                          className="w-full h-20 object-cover hover:scale-105 transition-transform"
                          sizes="96px"
                          widths={[120, 180]}
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3 text-sm">
                {artist.artistProfile?.instagram && (
                  <Link href={artist.artistProfile.instagram} target="_blank" className="text-brand-gold hover:underline">
                    Instagram
                  </Link>
                )}
                {artist.artistProfile?.website && (
                  <Link href={artist.artistProfile.website} target="_blank" className="text-brand-gold hover:underline">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
          <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
            <h2 className="text-xl font-heading mb-3">About this artwork</h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">{aboutDescription}</p>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-700">
                <p className="text-gray-400">Inspiration</p>
                <p className="text-gray-200 mt-1">
                  {artwork.inspiration?.trim() || 'Inspired by daily life, memory, and the emotional mood of the scene.'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-700">
                <p className="text-gray-400">Medium</p>
                <p className="text-gray-200 mt-1">
                  {artwork.materials?.length ? artwork.materials.join(', ') : 'Mixed media'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-700">
                <p className="text-gray-400">Dimensions</p>
                <p className="text-gray-200 mt-1">{dimensions || 'Details available on request'}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-700">
                <p className="text-gray-400">Creation Year</p>
                <p className="text-gray-200 mt-1">{artwork.creationYear || 'Recently created'}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl space-y-4">
            <h3 className="text-lg font-semibold">Key details</h3>
            <div className="text-gray-300 text-sm space-y-2">
              <p><span className="text-gray-400">Category:</span> {artwork.category}</p>
              <p><span className="text-gray-400">Status:</span> {artwork.status}</p>
              <p><span className="text-gray-400">Artwork size:</span> {dimensions || 'Not specified'}</p>
              <p><span className="text-gray-400">Material:</span> {artwork.materials?.length ? artwork.materials.join(', ') : 'Not specified'}</p>
              <p><span className="text-gray-400">Framing:</span> {framingLabel[artwork.framingStatus || 'unframed']}</p>
              <p><span className="text-gray-400">Shipping:</span> {shippingScopeLabel[artwork.shippingInfo?.scope || 'domestic']}</p>
              <p>
                <span className="text-gray-400">Dispatch time:</span>{' '}
                {artwork.shippingInfo?.dispatchDays ? `${artwork.shippingInfo.dispatchDays} days` : '7 days'}
              </p>
              {artwork.shippingInfo?.notes && (
                <p><span className="text-gray-400">Shipping notes:</span> {artwork.shippingInfo.notes}</p>
              )}
              {artwork.views !== undefined && <p><span className="text-gray-400">Views:</span> {artwork.views}</p>}
              {artwork.featured && <p className="text-brand-gold">Featured artwork</p>}
            </div>
          </div>
        </div>

        <div className="mt-10">
          <ArtworkReviews artworkId={artwork._id} />
        </div>

        {(relatedArtworks.length > 0 || artistArtworks.length > 0) && (
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {relatedArtworks.length > 0 && (
              <section className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Related Artworks</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {relatedArtworks.map((item) => (
                    <Link key={item._id} href={`/artworks/${item._id}`} className="group">
                      <div className="rounded-lg overflow-hidden border border-gray-700">
                        <CloudinaryResponsiveImage
                          src={item.images?.[0] || fallbackImage}
                          alt={item.title}
                          className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                          sizes="160px"
                          widths={[180, 240]}
                        />
                      </div>
                      <p className="text-sm mt-2 line-clamp-1">{item.title}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {artistArtworks.length > 0 && (
              <section className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">More from this Artist</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {artistArtworks.map((item) => (
                    <Link key={item._id} href={`/artworks/${item._id}`} className="group">
                      <div className="rounded-lg overflow-hidden border border-gray-700">
                        <CloudinaryResponsiveImage
                          src={item.images?.[0] || fallbackImage}
                          alt={item.title}
                          className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                          sizes="160px"
                          widths={[180, 240]}
                        />
                      </div>
                      <p className="text-sm mt-2 line-clamp-1">{item.title}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </section>

      {isGalleryOpen && (
        <div className="fixed inset-0 z-[70] bg-black/95 p-4 md:p-8">
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-300">
                {activeImageIndex + 1} / {imageList.length}
              </p>
              <button
                onClick={() => setIsGalleryOpen(false)}
                className="px-3 py-2 rounded-md border border-gray-600 hover:bg-gray-800 text-sm"
              >
                Close
              </button>
            </div>
            <div className="flex-1 relative bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
              <CloudinaryResponsiveImage
                src={mainImage}
                alt={artwork.title}
                className="w-full h-full object-contain"
                sizes="100vw"
                widths={[640, 960, 1280, 1600]}
                crop="fit"
              />
              {imageList.length > 1 && (
                <>
                  <button
                    onClick={showPreviousImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 border border-white/10"
                  >
                    ‹
                  </button>
                  <button
                    onClick={showNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 border border-white/10"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
            {imageList.length > 1 && (
              <div className="grid grid-cols-5 md:grid-cols-8 gap-2 mt-4">
                {imageList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`rounded-md overflow-hidden border ${mainImage === img ? 'border-brand-gold' : 'border-gray-700'}`}
                  >
                    <CloudinaryResponsiveImage
                      src={img}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-14 object-cover"
                      sizes="72px"
                      widths={[120]}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
