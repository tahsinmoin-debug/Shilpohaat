"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';
import { useAuth } from '../components/AuthProvider';
import { API_BASE_URL } from '@/lib/config';

interface Order {
  _id: string;
  createdAt: string;
  totalAmount: number;
  status: string;
}

export default function AccountPage() {
  const router = useRouter();
  const { user, appUser, loading } = useAuth();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        const res = await fetch(`${API_BASE_URL}/api/orders/user/${user.uid}`);
        if (res.ok) {
          const data = await res.json();
          setRecentOrders(data.orders?.slice(0, 5) || []);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoadingOrders(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900">
        <Header />
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-12">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading text-white mb-2">My Account</h1>
          <p className="text-gray-400">Welcome back, {appUser?.name || user?.displayName || user?.email}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-brand-gold">{recentOrders.length}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Account Type</h3>
            <p className="text-xl font-semibold text-white capitalize">{appUser?.role || 'Buyer'}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Member Since</h3>
            <p className="text-xl font-semibold text-white">
              {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl mb-8">
          <h2 className="text-xl font-heading text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/wishlist" className="block p-4 bg-gray-700 rounded-lg hover:border-brand-gold border border-transparent transition-all group">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                </svg>
                <div>
                  <p className="text-white font-semibold group-hover:text-brand-gold transition-colors">My Wishlist</p>
                  <span className="text-xs text-gray-400">Saved artworks</span>
                </div>
              </div>
            </Link>

            <Link href="/cart" className="block p-4 bg-gray-700 rounded-lg hover:border-brand-gold border border-transparent transition-all group">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div>
                  <p className="text-white font-semibold group-hover:text-brand-gold transition-colors">Shopping Cart</p>
                  <span className="text-xs text-gray-400">View cart items</span>
                </div>
              </div>
            </Link>

            <Link href="/artworks" className="block p-4 bg-gray-700 rounded-lg hover:border-brand-gold border border-transparent transition-all group">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-white font-semibold group-hover:text-brand-gold transition-colors">Browse Art</p>
                  <span className="text-xs text-gray-400">Explore gallery</span>
                </div>
              </div>
            </Link>

            <Link href="/artists" className="block p-4 bg-gray-700 rounded-lg hover:border-brand-gold border border-transparent transition-all group">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div>
                  <p className="text-white font-semibold group-hover:text-brand-gold transition-colors">Artists</p>
                  <span className="text-xs text-gray-400">Discover creators</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
          <h2 className="text-xl font-heading text-white mb-4">Recent Orders</h2>
          {loadingOrders ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold mx-auto"></div>
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order._id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between hover:bg-gray-600 transition-colors">
                  <div>
                    <p className="text-white font-semibold">Order #{order._id.slice(-8)}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-brand-gold font-bold">৳{order.totalAmount.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'completed' ? 'bg-green-900/30 text-green-400' :
                      order.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' :
                      'bg-gray-600 text-gray-300'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-gray-400 mb-4">No orders yet</p>
              <Link href="/artworks" className="inline-block px-6 py-2 bg-brand-gold text-gray-900 font-semibold rounded-lg hover:bg-brand-gold-antique transition-colors">
                Start Shopping
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
