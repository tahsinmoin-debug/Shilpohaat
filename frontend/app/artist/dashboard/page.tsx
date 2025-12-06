"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

  if (loading) {
    return (
      <main>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-white text-lg">Loading...</p>
        </div>
      </main>
    );
  }

  // Check if profile is incomplete
  const isProfileIncomplete = !appUser?.artistProfile?.isProfileComplete;

  return (
    <main>
      <Header />
      <div className="min-h-screen container mx-auto px-4 py-12">
        <h1 className="text-3xl font-heading text-white mb-4">Artist Dashboard</h1>

        {isProfileIncomplete ? (
          <div className="bg-gray-800 rounded-lg p-8 max-w-2xl mx-auto text-center">
            <div className="mb-6">
              <svg
                className="w-20 h-20 mx-auto text-brand-gold mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <h2 className="text-2xl font-heading text-white mb-2">
                Complete Your Artist Profile
              </h2>
              <p className="text-gray-300 mb-6">
                Set up your profile to start showcasing your artwork and connect with art lovers.
              </p>
            </div>
            <Link
              href="/create-profile"
              className="inline-block px-8 py-3 bg-brand-gold text-gray-900 font-semibold rounded-md hover:bg-brand-gold-antique transition-colors shadow-lg"
            >
              Set Up My Profile
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Total Artworks</h3>
                <p className="text-3xl font-bold text-brand-gold">0</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Total Sales</h3>
                <p className="text-3xl font-bold text-brand-gold">৳0</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Profile Views</h3>
                <p className="text-3xl font-bold text-brand-gold">0</p>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-heading text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/artist/artworks/new"
                  className="block p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <p className="text-white font-semibold">+ Upload New Artwork</p>
                </Link>
                <Link
                  href="/create-profile"
                  className="block p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <p className="text-white font-semibold">✏️ Edit Profile</p>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
