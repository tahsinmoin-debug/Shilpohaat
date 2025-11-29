"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import { useAuth } from '../../components/AuthProvider';

export default function ArtistDashboardPage() {
  const router = useRouter();
  const { user, appUser, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (!appUser || appUser.role !== 'artist') {
        router.push('/');
        return;
      }
    }
  }, [user, appUser, loading, router]);

  return (
    <main>
      <Header />
      <div className="min-h-screen container mx-auto px-4 py-12">
        <h1 className="text-3xl font-heading text-white mb-4">Artist Dashboard</h1>
        <p className="text-gray-300">Welcome! We’ll build analytics, artworks table, and tools here.</p>
      </div>
    </main>
  );
}
