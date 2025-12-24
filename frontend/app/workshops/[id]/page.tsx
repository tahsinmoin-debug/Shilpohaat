"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import Header from '@/app/components/Header';

interface Workshop {
  _id: string;
  title: string;
  description: string;
  category: string;
  skillLevel: string;
  type: 'recorded' | 'live';
  thumbnail: string;
  price: number;
  currency: string;
  instructor: {
    _id: string;
    name: string;
    email: string;
  };
  lessons?: Array<{
    _id: string;
    title: string;
    description: string;
    duration: number;
    order: number;
  }>;
  requiredMaterials?: Array<{
    item: string;
    description: string;
    optional: boolean;
  }>;
  liveSessionUrl?: string;
  scheduledAt?: string;
  duration?: number;
  enrollmentCount: number;
  averageRating: number;
  totalReviews: number;
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  user: {
    name: string;
  };
  createdAt: string;
  instructorResponse?: {
    text: string;
    respondedAt: string;
  };
}

export default function WorkshopDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workshopId = params.id as string;

  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    fetchWorkshopDetails();
    if (user) {
      checkEnrollment();
    }
  }, [workshopId, user]);

  const fetchWorkshopDetails = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/workshops/${workshopId}`);
      const data = await res.json();
      
      if (data.success) {
        setWorkshop(data.workshop);
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Failed to fetch workshop:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    if (!user) return;
    
    try {
      const res = await fetch(
        `http://localhost:5000/api/workshops/${workshopId}/check-enrollment?firebaseUID=${user.uid}`
      );
      const data = await res.json();
      
      if (data.success) {
        setIsEnrolled(data.isEnrolled);
      }
    } catch (error) {
      console.error('Failed to check enrollment:', error);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setEnrolling(true);
    try {
      const res = await fetch('http://localhost:5000/api/workshops/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workshopId, firebaseUID: user.uid })
      });
      
      const data = await res.json();
      
      if (data.success) {
        if (data.url) {
          // Redirect to payment
          window.location.href = data.url;
        } else if (data.redirect) {
          // Free workshop - redirect to learn page
          router.push(data.redirect);
        }
      } else {
        alert(data.message || 'Enrollment failed');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      alert('Failed to enroll. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-brand-maroon">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold mx-auto"></div>
          <p className="text-white mt-4">Loading workshop...</p>
        </div>
      </main>
    );
  }

  if (!workshop) {
    return (
      <main className="min-h-screen bg-brand-maroon">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-white text-xl">Workshop not found</p>
          <Link href="/workshops" className="text-brand-gold hover:underline mt-4 inline-block">
            Browse Workshops
          </Link>
        </div>
      </main>
    );
  }

  const totalDuration = workshop.lessons?.reduce((sum, lesson) => sum + (lesson.duration || 0), 0) || workshop.duration || 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-maroon to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Thumbnail */}
            <div className="relative h-96 w-full rounded-lg overflow-hidden mb-6">
              <img
                src={workshop.thumbnail}
                alt={workshop.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-brand-gold font-bold">
                  {workshop.type === 'live' ? '🔴 LIVE WORKSHOP' : '📹 RECORDED COURSE'}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-brand-gold text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                  {workshop.category}
                </span>
                <span className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm">
                  {workshop.skillLevel}
                </span>
              </div>

              <h1 className="text-4xl font-heading text-white mb-4">{workshop.title}</h1>

              <div className="flex items-center gap-6 text-sm text-gray-400 mb-4">
                <div className="flex items-center gap-2">
                  👤 <span>{workshop.instructor.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  👥 <span>{workshop.enrollmentCount} students</span>
                </div>
                {workshop.totalReviews > 0 && (
                  <div className="flex items-center gap-2 text-brand-gold">
                    ⭐ {workshop.averageRating.toFixed(1)} ({workshop.totalReviews} reviews)
                  </div>
                )}
                {totalDuration > 0 && (
                  <div className="flex items-center gap-2">
                    ⏱️ <span>{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</span>
                  </div>
                )}
              </div>

              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{workshop.description}</p>
            </div>

            {/* What You'll Learn / Lessons */}
            {workshop.type === 'recorded' && workshop.lessons && workshop.lessons.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
                <h2 className="text-2xl font-heading text-white mb-4">Course Content</h2>
                <div className="space-y-3">
                  {workshop.lessons.sort((a, b) => a.order - b.order).map((lesson, index) => (
                    <div key={lesson._id} className="flex items-start gap-3 p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-brand-gold text-gray-900 rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{lesson.title}</h3>
                        {lesson.description && (
                          <p className="text-gray-400 text-sm mt-1">{lesson.description}</p>
                        )}
                        {lesson.duration && (
                          <p className="text-gray-500 text-xs mt-1">⏱️ {lesson.duration} min</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Required Materials */}
            {workshop.requiredMaterials && workshop.requiredMaterials.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
                <h2 className="text-2xl font-heading text-white mb-4">Required Materials</h2>
                <ul className="space-y-2">
                  {workshop.requiredMaterials.map((material, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-300">
                      <span className="text-brand-gold mt-1">
                        {material.optional ? '○' : '●'}
                      </span>
                      <div>
                        <span className="font-semibold">{material.item}</span>
                        {material.optional && <span className="text-gray-500 text-sm ml-2">(Optional)</span>}
                        {material.description && (
                          <p className="text-gray-400 text-sm mt-1">{material.description}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-heading text-white mb-4">
                Student Reviews ({reviews.length})
              </h2>
              {reviews.length === 0 ? (
                <p className="text-gray-400">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="border-b border-gray-700 pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-white font-semibold">{review.user.name}</p>
                          <div className="flex items-center gap-1 text-brand-gold">
                            {'⭐'.repeat(review.rating)}
                            <span className="text-gray-500 text-sm ml-2">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-300">{review.comment}</p>
                      
                      {review.instructorResponse && (
                        <div className="mt-3 ml-6 p-3 bg-gray-700/50 rounded-lg">
                          <p className="text-brand-gold text-sm font-semibold mb-1">
                            Instructor Response:
                          </p>
                          <p className="text-gray-300 text-sm">{review.instructorResponse.text}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 sticky top-24">
              {/* Price */}
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-2">Price</p>
                <p className="text-4xl font-bold text-brand-gold">
                  {workshop.price === 0 ? 'FREE' : `৳${workshop.price}`}
                </p>
              </div>

              {/* Live Session Info */}
              {workshop.type === 'live' && workshop.scheduledAt && (
                <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
                  <p className="text-white font-semibold mb-2">📅 Scheduled For:</p>
                  <p className="text-gray-300">
                    {new Date(workshop.scheduledAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}

              {/* Enroll Button */}
              {isEnrolled ? (
                <Link
                  href={`/workshops/${workshopId}/learn`}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors block text-center"
                >
                  ✓ Continue Learning
                </Link>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full bg-brand-gold text-gray-900 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enrolling ? 'Processing...' : (workshop.price === 0 ? 'Enroll For Free' : 'Enroll Now')}
                </button>
              )}

              {/* Instructor Info */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <p className="text-gray-400 text-sm mb-2">Taught by</p>
                <Link href={`/artist/${workshop.instructor._id}`} className="flex items-center gap-3 hover:opacity-80">
                  <div className="w-12 h-12 rounded-full bg-brand-gold flex items-center justify-center text-gray-900 font-bold text-xl">
                    {workshop.instructor.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{workshop.instructor.name}</p>
                    <p className="text-gray-400 text-sm">View Profile →</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}