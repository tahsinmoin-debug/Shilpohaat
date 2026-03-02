"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import { useAuth } from '../../components/AuthProvider';
import { API_BASE_URL } from '@/lib/config';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DayData {
  _id: string;
  revenue: number;
  sales: number;
}

interface TopArtwork {
  artworkId: string;
  title: string;
  sales: number;
  revenue: number;
  image?: string;
}

interface AnalyticsData {
  summary: {
    totalRevenue: number;
    totalSales: number;
    averageOrderValue: number;
    conversionRate: number;
    pendingPayments: number;
    pendingRevenue: number;
  };
  graphData: DayData[];
  topArtworks: TopArtwork[];
  profileViews: number;
  totalArtworks: number;
}

interface ChartData {
  date: string;
  revenue: number;
  sales: number;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, appUser, loading: authLoading } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (!appUser || appUser.role !== 'artist') {
        router.push('/');
        return;
      }
    }
  }, [user, appUser, authLoading, router]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetch(`${API_BASE_URL}/api/analytics/artist-stats?firebaseUID=${user.uid}`)
        .then(res => res.json())
        .then(json => {
          console.log('Analytics API Response:', json);
          console.log('Top Artworks:', json.topArtworks);
          setData(json);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch analytics:', err);
          setLoading(false);
        });
    }
  }, [user, timeRange]);

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-gray-900">
        <Header />
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
        </div>
      </main>
    );
  }

  // Format data for charts
  const chartData: ChartData[] = data?.graphData?.map(d => ({
    date: new Date(d._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: d.revenue,
    sales: d.sales
  })) || [];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-xl">
          <p className="text-white font-semibold mb-2">{label}</p>
          <p className="text-brand-gold text-sm">Revenue: ৳{payload[0]?.value?.toLocaleString()}</p>
          <p className="text-blue-400 text-sm">Sales: {payload[1]?.value}</p>
        </div>
      );
    }
    return null;
  };
  const maxSales = Math.max(...(data?.graphData?.map(d => d.sales) || [1]));

  return (
    <main className="min-h-screen bg-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-12">
        
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-heading text-white mb-2">Sales Analytics</h1>
            <p className="text-sm md:text-base text-gray-400">Track your performance and growth</p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex gap-2 bg-gray-800 p-1 rounded-lg border border-gray-700">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`flex-1 px-3 md:px-4 py-2 rounded-md text-xs md:text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-brand-gold text-gray-900'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-700 hover:border-brand-gold/30 transition-all overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-xs md:text-sm uppercase tracking-wider">Total Revenue</p>
              <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-brand-gold break-words">
              ৳{data?.summary?.totalRevenue?.toLocaleString() || 0}
            </p>
            <p className="text-xs text-gray-500 mt-2">Last {timeRange === '7d' ? '7' : timeRange === '30d' ? '30' : '90'} days</p>
          </div>

          <div className="bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-700 hover:border-brand-gold/30 transition-all overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-xs md:text-sm uppercase tracking-wider">Total Sales</p>
              <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-white break-words">
              {data?.summary?.totalSales || 0}
            </p>
            <p className="text-xs text-gray-500 mt-2">Artworks sold</p>
          </div>

          <div className="bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-700 hover:border-brand-gold/30 transition-all overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-xs md:text-sm uppercase tracking-wider">Pending Payment</p>
              <svg className="w-4 h-4 md:w-5 md:h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-orange-400 break-words">
              {data?.summary?.pendingPayments || 0}
            </p>
            <p className="text-xs text-gray-500 mt-2">৳{data?.summary?.pendingRevenue?.toLocaleString() || 0} pending</p>
          </div>

          <div className="bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-700 hover:border-brand-gold/30 transition-all overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-xs md:text-sm uppercase tracking-wider">Avg Order Value</p>
              <svg className="w-4 h-4 md:w-5 md:h-5 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-white break-words">
              ৳{data?.summary?.averageOrderValue?.toLocaleString() || 0}
            </p>
            <p className="text-xs text-gray-500 mt-2">Per transaction</p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-700 mb-8">
          <h2 className="text-lg md:text-xl font-semibold text-white mb-6">Revenue & Sales Trend</h2>
          {chartData && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF" 
                  style={{ fontSize: '12px' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `৳${value.toLocaleString()}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#D4AF37" 
                  strokeWidth={3}
                  dot={{ fill: '#D4AF37', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Revenue (৳)"
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Sales (Units)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-80 text-gray-500">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p>No sales data available</p>
                <p className="text-sm mt-2">Start selling to see your analytics</p>
              </div>
            </div>
          )}
        </div>

        {/* Top Performing Artworks */}
        <div className="bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-white">Top Performing Artworks</h2>
            {data?.topArtworks && (
              <span className="text-sm text-gray-400">({data.topArtworks.length} {data.topArtworks.length === 1 ? 'artwork' : 'artworks'})</span>
            )}
          </div>
          {data?.topArtworks && data.topArtworks.length > 0 ? (
            <div className="space-y-3">
              {data.topArtworks.map((artwork, index) => (
                <div key={artwork.artworkId || index} className="flex items-center gap-3 md:gap-4 bg-gray-700/50 p-3 md:p-4 rounded-lg hover:bg-gray-700 transition-colors overflow-hidden">
                  <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-brand-gold text-gray-900 font-bold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  
                  {/* Artwork Image */}
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                    {artwork.image ? (
                      <img 
                        src={artwork.image} 
                        alt={artwork.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center">
                              <svg class="w-6 h-6 md:w-8 md:h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm md:text-base truncate">{artwork.title}</p>
                    <p className="text-xs md:text-sm text-gray-400">{artwork.sales} {artwork.sales === 1 ? 'sale' : 'sales'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-brand-gold font-bold text-sm md:text-base">৳{artwork.revenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>No sales data yet</p>
              <p className="text-sm mt-2">Start selling to see your top artworks here</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
