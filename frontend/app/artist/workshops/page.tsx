"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import Header from '@/app/components/Header';
import { useAuth } from '@/app/components/AuthProvider';

export default function InstructorWorkshopsPage() {
  const router = useRouter();
  const { user, appUser, loading: authLoading } = useAuth();
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user || appUser?.role !== 'artist') {
        router.push('/');
        return;
      }
      fetchWorkshops();
    }
  }, [user, appUser, authLoading]);

  const fetchWorkshops = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/workshops/instructor/my-workshops?firebaseUID=${auth.currentUser?.uid}`
      );
      const data = await res.json();
      if (data.success) {
        setWorkshops(data.workshops);
      }
    } catch (error) {
      console.error('Failed to fetch workshops:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-600 text-white',
      pending: 'bg-yellow-600 text-white',
      approved: 'bg-green-600 text-white',
      rejected: 'bg-red-600 text-white',
      archived: 'bg-gray-700 text-gray-400'
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-brand-maroon">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-white">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-maroon to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-heading text-white">My Workshops</h1>
          <Link
            href="/artist/workshops/create"
            className="bg-brand-gold text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-500"
          >
            + Create Workshop
          </Link>
        </div>

        {workshops.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-lg mb-4">You haven't created any workshops yet.</p>
            <Link
              href="/artist/workshops/create"
              className="inline-block bg-brand-gold text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-500"
            >
              Create Your First Workshop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workshops.map((workshop: any) => (
              <div key={workshop._id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                <div className="relative h-48">
                  <img
                    src={workshop.thumbnail || 'https://placehold.co/400x300/333/FFF'}
                    alt={workshop.title}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(workshop.status)}`}>
                    {workshop.status.toUpperCase()}
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="text-xl font-heading text-white mb-2 line-clamp-2">{workshop.title}</h3>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <span>👥 {workshop.enrollmentCount}</span>
                    {workshop.averageRating > 0 && (
                      <span>⭐ {workshop.averageRating.toFixed(1)}</span>
                    )}
                    <span className="text-brand-gold font-bold">
                      {workshop.price === 0 ? 'FREE' : `৳${workshop.price}`}
                    </span>
                  </div>

                  {workshop.rejectionReason && (
                    <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg text-sm mb-4">
                      <p className="font-semibold">Rejection Reason:</p>
                      <p>{workshop.rejectionReason}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link
                      href={`/artist/workshops/${workshop._id}/edit`}
                      className="flex-1 bg-gray-700 text-white py-2 rounded text-center hover:bg-gray-600"
                    >
                      Edit
                    </Link>
                    {workshop.status === 'draft' && (
                      <Link
                        href={`/artist/workshops/${workshop._id}/edit?submit=true`}
                        className="flex-1 bg-brand-gold text-gray-900 py-2 rounded text-center hover:bg-yellow-500 font-semibold"
                      >
                        Submit
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}