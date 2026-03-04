"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import Header from '@/app/components/Header';

export default function ReviewWorkshopPage() {
  const params = useParams();
  const router = useRouter();
  const workshopId = params.id as string;

  const [workshop, setWorkshop] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    checkEligibility();
  }, [workshopId]);

  const checkEligibility = async () => {
    const user = auth.currentUser;
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      // Check enrollment
      const enrollRes = await fetch(
        `http://localhost:5000/api/workshops/${workshopId}/check-enrollment?firebaseUID=${user.uid}`
      );
      const enrollData = await enrollRes.json();

      if (!enrollData.success || !enrollData.isEnrolled) {
        alert('You must be enrolled in this workshop to leave a review');
        router.push(`/workshops/${workshopId}`);
        return;
      }

      setIsEnrolled(true);

      // Fetch workshop details
      const workshopRes = await fetch(`http://localhost:5000/api/workshops/${workshopId}`);
      const workshopData = await workshopRes.json();
      
      if (workshopData.success) {
        setWorkshop(workshopData.workshop);
        
        // Check if already reviewed
        const existingReview = workshopData.reviews?.find(
          (r: any) => r.user?._id === enrollData.enrollment?.user
        );
        
        if (existingReview) {
          setHasReviewed(true);
          alert('You have already reviewed this workshop');
          router.push(`/workshops/${workshopId}`);
        }
      }
    } catch (error) {
      console.error('Failed to check eligibility:', error);
      router.push(`/workshops/${workshopId}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = auth.currentUser;
    if (!user) {
      router.push('/login');
      return;
    }

    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      alert('Review must be at least 10 characters long');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/workshops/${workshopId}/reviews`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rating,
            comment: comment.trim(),
            firebaseUID: user.uid
          })
        }
      );

      const data = await res.json();

      if (data.success) {
        alert('Review submitted successfully! Thank you for your feedback.');
        router.push(`/workshops/${workshopId}`);
      } else {
        alert(data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Submit review error:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!workshop) {
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
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <h1 className="text-3xl font-heading text-white mb-2">Write a Review</h1>
            <p className="text-gray-400 mb-6">Share your experience with "{workshop.title}"</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-white font-semibold mb-3">
                  Your Rating *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-5xl transition-all hover:scale-110 focus:outline-none"
                    >
                      {star <= (hoverRating || rating) ? (
                        <span className="text-brand-gold">⭐</span>
                      ) : (
                        <span className="text-gray-600">⭐</span>
                      )}
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-4 text-gray-400">
                      {rating === 1 && 'Poor'}
                      {rating === 2 && 'Fair'}
                      {rating === 3 && 'Good'}
                      {rating === 4 && 'Very Good'}
                      {rating === 5 && 'Excellent'}
                    </span>
                  )}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Your Review * (minimum 10 characters)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you think about this workshop? What did you learn? Would you recommend it to others?"
                  rows={8}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-gold outline-none resize-none"
                  required
                  minLength={10}
                />
                <p className="text-gray-500 text-sm mt-2">
                  {comment.length} characters
                </p>
              </div>

              {/* Guidelines */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">Review Guidelines</h3>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• Be honest and constructive</li>
                  <li>• Share specific details about your experience</li>
                  <li>• Mention what you learned and found valuable</li>
                  <li>• Be respectful to the instructor and other students</li>
                  <li>• Avoid personal attacks or offensive language</li>
                </ul>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.push(`/workshops/${workshopId}`)}
                  className="flex-1 bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || rating === 0 || comment.trim().length < 10}
                  className="flex-1 bg-brand-gold text-gray-900 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}