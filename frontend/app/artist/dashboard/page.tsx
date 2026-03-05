"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/components/AuthProvider';
import Header from '@/app/components/Header';
import { API_BASE_URL } from '@/lib/config';

export default function ArtistDashboard() {
  const { user, appUser } = useAuth();
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`${API_BASE_URL}/api/workshops/instructor/my-workshops?firebaseUID=${user.uid}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setWorkshops(data.workshops);
      })
      .catch(() => null)
      .finally(() => setLoading(false));
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

  return (
    <main className="min-h-screen bg-[#0b1926] text-white">
      <Header />
      <div className="container mx-auto p-8">
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-[#152635] rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-xs uppercase tracking-wider">Total Workshops</p>
            <p className="text-3xl font-bold text-brand-gold mt-1">{workshops.length}</p>
          </div>
          <div className="bg-[#152635] rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-xs uppercase tracking-wider">Published</p>
            <p className="text-3xl font-bold text-green-400 mt-1">
              {workshops.filter((workshop) => workshop.status === 'approved').length}
            </p>
          </div>
          <div className="bg-[#152635] rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-xs uppercase tracking-wider">Pending Review</p>
            <p className="text-3xl font-bold text-yellow-400 mt-1">
              {workshops.filter((workshop) => workshop.status === 'pending').length}
            </p>
          </div>
          <div className="bg-[#152635] rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-xs uppercase tracking-wider">Total Students</p>
            <p className="text-3xl font-bold text-blue-400 mt-1">
              {workshops.reduce((sum, workshop) => sum + (workshop.enrollmentCount || 0), 0)}
            </p>
          </div>
        </div>

        <section className="mt-12 bg-[#1a2739] border border-white/10 rounded-2xl p-4 md:p-6">
          <h2 className="text-3xl font-heading mb-5">Studio Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/artist/artworks/new" className="bg-[#3b475a] p-6 rounded-2xl border border-white/10 hover:border-brand-gold transition-colors">
              <p className="text-3xl font-semibold">+ Upload Masterpiece</p>
              <p className="text-gray-400 text-sm mt-2 uppercase">Add new work to gallery</p>
            </Link>
            <Link href="/artist/analytics" className="bg-[#3b475a] p-6 rounded-2xl border border-sky-500/30 hover:border-sky-400 transition-colors">
              <p className="text-3xl font-semibold">Sales Insights</p>
              <p className="text-gray-400 text-sm mt-2 uppercase">View performance metrics</p>
            </Link>
            <Link href="/artist/promotions" className="bg-[#3b475a] p-6 rounded-2xl border border-white/60 hover:border-brand-gold transition-colors">
              <p className="text-3xl font-semibold">Art Vouchers</p>
              <p className="text-gray-400 text-sm mt-2 uppercase">Manage collector discounts</p>
            </Link>
            <Link href="/artist/verify" className="bg-[#3b475a] p-6 rounded-2xl border border-emerald-500/30 hover:border-emerald-400 transition-colors">
              <p className="text-3xl font-semibold">Official Artist Status</p>
              <p className="text-gray-400 text-sm mt-2 uppercase">Verify your identity</p>
            </Link>
            <Link href="/wishlist" className="bg-[#3b475a] p-6 rounded-2xl border border-pink-500/30 hover:border-pink-400 transition-colors">
              <p className="text-3xl font-semibold">Collector Picks</p>
              <p className="text-gray-400 text-sm mt-2 uppercase">My saved favorites</p>
            </Link>
            <Link href="/create-profile" className="bg-[#3b475a] p-6 rounded-2xl border border-orange-500/30 hover:border-orange-400 transition-colors">
              <p className="text-3xl font-semibold">Curate Bio</p>
              <p className="text-gray-400 text-sm mt-2 uppercase">Update artist story</p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
