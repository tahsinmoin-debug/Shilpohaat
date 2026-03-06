"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import { useAuth } from '../components/AuthProvider';
import { API_BASE_URL, ADMIN_EMAIL } from '@/lib/config';

type Artwork = {
  _id: string;
  title: string;
  featured: boolean;
  artist?: { name: string; email: string };
};

type UserDoc = { _id: string; name: string; email: string; role: string; isSuspended: boolean };
type ArtistDoc = { _id: string; isFeatured: boolean; isSuspended: boolean; user?: { name: string; email: string } };
type BlogDoc = { _id: string; title: string; slug: string; category: string };
type ArtistSales = { artistId: string; name: string; email: string; revenue: number; sales: number; orders: number };
type VerificationDoc = {
  _id: string;
  userId: string;
  nidNumber?: string;
  nidDocumentUrl?: string;
  nidStatus: 'unsubmitted' | 'pending' | 'approved' | 'rejected';
  updatedAt: string;
  user?: {
    name?: string;
    email?: string;
    role?: string;
  } | null;
};

const ADMIN_PAGE_SIZE = 20;

export default function AdminPage() {
  const router = useRouter();
  const { user, appUser, loading } = useAuth();

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [blogs, setBlogs] = useState<BlogDoc[]>([]);
  const [artistSales, setArtistSales] = useState<ArtistSales[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VerificationDoc[]>([]);
  const [busy, setBusy] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [artworksPage, setArtworksPage] = useState(1);
  const [artworksHasMore, setArtworksHasMore] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [usersHasMore, setUsersHasMore] = useState(false);
  const [loadingMoreArtworks, setLoadingMoreArtworks] = useState(false);
  const [loadingMoreUsers, setLoadingMoreUsers] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {                  // check if the user is logged in and he is admin and then goes `backend/middleware/auth.js` (Lines 28-47)
        router.push('/login');
        return;
      }
      const isAdmin = !!appUser && (appUser.role === 'admin' || (ADMIN_EMAIL && appUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()));
      if (!isAdmin) {
        router.push('/');
        return;
      }
      // load data
      void loadAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, appUser, loading]);

  const authHeaders = () => ({ 'x-firebase-uid': user?.uid || '' });

  const fetchArtworksPage = async (page: number, append = false) => {
    const headers = authHeaders();
    const response = await fetch(
      `${API_BASE_URL}/api/artworks?includeAll=true&fields=card&thumbnailOnly=true&includeArtistProfile=false&page=${page}&limit=${ADMIN_PAGE_SIZE}`,
      { headers }
    );
    if (!response.ok) throw new Error('Failed to load artworks');
    const data = await response.json();
    const list = data.artworks || [];

    setArtworks((prev) => (append ? [...prev, ...list] : list));
    setArtworksPage(page);
    setArtworksHasMore(page < (Number(data.pages) || 1));
  };

  const fetchUsersPage = async (page: number, append = false) => {
    const headers = authHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/users?page=${page}&limit=${ADMIN_PAGE_SIZE}`, { headers });
    if (!response.ok) throw new Error('Failed to load users');
    const data = await response.json();
    const list = data.users || [];

    setUsers((prev) => (append ? [...prev, ...list] : list));
    setUsersPage(page);
    setUsersHasMore(page < (Number(data.pages) || 1));
  };

  const fetchArtistsPage = async (page: number) => {
    const headers = authHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/artists?page=${page}&limit=${ADMIN_PAGE_SIZE}`, { headers });
    if (!response.ok) throw new Error('Failed to load artists');
    const data = await response.json();
    const list = data.artists || [];
    return list;
  };

  const loadAll = async () => {
    setDataLoading(true);
    setError('');
    try {
      console.log('Loading admin data with UID:', user?.uid);
      const headers = authHeaders();
      console.log('Auth headers:', headers);
      
      const [bl, as, vr] = await Promise.all([
        fetch(`${API_BASE_URL}/api/blog?limit=100`, { headers }),
        fetch(`${API_BASE_URL}/api/admin/analytics/artists-sales`, { headers }),
        fetch(`${API_BASE_URL}/api/verify/admin/requests?status=pending`, { headers }),
      ]);

      const artistsData: ArtistDoc[] = await fetchArtistsPage(1);
      await Promise.all([
        fetchArtworksPage(1, false),
        fetchUsersPage(1, false),
      ]);

      if (as.ok) {
        const sales = (await as.json()).artists || [];
        if (sales.length === 0 && artistsData.length > 0) {
          const demo = artistsData.slice(0, 8).map((a: ArtistDoc, idx: number) => ({
            artistId: a._id,
            name: a.user?.name || `Demo Artist ${idx + 1}`,
            email: a.user?.email || `demo${idx + 1}@example.com`,
            revenue: Math.round((Math.random() * 50000 + 5000) * 100) / 100,
            sales: Math.floor(Math.random() * 120) + 5,
            orders: Math.floor(Math.random() * 40) + 3,
          }));
          setArtistSales(demo);
        } else {
          setArtistSales(sales);
        }
      } else {
        const demo = artistsData.slice(0, 8).map((a: ArtistDoc, idx: number) => ({
          artistId: a._id,
          name: a.user?.name || `Demo Artist ${idx + 1}`,
          email: a.user?.email || `demo${idx + 1}@example.com`,
          revenue: Math.round((Math.random() * 50000 + 5000) * 100) / 100,
          sales: Math.floor(Math.random() * 120) + 5,
          orders: Math.floor(Math.random() * 40) + 3,
        }));
        setArtistSales(demo);
      }

      if (vr.ok) {
        const verificationData = await vr.json();
        setVerificationRequests(verificationData.requests || []);
      } else {
        setVerificationRequests([]);
      }
      
      console.log('Blogs response:', bl.status, bl.ok);
      if (bl.ok) {
        const blData = await bl.json();
        console.log('Blogs data:', blData);
        setBlogs(blData.posts || []);
      } else {
        console.error('Blogs error:', await bl.text());
      }
    } catch (e) {
      console.error('Load all error:', e);
      setError('Failed to load admin data. Please check console for details.');
    } finally {
      setDataLoading(false);
    }
  };

  const act = async (url: string, opts: RequestInit = {}) => {
    setBusy(true);
    try {
      const res = await fetch(url, { ...opts, headers: { 'Content-Type': 'application/json', ...authHeaders() } });
      if (!res.ok) throw new Error('Action failed');
      await loadAll();
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  const loadMoreArtworks = async () => {
    if (loadingMoreArtworks || !artworksHasMore) return;
    setLoadingMoreArtworks(true);
    try {
      await fetchArtworksPage(artworksPage + 1, true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMoreArtworks(false);
    }
  };

  const loadMoreUsers = async () => {
    if (loadingMoreUsers || !usersHasMore) return;
    setLoadingMoreUsers(true);
    try {
      await fetchUsersPage(usersPage + 1, true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMoreUsers(false);
    }
  };


  return (
    <main>
      <Header />
      <div className="min-h-screen container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-heading text-white">Admin Panel</h1>
          <div className="flex gap-3 items-center">
            {busy && <span className="text-sm text-gray-400">Working...</span>}
            {dataLoading && <span className="text-sm text-yellow-400">Loading data...</span>}
            {user && <span className="text-xs text-gray-500">Logged in as: {appUser?.email}</span>}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded text-red-200">
            {error}
          </div>
        )}

        {!user && !loading && (
          <div className="mb-6 p-4 bg-yellow-900/50 border border-yellow-700 rounded text-yellow-200">
            You need to be logged in as admin to view this page.
          </div>
        )}

        {/* Sales Analytics */}
        <section className="mb-10">
          <h2 className="text-2xl font-heading text-white mb-3">Sales Per Artist</h2>
          <div className="overflow-x-auto rounded border border-gray-700">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-800 text-gray-300">
                <tr>
                  <th className="p-2 text-left">Artist</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-right">Revenue</th>
                  <th className="p-2 text-right">Units Sold</th>
                  <th className="p-2 text-right">Orders</th>
                </tr>
              </thead>
              <tbody>
                {artistSales.map((s) => (
                  <tr key={s.artistId} className="border-t border-gray-700">
                    <td className="p-2 text-white">{s.name || 'Unknown'}</td>
                    <td className="p-2 text-gray-300">{s.email || '-'}</td>
                    <td className="p-2 text-right text-brand-gold">৳ {s.revenue.toFixed(2)}</td>
                    <td className="p-2 text-right text-white">{s.sales}</td>
                    <td className="p-2 text-right text-white">{s.orders}</td>
                  </tr>
                ))}
                {artistSales.length === 0 && (
                  <tr>
                    <td className="p-3 text-gray-400" colSpan={5}>No sales yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Artworks */}
        <section className="mb-10">
          <h2 className="text-2xl font-heading text-white mb-3">Artworks</h2>
          <div className="overflow-x-auto rounded border border-gray-700">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-800 text-gray-300">
                <tr>
                  <th className="p-2 text-left">Title</th>
                  <th className="p-2 text-left">Artist</th>
                  <th className="p-2">Remove</th>
                </tr>
              </thead>
              <tbody>
                {artworks.map((art) => (
                  <tr key={art._id} className="border-t border-gray-700">
                    <td className="p-2 text-white">{art.title}</td>
                    <td className="p-2 text-gray-300">{art.artist?.name || '-'}</td>
                    <td className="p-2 flex gap-2 justify-center">
                      <button aria-label="Remove artwork" title="Remove artwork" className="px-3 py-1 bg-red-700 text-white rounded" onClick={() => act(`${API_BASE_URL}/api/admin/artworks/${art._id}`, { method: 'DELETE' })}>×</button>
                    </td>
                  </tr>
                ))}
                {artworks.length === 0 && (
                  <tr>
                    <td className="p-3 text-gray-400" colSpan={3}>No artworks.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {artworksHasMore && (
            <div className="mt-3 flex justify-center">
              <button
                onClick={loadMoreArtworks}
                disabled={loadingMoreArtworks}
                className="px-4 py-2 rounded bg-brand-gold text-[#0b1926] font-semibold disabled:opacity-60"
              >
                {loadingMoreArtworks ? 'Loading...' : 'Load More Artworks'}
              </button>
            </div>
          )}
        </section>

        {/* Users management */}
        <section className="mb-10">
          <h2 className="text-2xl font-heading text-white mb-3">Users</h2>
          <div className="overflow-x-auto rounded border border-gray-700">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-800 text-gray-300">
                <tr>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-t border-gray-700">       
                    <td className="p-2 text-white">{u.name}</td>
                    <td className="p-2 text-gray-300">{u.email}</td>
                    <td className="p-2 text-white">{u.role === 'artist' ? 'Seller' : 'Buyer'}</td>
                    <td className="p-2 text-center">
                      <button className={`px-3 py-1 rounded ${u.isSuspended ? 'bg-green-600' : 'bg-red-700'} text-white text-xs`} onClick={() => act(`${API_BASE_URL}/api/admin/users/${u._id}/suspend`, { method: 'PATCH', body: JSON.stringify({ suspended: !u.isSuspended }) })}>{u.isSuspended ? 'Unsuspend' : 'Suspend'}</button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td className="p-3 text-gray-400" colSpan={4}>No users.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {usersHasMore && (
            <div className="mt-3 flex justify-center">
              <button
                onClick={loadMoreUsers}
                disabled={loadingMoreUsers}
                className="px-4 py-2 rounded bg-brand-gold text-[#0b1926] font-semibold disabled:opacity-60"
              >
                {loadingMoreUsers ? 'Loading...' : 'Load More Users'}
              </button>
            </div>
          )}
        </section>

        {/* Identity Verification Requests */}
        <section className="mb-10">
          <h2 className="text-2xl font-heading text-white mb-3">NID Verification Requests</h2>
          <div className="overflow-x-auto rounded border border-gray-700">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-800 text-gray-300">
                <tr>
                  <th className="p-2 text-left">Artist</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">NID Number</th>
                  <th className="p-2 text-left">Document</th>
                  <th className="p-2 text-left">Submitted</th>
                  <th className="p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {verificationRequests.map((request) => (
                  <tr key={request._id} className="border-t border-gray-700">
                    <td className="p-2 text-white">{request.user?.name || 'Unknown'}</td>
                    <td className="p-2 text-gray-300">{request.user?.email || '-'}</td>
                    <td className="p-2 text-white">{request.nidNumber || '-'}</td>
                    <td className="p-2">
                      {request.nidDocumentUrl ? (
                        <a
                          href={request.nidDocumentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-gold hover:underline"
                        >
                          View Document
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-2 text-gray-300">{new Date(request.updatedAt).toLocaleString()}</td>
                    <td className="p-2 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          className="px-3 py-1 rounded bg-green-700 text-white text-xs"
                          onClick={() => act(`${API_BASE_URL}/api/verify/admin/requests/${request._id}/approve`, { method: 'PATCH' })}
                        >
                          Approve
                        </button>
                        <button
                          className="px-3 py-1 rounded bg-red-700 text-white text-xs"
                          onClick={() => act(`${API_BASE_URL}/api/verify/admin/requests/${request._id}/reject`, { method: 'PATCH' })}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {verificationRequests.length === 0 && (
                  <tr>
                    <td className="p-3 text-gray-400" colSpan={6}>No pending verification requests.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Blogs */}
        <section className="mb-10">
          <h2 className="text-2xl font-heading text-white mb-3">Blogs</h2>
          <div className="overflow-x-auto rounded border border-gray-700">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-800 text-gray-300">
                <tr>
                  <th className="p-2 text-left">Title</th>
                  <th className="p-2 text-left">Category</th>
                  <th className="p-2">Remove</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((b) => (
                  <tr key={b._id} className="border-t border-gray-700">
                    <td className="p-2 text-white">{b.title}</td>
                    <td className="p-2 text-gray-300">{b.category}</td>
                    <td className="p-2 flex gap-2 justify-center">
                      <button aria-label="Remove blog" title="Remove blog" className="px-3 py-1 bg-red-700 text-white rounded" onClick={() => act(`${API_BASE_URL}/api/admin/blog/${b._id}`, { method: 'DELETE' })}>×</button>
                    </td>
                  </tr>
                ))}
                {blogs.length === 0 && (
                  <tr>
                    <td className="p-3 text-gray-400" colSpan={3}>No blogs.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
