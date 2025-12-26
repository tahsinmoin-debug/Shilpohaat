"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/app/components/Header';
import { useAuth } from '@/app/components/AuthProvider';
 // Use your project's Auth Provider
//import { AuthProvider } from './components/AuthProvider';

export default function WorkshopDetailPage() {
  const { id } = useParams();
  const { user, appUser } = useAuth();
  const [workshop, setWorkshop] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/workshops/${id}`);
        const data = await res.json();
        setWorkshop(data.workshop);

        if (user) {
          const enrollRes = await fetch(`http://localhost:5000/api/workshops/${id}/check-enrollment?firebaseUID=${user.uid}`);
          const enrollData = await enrollRes.json();
          setIsEnrolled(enrollData.isEnrolled);
        }
      } catch (err) {
        console.error("Error fetching workshop:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) return window.location.href = '/login';
    
    try {
      const res = await fetch('http://localhost:5000/api/workshops/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workshopId: id, firebaseUID: user.uid })
      });
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url; // Go to Stripe
      } else if (data.success) {
        alert("Enrolled successfully!");
        window.location.reload();
      }
    } catch (err) {
      alert("Enrollment failed.");
    }
  };

  if (loading) return <div className="p-10 text-white">Loading...</div>;
  if (!workshop) return <div className="p-10 text-white">Workshop not found.</div>;

  const isInstructor = appUser?._id === workshop.instructor._id;

  return (
    <main className="min-h-screen bg-[#0b1926]">
      <Header />
      <div className="container mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <img src={workshop.thumbnail} alt={workshop.title} className="rounded-xl w-full object-cover" />
          
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-4">{workshop.title}</h1>
            <p className="text-gray-400 mb-6">{workshop.description}</p>
            <p className="text-2xl font-bold text-brand-gold mb-6">৳ {workshop.price}</p>



            {isInstructor && (
              <Link 
                href={`/artist/workshops/${id}/add-lesson`} 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold block text-center mb-4"
              >
                + Add Tutorial Video
              </Link>
            )}


            {isEnrolled && (
              <Link 
                href={`/workshops/${id}/learn`} 
                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors block text-center"
              >
                ✓ Continue Learning
              </Link>
            )}


            {isInstructor ? (
              <Link href={`/artist/workshops/${id}/enrollments`} className="bg-blue-600 px-8 py-3 rounded-lg font-bold">
                View Enrolled Students
              </Link>
            ) : isEnrolled ? (
              <Link href={`/workshops/${id}/learn`} className="bg-green-600 px-8 py-3 rounded-lg font-bold">
                Continue to Tutorial Videos
              </Link>
            ) : (
              <button onClick={handleEnroll} className="bg-brand-gold text-black px-8 py-3 rounded-lg font-bold">
                Enroll Now
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}