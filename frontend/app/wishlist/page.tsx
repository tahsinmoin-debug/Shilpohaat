"use client";

import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useAuth } from '../components/AuthProvider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Define interface to prevent TypeScript "never" errors
interface Artwork {
  _id: string;
  title: string;
  price: number;
  images: string[];
}

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Wishlist Data
  const fetchWishlist = async () => {
    if (user) {
      try {
        const res = await fetch(`http://localhost:5000/api/wishlist/${user.uid}`);
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
      router.push('/login'); // Redirect to login if not authenticated
      return;
    }
    fetchWishlist();
  }, [user, authLoading]);

  // 2. NEW: Remove Item Function
  const handleRemove = async (artworkId: string) => {
    if (!user) return;
    
    try {
      const res = await fetch('http://localhost:5000/api/wishlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, artworkId })
      });
      
      if (res.ok) {
        // Update local state to remove the item immediately
        setItems(items.filter(item => item._id !== artworkId));
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  if (loading || authLoading) {
    return (
      <main className="min-h-screen bg-gray-900 text-white">
        <Header />
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-heading">My Favorites ❤️</h1>
          <p className="text-gray-400">{items.length} items saved</p>
        </div>
        
        {items.length === 0 ? (
          <div className="text-center py-20 bg-gray-800 rounded-xl border border-gray-700 shadow-xl">
            <span className="text-6xl mb-4 block">🎨</span>
            <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              You haven't saved any artworks yet. Explore our collection and find pieces that inspire you.
            </p>
            <Link 
              href="/artworks" 
              className="inline-block bg-brand-gold text-gray-900 px-8 py-3 rounded-md font-bold hover:bg-brand-gold-antique transition-colors shadow-lg"
            >
                Go Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((artwork) => (
              <div 
                key={artwork._id} 
                className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 group hover:border-brand-gold/50 transition-all shadow-lg relative"
              >
                {/* REMOVE BUTTON */}
                <button 
                  onClick={() => handleRemove(artwork._id)}
                  className="absolute top-2 right-2 z-10 p-2 bg-gray-900/60 hover:bg-red-500 text-white rounded-full transition-colors"
                  title="Remove from wishlist"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={artwork.images[0] || 'https://placehold.co/600x400/333/fff.png'} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    alt={artwork.title} 
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                </div>
                
                <div className="p-5">
                  <h3 className="text-white font-bold text-lg mb-1 truncate">{artwork.title}</h3>
                  <p className="text-brand-gold font-semibold mb-5">৳{artwork.price.toLocaleString()}</p>
                  
                  <Link 
                    href={`/artworks/${artwork._id}`} 
                    className="block text-center py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 border border-gray-600 transition-colors font-medium"
                  >
                    View Artwork
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}