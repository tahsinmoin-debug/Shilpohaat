"use client";

import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useAuth } from '../components/AuthProvider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../components/LoadingSpinner';
import { API_BASE_URL } from '@/lib/config';

interface Artwork {
  _id: string;
  title: string;
  price: number;
  images: string[];
  category?: string;
  status?: 'available' | 'sold' | 'reserved';
  artist?: {
    _id: string;
    name: string;
  };
}

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // 1. Fetch Wishlist Data
  const fetchWishlist = async () => {
    if (user) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/wishlist/${user.uid}`);
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error("Error fetching wishlist:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    fetchWishlist();
  }, [user, authLoading]);

  // 2. Remove Item with UI Feedback
  const handleRemove = async (artworkId: string) => {
    if (!user) return;
    setIsRemoving(artworkId);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/wishlist/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, artworkId })
      });
      
      if (res.ok) {
        setItems(items.filter(item => item._id !== artworkId));
      }
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setIsRemoving(null);
    }
  };

  // 3. Clear All Items
  const handleClearAll = async () => {
    if (!user || items.length === 0) return;
    setIsClearing(true);
    
    try {
      const promises = items.map(item =>
        fetch(`${API_BASE_URL}/api/wishlist/toggle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.uid, artworkId: item._id })
        })
      );
      
      await Promise.all(promises);
      setItems([]);
      setShowClearConfirm(false);
    } catch (error) {
      console.error("Error clearing wishlist:", error);
    } finally {
      setIsClearing(false);
    }
  };

  // Handy Tool: Calculate total value of wishlist
  const totalWishlistValue = items.reduce((sum, item) => sum + item.price, 0);

  if (loading || authLoading) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-6 mx-auto opacity-30">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-4">Sign in to view your wishlist</h2>
            <p className="text-gray-400 mb-8">Save your favorite artworks and access them anytime</p>
            <Link 
              href="/login" 
              className="inline-block bg-brand-gold text-black px-8 py-3 rounded-lg font-bold hover:bg-brand-gold-antique transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white selection:bg-brand-gold/30">
      <Header />
      
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 border-b border-gray-800 pb-8">
          <div>
            <h1 className="text-4xl font-heading font-bold text-white flex items-center gap-3">
              Gallery Favorites <span className="text-2xl opacity-50">/ {items.length}</span>
            </h1>
            <p className="text-gray-500 mt-2 text-sm uppercase tracking-widest font-bold">Curated for your collection</p>
          </div>
          
          {items.length > 0 && (
            <div className="flex gap-3">
              <div className="bg-gray-900 border border-gray-800 px-6 py-3 rounded-2xl flex items-center gap-6 shadow-xl">
                <div>
                  <p className="text-[10px] uppercase tracking-tighter text-gray-500 font-bold">Estimated Value</p>
                  <p className="text-xl font-bold text-brand-gold">৳{totalWishlistValue.toLocaleString()}</p>
                </div>
                <Link 
                  href="/artworks" 
                  className="bg-gray-800 hover:bg-gray-700 text-xs font-bold py-2 px-4 rounded-xl transition-all border border-gray-700"
                >
                  Add More
                </Link>
              </div>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 px-4 py-2 rounded-xl text-sm font-bold transition-all"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Clear All Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold mb-4">Clear All Items?</h3>
              <p className="text-gray-400 mb-6">This will remove all {items.length} artworks from your wishlist. This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-xl font-bold transition-all"
                  disabled={isClearing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                  disabled={isClearing}
                >
                  {isClearing ? 'Clearing...' : 'Clear All'}
                </button>
              </div>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-gray-900/20 border border-dashed border-gray-800 rounded-[3rem] text-center">
            <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-6 opacity-30">
               <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">No masterpieces saved yet</h2>
            <p className="text-gray-500 mb-8 text-sm">Your dream collection is just one click away.</p>
            <Link 
              href="/artworks" 
              className="bg-brand-gold text-black px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all active:scale-95"
            >
                Explore Gallery
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((artwork) => (
              <div 
                key={artwork._id} 
                className={`group relative bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden hover:border-brand-gold/40 transition-all duration-500 ${isRemoving === artwork._id ? 'opacity-50 scale-95' : 'opacity-100'}`}
              >
                {/* IMAGE AREA */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img 
                    src={artwork.images[0] || 'https://placehold.co/600x800/333/fff.png'} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    alt={artwork.title} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-80" />
                  
                  {/* Status Badge */}
                  {artwork.status && artwork.status !== 'available' && (
                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      artwork.status === 'sold' ? 'bg-red-500 text-white' :
                      artwork.status === 'reserved' ? 'bg-yellow-500 text-gray-900' : ''
                    }`}>
                      {artwork.status}
                    </div>
                  )}
                  
                  {/* QUICK ACTIONS ON HOVER */}
                  <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex justify-end">
                        <button 
                            onClick={() => handleRemove(artwork._id)}
                            className="bg-red-500/90 backdrop-blur-md text-white p-2.5 rounded-2xl hover:bg-red-600 transition-all shadow-xl active:scale-90"
                            disabled={isRemoving === artwork._id}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                  </div>

                  {/* TITLE, ARTIST & PRICE ON IMAGE */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
                    <h3 className="text-white font-bold text-xl mb-1 line-clamp-1 group-hover:text-brand-gold transition-colors">{artwork.title}</h3>
                    {artwork.artist && (
                      <p className="text-gray-300 text-sm mb-2">by {artwork.artist.name}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-brand-gold text-sm font-black tracking-widest uppercase">৳{artwork.price.toLocaleString()}</p>
                      {artwork.category && (
                        <span className="text-xs bg-gray-800/80 backdrop-blur-sm text-gray-300 px-2 py-1 rounded-lg">
                          {artwork.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* INTERACTIVE FOOTER */}
                <div className="p-4 bg-gray-900 flex gap-2">
                  <Link 
                    href={`/artworks/${artwork._id}`} 
                    className="flex-1 text-center py-3 bg-gray-800 hover:bg-brand-gold hover:text-black text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-gray-700 hover:border-brand-gold shadow-lg"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .font-heading { font-family: var(--font-heading), serif; }
      `}</style>
    </main>
  );
}
