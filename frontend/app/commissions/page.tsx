"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import { useAuth } from '../components/AuthProvider';
import { API_BASE_URL } from '@/lib/config';

type Commission = {
  _id: string;
  title: string;
  style: string;
  budget: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  acceptedBy?: { name: string; email: string };
  createdAt: string;
};

export default function CommissionsPage() {
  const router = useRouter();
  const { user, appUser, loading } = useAuth();

  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'>('all');

  const authHeaders = () => ({ 'x-firebase-uid': user?.uid || '' });

  useEffect(() => {
    if (!loading && user && appUser?.role === 'buyer') {
      loadCommissions();
    }
  }, [user, loading, appUser]);

  const loadCommissions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/commissions/my-requests`, {
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setCommissions(data.commissions || []);
      }
    } catch (err) {
      console.error('Failed to load commissions:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/commissions/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        loadCommissions();
      }
    } catch (err) {
      console.error('Failed to update commission:', err);
    }
  };

  const filteredCommissions = filter === 'all'
    ? commissions
    : commissions.filter((c) => c.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-900/50 text-yellow-200';
      case 'accepted':
        return 'bg-green-900/50 text-green-200';
      case 'rejected':
        return 'bg-red-900/50 text-red-200';
      case 'completed':
        return 'bg-blue-900/50 text-blue-200';
      case 'cancelled':
        return 'bg-gray-900/50 text-gray-200';
      default:
        return 'bg-gray-900/50 text-gray-200';
    }
  };

  if (!loading && (!user || appUser?.role !== 'buyer')) {
    return (
      <main>
        <Header />
        <div className="min-h-screen container mx-auto px-4 py-8">
          <div className="text-center text-red-400 py-8">
            <p>Only buyers can view their commissions</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Header />
      <div className="min-h-screen container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-heading text-white">My Commission Requests</h1>
          <button
            onClick={() => router.push('/request-commission')}
            className="px-6 py-2 bg-brand-gold text-black font-semibold rounded hover:bg-yellow-400"
          >
            Request New Commission
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'pending', 'accepted', 'rejected', 'completed', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded capitalize ${
                filter === status
                  ? 'bg-brand-gold text-black'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {loadingData ? (
          <div className="text-center text-gray-400 py-8">Loading your commissions...</div>
        ) : filteredCommissions.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p>No commissions found</p>
            <button
              onClick={() => router.push('/request-commission')}
              className="mt-4 px-6 py-2 bg-brand-gold text-black rounded hover:bg-yellow-400"
            >
              Request Your First Commission
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCommissions.map((commission) => (
              <div
                key={commission._id}
                className="p-6 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-brand-gold transition cursor-pointer"
                onClick={() => router.push(`/commissions/${commission._id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl text-white font-semibold">{commission.title}</h3>
                    <p className="text-gray-400 text-sm">{commission.style}</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-sm font-semibold capitalize ${getStatusColor(commission.status)}`}>
                    {commission.status}
                  </span>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-brand-gold font-semibold">৳ {commission.budget.toLocaleString()}</p>
                    {commission.acceptedBy && (
                      <p className="text-green-400 text-sm mt-1">
                        ✓ Accepted by {commission.acceptedBy.name}
                      </p>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm">
                    {new Date(commission.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
