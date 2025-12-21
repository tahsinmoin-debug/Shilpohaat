"use client";

import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Link from 'next/link';

interface Workshop {
  _id: string;
  title: string;
  description: string;
  type: 'live' | 'recorded';
  category: string;
  thumbnail: string;
  contentUrl: string;
  price: number;
  instructor: {
    name: string;
  };
  scheduledAt?: string;
}

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/workshops');
        
        if (!res.ok) {
          throw new Error(`Server responded with ${res.status}`);
        }
        
        const data = await res.json();
        
        if (data.success) {
          setWorkshops(data.workshops);
        } else {
          setError("Failed to load workshops data.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Could not connect to the server. Please ensure the backend is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkshops();
  }, []);

  return (
    <main className="min-h-screen bg-brand-maroon">
      <Header />
      
      <div className="container mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-heading text-brand-gold mb-2">Art Tutorials & Workshops</h1>
            <p className="text-gray-300">Learn traditional and modern art from master artisans.</p>
          </div>
        </div>

        {loading ? (
          /* LOADING STATE */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-gold mb-4"></div>
            <p className="text-brand-gold font-medium">Loading workshops...</p>
          </div>
        ) : error ? (
          /* ERROR STATE */
          <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
            <p className="text-red-400 text-lg mb-4">⚠️ {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-brand-gold text-black font-bold rounded-lg hover:bg-yellow-500 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : workshops.length === 0 ? (
          /* EMPTY STATE (This shows if the database is empty) */
          <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
            <p className="text-gray-400 text-lg mb-4">No workshops found in the database.</p>
            <p className="text-sm text-gray-500">
              Please run <code className="bg-black/30 px-2 py-1 rounded text-brand-gold">node scripts/seedWorkshops.js</code> in your backend terminal.
            </p>
          </div>
        ) : (
          /* DATA LIST STATE */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workshops.map((ws) => (
              <div key={ws._id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-brand-gold/50 transition-all group">
                {/* Image Section */}
                <div className="relative h-52">
                  <img 
                    src={ws.thumbnail} 
                    alt={ws.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      ws.type === 'live' ? 'bg-red-600 text-white animate-pulse' : 'bg-brand-gold text-black'
                    }`}>
                      {ws.type === 'live' ? '● Live' : 'Recorded'}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                  <div className="text-brand-gold text-xs font-semibold mb-2 uppercase tracking-widest">
                    {ws.category}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{ws.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{ws.description}</p>
                  
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                    <div>
                      <p className="text-xs text-gray-500">Instructor</p>
                      <p className="text-sm text-white font-medium">{ws.instructor?.name || 'Artist User'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="text-lg font-bold text-brand-gold">
                        {ws.price === 0 ? 'FREE' : `₹${ws.price}`}
                      </p>
                    </div>
                  </div>

                  <a 
                    href={ws.contentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 block w-full text-center py-3 bg-brand-gold hover:bg-yellow-500 text-black font-bold rounded-lg transition-colors"
                  >
                    {ws.type === 'live' ? 'Join Workshop' : 'Start Learning'}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}