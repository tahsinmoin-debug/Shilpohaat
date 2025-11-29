"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import { useAuth } from '../components/AuthProvider';

export default function CreateProfilePage() {
  const router = useRouter();
  const { user, appUser, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (appUser && appUser.role !== 'artist') {
        router.push('/');
        return;
      }
      if (appUser && appUser.artistProfile) {
        router.push('/artist/dashboard');
      }
    }
  }, [user, appUser, loading, router]);

  return (
    <main>
      <Header />
      <div className="min-h-screen container mx-auto px-4 py-12">
        <h1 className="text-3xl font-heading text-white mb-4">Create Your Artist Profile</h1>
        <p className="text-gray-300 mb-6">This is a placeholder page. We will add the full profile form next.</p>
        <div className="bg-gray-800 rounded-lg p-6 text-gray-200">
          <ul className="list-disc pl-5 space-y-2">
            <li>Upload profile picture</li>
            <li>Write your bio</li>
            <li>Select specializations</li>
            <li>Add portfolio images</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
