"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/components/AuthProvider';
import Header from '@/app/components/Header';

export default function CreateWorkshopPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    category: 'Painting',
    type: 'recorded', // Default to recorded tutorial
    thumbnail: '',
    skillLevel: 'Beginner'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/workshops/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, firebaseUID: user?.uid })
    });
    const data = await res.json();
    if (data.success) {
      alert("Workshop created and sent for approval!");
      router.push('/workshops');
    }
  };

  return (
    <main className="min-h-screen bg-[#0b1926] text-white">
      <Header />
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8 text-brand-gold">Create New Content</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-[#152635] p-8 rounded-2xl">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Content Type</label>
              <select 
                className="w-full bg-[#0b1926] border border-gray-700 p-3 rounded"
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="recorded">Recorded Tutorial Video</option>
                <option value="live">Live Online Event</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-2">Price (BDT)</label>
              <input type="number" className="w-full bg-[#0b1926] border border-gray-700 p-3 rounded" 
                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">Title</label>
            <input required className="w-full bg-[#0b1926] border border-gray-700 p-3 rounded" 
              onChange={(e) => setFormData({...formData, title: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm mb-2">Description</label>
            <textarea required className="w-full bg-[#0b1926] border border-gray-700 p-3 rounded h-32" 
              onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>

          <button type="submit" className="w-full bg-brand-gold text-black font-bold py-4 rounded-xl">
            Create {formData.type === 'recorded' ? 'Tutorial' : 'Event'}
          </button>
        </form>
      </div>
    </main>
  );
}