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
        <div className="min-h-screen flex items-center justify-center text-white">Loading Artist Profile...</div>
      </main>
    );
  }

  return (
    <main className="bg-gray-900 min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-12">
        
        {/* --- ARTIST ACHIEVEMENT HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-heading text-white">Artist Dashboard</h1>
            <p className="text-gray-400 text-sm">Welcome back to the gallery, {appUser?.name}</p>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            {/* Reverted Professional Base Badge */}
            <div className="flex items-center gap-3 bg-gray-800 border border-gray-700 px-5 py-2 rounded-xl shadow-lg border-b-2 border-b-gray-600">
              <span className="text-2xl filter drop-shadow-md">🏅</span>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-tight">Current Rank</span>
                <span className="text-xs font-black text-gray-300 uppercase tracking-tighter">Rising Talent</span>
              </div>
            </div>

            {badges.map((badge, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2 bg-gray-800 border border-brand-gold/40 px-4 py-2 rounded-full shadow-md transition-transform hover:scale-105"
              >
                <span className="text-xl">{badge.badgeIcon}</span>
                <span className="text-xs font-bold text-brand-gold uppercase tracking-wider">{badge.badgeName}</span>
              </div>
            ))}
          </div>
        </div>

        {!appUser?.artistProfile?.isProfileComplete ? (
          <div className="bg-gray-800 rounded-lg p-8 max-w-2xl mx-auto text-center border border-gray-700">
             <h2 className="text-2xl font-heading text-white mb-2">Build Your Exhibition</h2>
             <p className="text-gray-400 mb-6 text-sm">Artists with complete profiles see 40% more engagement from collectors.</p>
             <Link href="/create-profile" className="inline-block px-8 py-3 bg-brand-gold text-gray-900 font-bold rounded-md hover:bg-yellow-500 transition-colors">Set Up My Studio</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* --- GALLERY STATS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-brand-gold/20 transition-all shadow-xl">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Cataloged Pieces</h3>
                <p className="text-3xl font-bold text-brand-gold">{stats.totalArtworks}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-brand-gold/20 transition-all shadow-xl">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Total Acquisitions</h3>
                <p className="text-3xl font-bold text-brand-gold">৳{stats.totalSales.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-brand-gold/20 transition-all shadow-xl">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Collector Visits</h3>
                <p className="text-3xl font-bold text-brand-gold">{stats.profileViews}</p>
              </div>
            </div>

            {/* --- STUDIO MANAGEMENT --- */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-2xl">
              <h2 className="text-xl font-heading text-white mb-4">Studio Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link href="/artist/artworks/new" className="block p-4 bg-gray-700 rounded-lg hover:border-brand-gold border border-transparent transition-all group">
                  <p className="text-white font-semibold group-hover:text-brand-gold transition-colors">+ Upload Masterpiece</p>
                  <span className="text-[10px] text-gray-500 uppercase">Add new work to gallery</span>
                </Link>

                <Link href="/artist/analytics" className="block p-4 bg-gray-700 rounded-lg border border-blue-500/20 hover:border-blue-500 transition-all">
                  <p className="text-white font-semibold">📊 Sales Insights</p>
                  <span className="text-[10px] text-gray-500 uppercase">View performance metrics</span>
                </Link>

                <Link href="/artist/promotions" className="block p-4 bg-gray-700 rounded-lg border border-brand-gold/20 hover:border-brand-gold transition-all">
                  <p className="text-white font-semibold">🎫 Art Vouchers</p>
                  <span className="text-[10px] text-gray-500 uppercase">Manage collector discounts</span>
                </Link>

                <Link href="/artist/verify" className="block p-4 bg-gray-700 rounded-lg border border-green-500/20 hover:border-green-500 transition-all">
                  <p className="text-white font-semibold">🛡️ Official Artist Status</p>
                  <span className="text-[10px] text-gray-500 uppercase">Verify your identity</span>
                </Link>

                <Link href="/wishlist" className="block p-4 bg-gray-700 rounded-lg border border-red-500/20 hover:border-red-500 transition-all">
                  <p className="text-white font-semibold">❤️ Collector Picks</p>
                  <span className="text-[10px] text-gray-500 uppercase">My saved favorites</span>
                </Link>

                <Link href="/create-profile" className="block p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors border border-transparent">
                  <p className="text-white font-semibold">✏️ Curate Bio</p>
                  <span className="text-[10px] text-gray-500 uppercase">Update artist story</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}