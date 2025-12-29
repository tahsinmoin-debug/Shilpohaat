"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/components/AuthProvider';
import Header from '@/app/components/Header';

export default function ArtistDashboard() {
  const { user, appUser } = useAuth();
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch(`http://localhost:5000/api/workshops/instructor/my-workshops?firebaseUID=${user.uid}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setWorkshops(data.workshops);
          setLoading(false);
        });
    }
  }, [user]);

  if (appUser?.role !== 'artist') return <div className="p-20 text-white">Loading Artist Studio...</div>;

  return (
    <main className="min-h-screen bg-[#0b1926] text-white">
      <Header />
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold border-b-2 border-brand-gold pb-2">My Artist Studio</h1>
          <Link href="/artist/workshops/create" className="bg-brand-gold text-black px-6 py-2 rounded-lg font-bold">
            + Create New Workshop
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {workshops.map((ws: any) => (
            <div key={ws._id} className="bg-[#152635] p-6 rounded-xl border border-gray-700 flex flex-col md:flex-row justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">{ws.title}</h3>
                <p className="text-gray-400 text-sm">Status: 
                   <span className={`ml-2 px-2 py-0.5 rounded text-xs ${ws.status === 'approved' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                     {ws.status}
                   </span>
                </p>
              </div>
              
              <div className="flex gap-3 mt-4 md:mt-0">
                <Link href={`/artist/workshops/${ws._id}/enrollments`} className="bg-blue-600/20 text-blue-400 border border-blue-600 px-4 py-2 rounded-lg text-sm font-semibold">
                  View Students
                </Link>
                <Link href={`/artist/workshops/${ws._id}/add-lesson`} className="bg-brand-gold text-black px-4 py-2 rounded-lg text-sm font-bold">
                  Upload Tutorial
                </Link>
              </div>
            </div>
          ))}
          {workshops.length === 0 && !loading && (
            <div className="text-center py-20 bg-[#152635] rounded-2xl border-2 border-dashed border-gray-700 text-gray-500">
              No workshops found. Create your first one to start teaching!
            </div>
          )}
        </div>
      </div>
    </main>
  );
}