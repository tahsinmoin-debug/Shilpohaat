"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/components/AuthProvider';
import Header from '@/app/components/Header';

export default function ArtistDashboard() {
  const { user, appUser } = useAuth();
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch(`http://localhost:5000/api/workshops/instructor/my-workshops?firebaseUID=${user.uid}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setWorkshops(data.workshops);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user]);

  if (loading) {
    return (
      <main>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-[#0b1926] text-white">
          Loading Artist Studio...
        </div>
      </main>
    );
  }

  if (appUser?.role !== 'artist') {
    return (
      <main>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-[#0b1926] text-white">
          Access denied. Artist accounts only.
        </div>
      </main>
    );
  }

  const statusColor: Record<string, string> = {
    draft: 'bg-gray-600 text-gray-200',
    pending: 'bg-yellow-700 text-yellow-100',
    approved: 'bg-green-700 text-green-100',
    rejected: 'bg-red-700 text-red-100',
    archived: 'bg-gray-700 text-gray-300',
  };

  return (
    <main className="min-h-screen bg-[#0b1926] text-white">
      <Header />
      <div className="container mx-auto p-8">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold border-b-2 border-brand-gold pb-2">My Artist Studio</h1>
            <p className="text-gray-400 text-sm mt-1">Welcome back, {appUser?.name || user?.email?.split('@')[0]}</p>
          </div>
          <Link
            href="/artist/workshops/create"
            className="bg-brand-gold text-black px-6 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors"
          >
            + Create New Workshop
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-[#152635] rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-xs uppercase tracking-wider">Total Workshops</p>
            <p className="text-3xl font-bold text-brand-gold mt-1">{workshops.length}</p>
          </div>
          <div className="bg-[#152635] rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-xs uppercase tracking-wider">Published</p>
            <p className="text-3xl font-bold text-green-400 mt-1">
              {workshops.filter(w => w.status === 'approved').length}
            </p>
          </div>
          <div className="bg-[#152635] rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-xs uppercase tracking-wider">Pending Review</p>
            <p className="text-3xl font-bold text-yellow-400 mt-1">
              {workshops.filter(w => w.status === 'pending').length}
            </p>
          </div>
          <div className="bg-[#152635] rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-xs uppercase tracking-wider">Total Students</p>
            <p className="text-3xl font-bold text-blue-400 mt-1">
              {workshops.reduce((sum, w) => sum + (w.enrollmentCount || 0), 0)}
            </p>
          </div>
        </div>

        {/* Workshops List */}
        <h2 className="text-xl font-bold mb-4 text-white">My Workshops</h2>

        {workshops.length === 0 ? (
          <div className="text-center py-20 bg-[#152635] rounded-2xl border-2 border-dashed border-gray-700 text-gray-500">
            <p className="text-lg mb-4">No workshops yet. Start teaching today!</p>
            <Link
              href="/artist/workshops/create"
              className="bg-brand-gold text-black px-8 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors"
            >
              Create Your First Workshop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {workshops.map((ws: any) => (
              <div
                key={ws._id}
                className="bg-[#152635] p-6 rounded-xl border border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="flex gap-4 items-start">
                  {ws.thumbnail && (
                    <img src={ws.thumbnail} alt={ws.title} className="w-20 h-14 object-cover rounded-lg flex-shrink-0" />
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-white">{ws.title}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${statusColor[ws.status] || 'bg-gray-600 text-white'}`}>
                        {ws.status.toUpperCase()}
                      </span>
                      <span className="text-gray-400 text-xs">{ws.type === 'live' ? '🔴 Live' : '📹 Recorded'}</span>
                      <span className="text-gray-400 text-xs">👥 {ws.enrollmentCount || 0} students</span>
                      {ws.price === 0 ? (
                        <span className="text-green-400 text-xs font-bold">FREE</span>
                      ) : (
                        <span className="text-brand-gold text-xs font-bold">৳{ws.price}</span>
                      )}
                    </div>
                    {ws.status === 'rejected' && ws.rejectionReason && (
                      <p className="text-red-400 text-xs mt-2 bg-red-900/20 border border-red-800 px-2 py-1 rounded">
                        ❌ Rejected: {ws.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 flex-shrink-0">
                  <Link
                    href={`/artist/workshops/${ws._id}/enrollments`}
                    className="bg-blue-600/20 text-blue-400 border border-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600/40 transition-colors"
                  >
                    View Students
                  </Link>
                  <Link
                    href={`/artist/workshops/${ws._id}/add-lesson`}
                    className="bg-brand-gold text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-500 transition-colors"
                  >
                    {ws.type === 'recorded' ? 'Edit Lessons' : 'Edit'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/artist/artworks/new" className="bg-[#152635] p-4 rounded-xl border border-gray-700 hover:border-brand-gold transition-colors text-center">
            <p className="text-white font-semibold text-sm">🖼️ Upload Artwork</p>
          </Link>
          <Link href="/create-profile" className="bg-[#152635] p-4 rounded-xl border border-gray-700 hover:border-brand-gold transition-colors text-center">
            <p className="text-white font-semibold text-sm">✏️ Edit Profile</p>
          </Link>
          <Link href="/artist/commissions" className="bg-[#152635] p-4 rounded-xl border border-gray-700 hover:border-brand-gold transition-colors text-center">
            <p className="text-white font-semibold text-sm">📋 Commissions</p>
          </Link>
          <Link href="/artist/hub" className="bg-[#152635] p-4 rounded-xl border border-gray-700 hover:border-brand-gold transition-colors text-center">
            <p className="text-white font-semibold text-sm">🤝 Collab Hub</p>
          </Link>
        </div>

      </div>
    </main>
  );
}
