"use client";

import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useAuth } from '../components/AuthProvider';
import Link from 'next/link';

// Define interface to prevent TypeScript "never" errors
interface Artwork {
  _id: string;
  title: string;
  price: number;
  images: string[];
}

export default function WishlistPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Fetch user's wishlist from the backend
      fetch(`http://localhost:5000/api/wishlist/${user.uid}`)
        .then(res => res.json())
        .then(data => {
          setItems(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching wishlist:", err);
          setLoading(false);
        });
    }
  }, [user]);

  if (loading) {
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
            {/* UPDATED: Link takes user back to the main artwork gallery */}
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
                className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 group hover:border-brand-gold/50 transition-all shadow-lg"
              >
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