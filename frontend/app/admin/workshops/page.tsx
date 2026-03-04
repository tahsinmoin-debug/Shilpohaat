"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  instructor: {
    name: string;
    email: string;
  };
  createdAt: string;
  rejectionReason?: string;
}

export default function AdminWorkshopsPage() {
  const router = useRouter();
  const { user, appUser, loading: authLoading } = useAuth();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('pending');
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user || appUser?.role !== 'admin') {
        router.push('/');
        return;
      }
      fetchWorkshops();
    }
  }, [user, appUser, authLoading, filter]);

  const fetchWorkshops = async () => {
    if (!auth.currentUser) return;
    
    setLoading(true);
    try {
      const url = filter 
        ? `http://localhost:5000/api/workshops/admin/moderation?firebaseUID=${auth.currentUser.uid}&status=${filter}`
        : `http://localhost:5000/api/workshops/admin/moderation?firebaseUID=${auth.currentUser.uid}`;
      
      const res = await fetch(url);
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

  const handleApprove = async (workshopId: string) => {
    if (!auth.currentUser || !confirm('Are you sure you want to approve this workshop?')) return;

    setActionLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/workshops/${workshopId}/approve?firebaseUID=${auth.currentUser.uid}`,
        { method: 'POST' }
      );
      
      const data = await res.json();
      
      if (data.success) {
        alert('Workshop approved successfully!');
        fetchWorkshops();
        setSelectedWorkshop(null);
      } else {
        alert(data.message || 'Failed to approve workshop');
      }
    } catch (error) {
      console.error('Approval error:', error);
      alert('Failed to approve workshop');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (workshopId: string) => {
    if (!auth.currentUser) return;
    
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/workshops/${workshopId}/reject?firebaseUID=${auth.currentUser.uid}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: rejectionReason })
        }
      );
      
      const data = await res.json();
      
      if (data.success) {
        alert('Workshop rejected');
        setRejectionReason('');
        fetchWorkshops();
        setSelectedWorkshop(null);
      } else {
        alert(data.message || 'Failed to reject workshop');
      }
    } catch (error) {
      console.error('Rejection error:', error);
      alert('Failed to reject workshop');
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async (workshopId: string) => {
    if (!auth.currentUser || !confirm('Are you sure you want to archive this workshop?')) return;

    setActionLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/workshops/${workshopId}/archive?firebaseUID=${auth.currentUser.uid}`,
        { method: 'POST' }
      );
      
      const data = await res.json();
      
      if (data.success) {
        alert('Workshop archived');
        fetchWorkshops();
        setSelectedWorkshop(null);
      } else {
        alert(data.message || 'Failed to archive workshop');
      }
    } catch (error) {
      console.error('Archive error:', error);
      alert('Failed to archive workshop');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-600',
      pending: 'bg-yellow-600',
      approved: 'bg-green-600',
      rejected: 'bg-red-600',
      archived: 'bg-gray-700'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-600';
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-brand-maroon">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold mx-auto"></div>
          <p className="text-white mt-4">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-maroon to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-heading text-white mb-2">Workshop Moderation</h1>
          <p className="text-gray-400">Review and approve workshops submitted by artists</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-gray-800 rounded-lg p-2 mb-8 flex gap-2 border border-gray-700">
          {['pending', 'approved', 'rejected', 'draft', 'archived', ''].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`flex-1 py-2 px-4 rounded font-semibold transition-colors ${
                filter === status
                  ? 'bg-brand-gold text-gray-900'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {status === '' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Workshops List */}
        {workshops.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-gray-400">No workshops found with status: {filter || 'all'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {workshops.map((workshop) => (
              <div
                key={workshop._id}
                className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-brand-gold transition-colors"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Thumbnail */}
                  <div className="md:w-64 h-48 md:h-auto flex-shrink-0">
                    <img
                      src={workshop.thumbnail || 'https://placehold.co/400x300/333/FFF'}
                      alt={workshop.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`${getStatusBadge(workshop.status)} text-white px-3 py-1 rounded-full text-xs font-bold uppercase`}>
                            {workshop.status}
                          </span>
                          <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs">
                            {workshop.category}
                          </span>
                          <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs">
                            {workshop.type}
                          </span>
                        </div>
                        <h3 className="text-2xl font-heading text-white mb-2">{workshop.title}</h3>
                        <p className="text-gray-400 text-sm mb-2">
                          by {workshop.instructor.name} ({workshop.instructor.email})
                        </p>
                        <p className="text-gray-300 line-clamp-2 mb-3">{workshop.description}</p>
                        
                        {workshop.rejectionReason && (
                          <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg text-sm">
                            <p className="font-semibold">Rejection Reason:</p>
                            <p>{workshop.rejectionReason}</p>
                          </div>
                        )}
                      </div>

                      <div className="ml-4 text-right">
                        <p className="text-brand-gold font-bold text-2xl">
                          {workshop.price === 0 ? 'FREE' : `৳${workshop.price}`}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          {new Date(workshop.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => setSelectedWorkshop(workshop)}
                        className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
                      >
                        View Details
                      </button>
                      
                      {workshop.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(workshop._id)}
                            disabled={actionLoading}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedWorkshop(workshop);
                              setRejectionReason('');
                            }}
                            disabled={actionLoading}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            ✗ Reject
                          </button>
                        </>
                      )}

                      {workshop.status === 'approved' && (
                        <button
                          onClick={() => handleArchive(workshop._id)}
                          disabled={actionLoading}
                          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
                        >
                          Archive
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rejection Modal */}
        {selectedWorkshop && selectedWorkshop.status === 'pending' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
              <h3 className="text-xl font-heading text-white mb-4">Reject Workshop</h3>
              <p className="text-gray-400 mb-4">
                Please provide a reason for rejecting "{selectedWorkshop.title}"
              </p>
              
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason (e.g., content quality, inappropriate material, missing information)..."
                rows={4}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-brand-gold outline-none resize-none"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedWorkshop(null);
                    setRejectionReason('');
                  }}
                  className="flex-1 bg-gray-700 text-white py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedWorkshop._id)}
                  disabled={!rejectionReason.trim() || actionLoading}
                  className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {selectedWorkshop && selectedWorkshop.status !== 'pending' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full border border-gray-700 my-8">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-heading text-white">{selectedWorkshop.title}</h3>
                <button
                  onClick={() => setSelectedWorkshop(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <img
                src={selectedWorkshop.thumbnail}
                alt={selectedWorkshop.title}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />

              <div className="space-y-3 text-gray-300">
                <p><strong>Instructor:</strong> {selectedWorkshop.instructor.name}</p>
                <p><strong>Category:</strong> {selectedWorkshop.category}</p>
                <p><strong>Type:</strong> {selectedWorkshop.type}</p>
                <p><strong>Price:</strong> ৳{selectedWorkshop.price}</p>
                <p><strong>Status:</strong> {selectedWorkshop.status}</p>
                <p><strong>Description:</strong></p>
                <p className="whitespace-pre-wrap">{selectedWorkshop.description}</p>
              </div>

              <button
                onClick={() => setSelectedWorkshop(null)}
                className="w-full mt-6 bg-gray-700 text-white py-2 rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}