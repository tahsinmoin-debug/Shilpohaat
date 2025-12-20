"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import { useAuth } from '../../components/AuthProvider';

// 1. Define Interfaces to fix the "type never" errors
interface Badge {
  badgeIcon: string;
  badgeName: string;
}

interface DashboardStats {
  totalArtworks: number;
  totalSales: number;
  profileViews: number;
}

export default function ArtistDashboardPage() {
  const router = useRouter();
  const { user, appUser, loading } = useAuth();
  
  // 2. Apply the interface to the state
  const [stats, setStats] = useState<DashboardStats>({
    totalArtworks: 0,
    totalSales: 0,
    profileViews: 0
  });

  // 3. Fix the badges state
  const [badges, setBadges] = useState<Badge[]>([]);

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

      const fetchDashboardData = async () => {
        try {
          // Fetch Analytics
          const resStats = await fetch(`http://localhost:5000/api/analytics/artist-stats?firebaseUID=${user.uid}`);
          const dataStats = await resStats.json();
          
          if (resStats.ok) {
            setStats({
              totalArtworks: dataStats.totalArtworks || 0,
              totalSales: dataStats.summary?.totalRevenue || 0,
              profileViews: dataStats.profileViews || 0
            });
          }

          // Fetch/Check Badges
          const resBadges = await fetch(`http://localhost:5000/api/badges/check-milestones/${user.uid}`, {
            method: 'POST'
          });
          const dataBadges = await resBadges.json();
          if (resBadges.ok) {
            setBadges(dataBadges.badges);
          }
        } catch (error) {
          console.error("Failed to load dashboard data", error);
        }
      };

      fetchDashboardData();
    }
  }, [user, appUser, loading, router]);

  if (loading) {
    return (
      <main>
        <Header />
        <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>
      </main>
    );
  }

  return (
    <main>
      <Header />
      <div className="min-h-screen container mx-auto px-4 py-12">
        
        {/* --- BADGE DISPLAY SECTION --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-heading text-white">Artist Dashboard</h1>
            <p className="text-gray-400 text-sm">Welcome back, {appUser?.name}</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 px-4 py-2 rounded-full shadow-sm">
              <span className="text-xl">🌱</span>
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Rising Talent</span>
            </div>

            {badges.map((badge, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2 bg-gray-800 border border-brand-gold/40 px-4 py-2 rounded-full shadow-md animate-fade-in"
              >
                <span className="text-xl">{badge.badgeIcon}</span>
                <span className="text-xs font-bold text-brand-gold uppercase tracking-wider">{badge.badgeName}</span>
              </div>
            ))}
          </div>
        </div>

        {!appUser?.artistProfile?.isProfileComplete ? (
          <div className="bg-gray-800 rounded-lg p-8 max-w-2xl mx-auto text-center border border-gray-700">
             <h2 className="text-2xl font-heading text-white mb-2">Complete Your Profile</h2>
             <Link href="/create-profile" className="inline-block mt-4 px-8 py-3 bg-brand-gold text-gray-900 font-bold rounded-md">Set Up My Profile</Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-sm font-semibold text-gray-400 uppercase">Total Artworks</h3>
                <p className="text-3xl font-bold text-brand-gold">{stats.totalArtworks}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-sm font-semibold text-gray-400 uppercase">Total Sales</h3>
                <p className="text-3xl font-bold text-brand-gold">৳{stats.totalSales.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-sm font-semibold text-gray-400 uppercase">Profile Views</h3>
                <p className="text-3xl font-bold text-brand-gold">{stats.profileViews}</p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-heading text-white mb-4">Quick Actions</h2>
              {/* Updated grid cols to handle the new Wishlist button */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link href="/artist/artworks/new" className="block p-4 bg-gray-700 rounded-lg hover:border-brand-gold border border-transparent transition-all">
                  <p className="text-white font-semibold">+ Upload New</p>
                </Link>

                <Link href="/artist/analytics" className="block p-4 bg-gray-700 rounded-lg border border-blue-500/20 hover:border-blue-500 transition-all">
                  <p className="text-white font-semibold">📊 Analytics</p>
                </Link>

                <Link href="/artist/promotions" className="block p-4 bg-gray-700 rounded-lg border border-brand-gold/20 hover:border-brand-gold transition-all">
                  <p className="text-white font-semibold">🎫 Coupons</p>
                </Link>

                <Link href="/artist/verify" className="block p-4 bg-gray-700 rounded-lg border border-green-500/20 hover:border-green-500 transition-all">
                  <p className="text-white font-semibold">🛡️ Identity</p>
                </Link>

                {/* --- WISHLIST OPTION ADDED HERE --- */}
                <Link href="/wishlist" className="block p-4 bg-gray-700 rounded-lg border border-red-500/20 hover:border-red-500 transition-all">
                  <p className="text-white font-semibold">❤️ My Wishlist</p>
                </Link>

                <Link href="/create-profile" className="block p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors border border-transparent">
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