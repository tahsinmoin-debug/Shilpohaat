"use client";
import { useEffect, useState } from 'react';
import Header from '../components/Header';

interface Workshop {
  _id: string;
  title: string;
  type: 'live' | 'recorded';
  contentUrl: string;
  thumbnail: string;
  instructor: { name: string };
  scheduledAt?: string;
}

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/workshops')
      .then(res => res.json())
      .then(data => {
        if (data.success) setWorkshops(data.workshops);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-maroon to-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-heading text-white mb-8">Art Workshops & Tutorials</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {workshops.map((ws) => (
            <div key={ws._id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
              <div className="relative h-48 bg-gray-900">
                <img src={ws.thumbnail || 'https://placehold.co/600x400'} className="w-full h-full object-cover" />
                <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded ${
                  ws.type === 'live' ? 'bg-red-600 text-white' : 'bg-brand-gold text-black'
                }`}>
                  {ws.type.toUpperCase()}
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold text-white mb-1">{ws.title}</h3>
                <p className="text-gray-400 text-sm mb-4">by {ws.instructor.name}</p>
                
                <a 
                  href={ws.contentUrl} 
                  target="_blank"
                  className="block text-center w-full py-2 bg-brand-gold text-gray-900 font-bold rounded hover:bg-yellow-500 transition-colors"
                >
                  {ws.type === 'live' ? 'Join Live Session' : 'Watch Tutorial'}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}