"use client";

import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { useAuth } from '../../components/AuthProvider';

// This interface fixes the "type never" error in your screenshot
interface AnalyticsData {
  summary: {
    totalRevenue: number;
    totalSales: number;
  };
  graphData: Array<{ _id: string; revenue: number }>;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch(`http://localhost:5000/api/analytics/artist-stats?firebaseUID=${user.uid}`)
        .then(res => res.json())
        .then(json => {
          setData(json);
          setLoading(false);
        });
    }
  }, [user]);

  if (loading) return <div className="text-white p-10">Loading Analytics...</div>;

  return (
    <main className="min-h-screen bg-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-heading text-white mb-8">Sales Analytics Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <p className="text-gray-400 text-sm uppercase mb-1">Total Revenue</p>
            <p className="text-4xl font-bold text-brand-gold">
              ৳{data?.summary?.totalRevenue?.toLocaleString() || 0}
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <p className="text-gray-400 text-sm uppercase mb-1">Items Sold</p>
            <p className="text-4xl font-bold text-white">
              {data?.summary?.totalSales || 0}
            </p>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h2 className="text-xl text-white mb-6">Revenue Trend (Last 30 Days)</h2>
          <div className="h-64 flex items-end gap-2 px-2">
            {data?.graphData.map((day) => (
              <div 
                key={day._id}
                title={`${day._id}: ৳${day.revenue}`}
                className="bg-brand-gold w-full rounded-t-sm"
                style={{ height: `${(day.revenue / (data.summary.totalRevenue || 1)) * 100}%`, minHeight: '4px' }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-gray-500">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </div>
      </div>
    </main>
  );
}