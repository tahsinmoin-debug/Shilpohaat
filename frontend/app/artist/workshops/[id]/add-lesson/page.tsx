"use client";
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/components/AuthProvider';
import Header from '@/app/components/Header';

export default function AddLessonPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    duration: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/api/workshops/${id}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          firebaseUID: user?.uid // Auth verification
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Tutorial video added!");
        router.push(`/workshops/${id}`); // Redirect back to details
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload lesson");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0b1926] text-white">
      <Header />
      <div className="max-w-xl mx-auto py-12 px-6">
        <h1 className="text-3xl font-bold text-brand-gold mb-8">Add Tutorial Video</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-[#152635] p-8 rounded-xl border border-gray-700">
          <div>
            <label className="block text-sm font-medium mb-2">Video Title</label>
            <input 
              required
              className="w-full bg-[#0b1926] border border-gray-700 p-3 rounded text-white"
              placeholder="e.g., Introduction to Oil Painting"
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Video URL (Cloudinary/YouTube)</label>
            <input 
              required
              className="w-full bg-[#0b1926] border border-gray-700 p-3 rounded text-white"
              placeholder="https://..."
              onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea 
              className="w-full bg-[#0b1926] border border-gray-700 p-3 rounded text-white h-32"
              placeholder="What will students learn in this video?"
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-gold text-gray-900 font-bold py-3 rounded hover:bg-yellow-500 transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Upload Tutorial"}
          </button>
        </form>
      </div>
    </main>
  );
}