"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import Header from '@/app/components/Header';
import { useAuth } from '@/app/components/AuthProvider';

interface Workshop {
  _id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  thumbnail: string;
  price: number;
  status: string;
  enrollmentCount: number;
  averageRating: number;
  totalReviews: number;
  rejectionReason?: string;
  createdAt: string;
}

export default function InstructorWorkshopsPage() {
  const router = useRouter();
  const { user, appUser, loading: authLoading } = useAuth();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
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
      <main className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold mx-auto"></div>
          <p className="text-white mt-4">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8 bg-[rgba(6,21,35,0.32)] backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-xl">
          <div>
            <h1 className="text-4xl font-heading text-white mb-2">My Workshops</h1>
            <p className="text-gray-200">Create and manage your workshops</p>
          </div>
          <Link
            href="/artist/workshops/create"
            className="bg-brand-gold text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors"
          >
            + Create New Workshop
          </Link>
        </div>

        {workshops.length === 0 ? (
          <div className="text-center py-16 bg-[rgba(6,21,35,0.32)] backdrop-blur-md rounded-lg border border-white/10 shadow-xl">
            <div className="text-6xl mb-4">🎨</div>
            <h2 className="text-2xl font-heading text-white mb-4">No Workshops Yet</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Start sharing your knowledge! Create your first workshop and help others learn your craft.
            </p>
            <Link
              href="/artist/workshops/create"
              className="inline-block bg-brand-gold text-gray-900 px-8 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors"
            >
              Create Your First Workshop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workshops.map((workshop) => (
              <div key={workshop._id} className="bg-[rgba(6,21,35,0.58)] backdrop-blur-sm rounded-lg overflow-hidden border border-white/10 hover:border-brand-gold transition-colors shadow-xl">
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
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-[rgba(255,255,255,0.14)] text-gray-200 px-2 py-1 rounded">
                      {workshop.category}
                    </span>
                    <span className="text-xs bg-[rgba(255,255,255,0.14)] text-gray-200 px-2 py-1 rounded">
                      {workshop.type}
                    </span>
                  </div>

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
                      <p className="font-semibold mb-1">Rejection Reason:</p>
                      <p>{workshop.rejectionReason}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {workshop.status === 'draft' || workshop.status === 'rejected' ? (
                      <>
                        <Link
                          href={`/artist/workshops/${workshop._id}/edit`}
                          className="flex-1 bg-gray-700 text-white py-2 rounded text-center hover:bg-gray-600 text-sm"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/artist/workshops/${workshop._id}/edit?submit=true`}
                          className="flex-1 bg-brand-gold text-gray-900 py-2 rounded text-center hover:bg-yellow-500 font-semibold text-sm"
                        >
                          Submit for Approval
                        </Link>
                      </>
                    ) : workshop.status === 'approved' ? (
                      <>
                        <Link
                          href={`/workshops/${workshop._id}`}
                          className="flex-1 bg-green-600 text-white py-2 rounded text-center hover:bg-green-700 text-sm"
                        >
                          View Live
                        </Link>
                        <Link
                          href={`/artist/workshops/${workshop._id}/enrollments`}
                          className="flex-1 bg-gray-700 text-white py-2 rounded text-center hover:bg-gray-600 text-sm"
                        >
                          Students
                        </Link>
                      </>
                    ) : workshop.status === 'pending' ? (
                      <div className="flex-1 bg-yellow-600/20 border border-yellow-600 text-yellow-400 py-2 rounded text-center text-sm">
                        Awaiting Approval
                      </div>
                    ) : null}
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
