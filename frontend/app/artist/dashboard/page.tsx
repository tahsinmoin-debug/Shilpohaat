"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/components/AuthProvider';
import Header from '@/app/components/Header';
import { API_BASE_URL } from '@/lib/config';

type ArtistBadge = {
  _id?: string;
  badgeName: string;
  badgeIcon: string;
  badgeCategory: string;
};

export default function ArtistDashboard() {
  const { user, appUser } = useAuth();
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [badges, setBadges] = useState<ArtistBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadDashboardData = async () => {
      try {
        const [workshopsRes, badgesRes, verificationRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/workshops/instructor/my-workshops?firebaseUID=${user.uid}`),
          fetch(`${API_BASE_URL}/api/badges/${user.uid}`),
          fetch(`${API_BASE_URL}/api/verify/status/${user.uid}`),
        ]);

        if (workshopsRes.ok) {
          const workshopsData = await workshopsRes.json();
          if (workshopsData.success) {
            setWorkshops(workshopsData.workshops || []);
          }
        }

        const fetchedBadges: ArtistBadge[] = badgesRes.ok ? await badgesRes.json() : [];
        const verificationData = verificationRes.ok ? await verificationRes.json() : null;

        const hasVerificationBadge = fetchedBadges.some(
          (badge) => badge.badgeCategory === 'Verification' || badge.badgeName === 'Verified Artist'
        );

        if (verificationData?.nidStatus === 'approved' && !hasVerificationBadge) {
          setBadges([
            ...fetchedBadges,
            {
              badgeName: 'Verified Artist',
              badgeIcon: '✅',
              badgeCategory: 'Verification',
            },
          ]);
        } else {
          setBadges(fetchedBadges);
        }
      } catch {
        setWorkshops([]);
        setBadges([]);
      } finally {
        setLoading(false);
      }
    };

    void loadDashboardData();
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

        <section className="mb-8 bg-[#152635] rounded-xl p-4 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-3">My Badges</h2>
          {badges.length === 0 ? (
            <p className="text-gray-400 text-sm">No badges yet. Complete milestones and verification to earn badges.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {badges.map((badge, index) => (
                <div
                  key={`${badge.badgeName}-${index}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a2739] border border-white/10"
                >
                  <span className="text-lg" aria-hidden="true">{badge.badgeIcon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{badge.badgeName}</p>
                    <p className="text-xs text-gray-400">{badge.badgeCategory}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

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
