"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import { useAuth } from '../../components/AuthProvider';
import { API_BASE_URL } from '@/lib/config';

type Commission = {
  _id: string;
  title: string;
  description: string;
  style: string;
  budget: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  buyer: { name: string; email: string };
  createdAt: string;
  referenceImages: string[];
  dimensions?: { width: number; height: number; unit: string };
};

export default function SellerCommissionsPage() {
  const router = useRouter();
  const { user, appUser, loading } = useAuth();

  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [acceptedCommissions, setAcceptedCommissions] = useState<Commission[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [tab, setTab] = useState<'available' | 'accepted'>('available');
  const [actioningId, setActioningId] = useState('');

  const authHeaders = () => ({ 'x-firebase-uid': user?.uid || '' });

  useEffect(() => {
    if (!loading && user && appUser?.role === 'artist') {
      loadData();
    }
  }, [user, loading, appUser]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [pendingRes, acceptedRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/commissions/pending`, {
          headers: authHeaders(),
        }),
        fetch(`${API_BASE_URL}/api/commissions/my-commissions`, {
          headers: authHeaders(),
        }),
      ]);

      if (pendingRes.ok) {
        const data = await pendingRes.json();
        setCommissions(data.commissions || []);
      }

      if (acceptedRes.ok) {
        const data = await acceptedRes.json();
        setAcceptedCommissions(data.commissions || []);
      }
    } catch (err) {
      console.error('Failed to load commissions:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAccept = async (id: string) => {
    setActioningId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/commissions/${id}/accept`, {
        method: 'PATCH',
        headers: authHeaders(),
      });

      if (res.ok) {
        await loadData();
        setTab('accepted');
      }
    } catch (err) {
      console.error('Failed to accept commission:', err);
    } finally {
      setActioningId('');
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this commission?')) return;

    setActioningId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/commissions/${id}/reject`, {
        method: 'PATCH',
        headers: authHeaders(),
      });

      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error('Failed to reject commission:', err);
    } finally {
      setActioningId('');
    }
  };

  const handleMarkComplete = async (id: string) => {
    setActioningId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/commissions/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({ status: 'completed' }),
      });

      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error('Failed to update commission:', err);
    } finally {
      setActioningId('');
    }
  };

  if (!loading && (!user || appUser?.role !== 'artist')) {
    return (
      <main>
        <Header />
        <div className="min-h-screen container mx-auto px-4 py-8">
          <div className="text-center text-red-400 py-8">
            <p>Only artists can view commission requests</p>
          </div>
        </div>
      </main>
    );
  }

  const displayCommissions = tab === 'available' ? commissions : acceptedCommissions;

  return (
    <main>
      <Header />
      <div className="min-h-screen container mx-auto px-4 py-8">
        <h1 className="text-4xl font-heading text-white mb-8">Commission Requests</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-700">
          <button
            onClick={() => setTab('available')}
            className={`px-6 py-3 font-semibold ${
              tab === 'available'
                ? 'text-brand-gold border-b-2 border-brand-gold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Available Requests ({commissions.length})
          </button>
          <button
            onClick={() => setTab('accepted')}
            className={`px-6 py-3 font-semibold ${
              tab === 'accepted'
                ? 'text-brand-gold border-b-2 border-brand-gold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            My Accepted ({acceptedCommissions.length})
          </button>
        </div>

        {loadingData ? (
          <div className="text-center text-gray-400 py-8">Loading commission requests...</div>
        ) : displayCommissions.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            {tab === 'available'
              ? 'No commission requests available right now'
              : 'You have not accepted any commissions yet'}
          </div>
        ) : (
          <div className="space-y-6">
            {displayCommissions.map((commission) => (
              <div
                key={commission._id}
                className="p-6 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-brand-gold transition"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl text-white font-semibold">{commission.title}</h3>
                    <p className="text-gray-400 mt-1">
                      Requested by <span className="text-brand-gold font-semibold">{commission.buyer.name}</span>
                    </p>
                    <p className="text-gray-500 text-sm">{commission.buyer.email}</p>
                  </div>
                  <span className="px-4 py-2 bg-brand-gold/20 text-brand-gold font-semibold rounded">
                    ৳ {commission.budget.toLocaleString()}
                  </span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-500">Style</p>
                    <p className="text-white">{commission.style}</p>
                  </div>
                  {commission.dimensions && (
                    <div>
                      <p className="text-gray-500">Dimensions</p>
                      <p className="text-white">
                        {commission.dimensions.width}×{commission.dimensions.height}{commission.dimensions.unit}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-500">Requested</p>
                    <p className="text-white">{new Date(commission.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Description */}
                {commission.description && (
                  <div className="mb-4">
                    <p className="text-gray-500 text-sm mb-1">Description</p>
                    <p className="text-gray-300">{commission.description}</p>
                  </div>
                )}

                {/* Reference Images */}
                {commission.referenceImages && commission.referenceImages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-gray-500 text-sm mb-2">Reference Images</p>
                    <div className="flex gap-2 overflow-x-auto">
                      {commission.referenceImages.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Reference ${idx}`}
                          className="h-24 w-24 object-cover rounded border border-gray-600 cursor-pointer hover:border-brand-gold"
                          onClick={() => window.open(img, '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  {tab === 'available' && (
                    <>
                      <button
                        onClick={() => handleAccept(commission._id)}
                        disabled={actioningId === commission._id}
                        className="flex-1 px-4 py-2 bg-green-700 text-white rounded hover:bg-green-600 disabled:opacity-50 font-semibold"
                      >
                        {actioningId === commission._id ? 'Accepting...' : '✓ Accept Commission'}
                      </button>
                      <button
                        onClick={() => handleReject(commission._id)}
                        disabled={actioningId === commission._id}
                        className="flex-1 px-4 py-2 bg-red-700 text-white rounded hover:bg-red-600 disabled:opacity-50 font-semibold"
                      >
                        {actioningId === commission._id ? 'Rejecting...' : '✗ Reject'}
                      </button>
                    </>
                  )}

                  {tab === 'accepted' && commission.status === 'accepted' && (
                    <button
                      onClick={() => handleMarkComplete(commission._id)}
                      disabled={actioningId === commission._id}
                      className="flex-1 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-600 disabled:opacity-50 font-semibold"
                    >
                      {actioningId === commission._id ? 'Marking...' : '✓ Mark as Completed'}
                    </button>
                  )}

                  {tab === 'accepted' && commission.status === 'completed' && (
                    <div className="flex-1 px-4 py-2 bg-green-900/30 text-green-400 rounded font-semibold text-center">
                      ✓ Completed
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
