'use client';

import { useEffect, useState } from 'react';
import Header from '@/app/components/Header';
import { auth } from '@/lib/firebase';
import { API_BASE_URL } from '@/lib/config';

type Enrollment = {
  _id: string;
  enrolledAt: string;
  workshop: {
    _id: string;
    title: string;
    thumbnail?: string;
  };
};

export default function ProfilePage() {
  const [enrolledWorkshops, setEnrolledWorkshops] = useState<Enrollment[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    fetch(`${API_BASE_URL}/api/workshops/my-enrollments?firebaseUID=${auth.currentUser.uid}`)
      .then((res) => res.json())
      .then((data) => setEnrolledWorkshops(data.enrollments || []))
      .catch((err) => console.error('Failed to load enrollments:', err));
  }, []);

  return (
    <main className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-heading text-white mb-6">My Profile</h1>
        <div className="mt-4">
          <h2 className="text-2xl font-bold text-brand-gold mb-6">My Enrolled Workshops</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrolledWorkshops.map((item) => (
              <div
                key={item._id}
                className="bg-gray-800 p-4 rounded-xl border border-white/5 flex gap-4 items-center"
              >
                <img
                  src={item.workshop?.thumbnail || 'https://placehold.co/80x80'}
                  alt={item.workshop?.title || 'Workshop'}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div>
                  <h4 className="font-bold text-white">{item.workshop?.title || 'Untitled Workshop'}</h4>
                  <p className="text-xs text-gray-400">
                    Joined on {new Date(item.enrolledAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {enrolledWorkshops.length === 0 && (
              <p className="text-gray-300">No enrolled workshops yet.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

