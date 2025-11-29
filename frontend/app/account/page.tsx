"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import { useAuth } from '../components/AuthProvider';

export default function AccountPage() {
  const router = useRouter();
  const { user, appUser, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (!appUser || appUser.role !== 'buyer') {
        router.push('/');
        return;
      }
    }
  }, [user, appUser, loading, router]);

  return (
    <main>
      <Header />
      <div className="min-h-screen container mx-auto px-4 py-12">
        <h1 className="text-3xl font-heading text-white mb-4">My Account</h1>
        <p className="text-gray-300">Orders, wishlist, and profile settings will go here.</p>
      </div>
    </main>
  );
}
