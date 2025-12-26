// frontend/app/components/Reviews/ArtworkReviews.tsx

'use client';

import React, { useState, useEffect, useMemo } from 'react'; 
import { useAuth } from '../AuthProvider'; 

// --- TYPES ---
interface Review {
    _id: string;
    reviewerName: string;
    rating: number;
    comment: string;
    createdAt: string;
}

interface Props {
    artworkId: string;
}

// --- CONSTANTS ---
const API_BASE_URL = 'http://localhost:5000/api';

// --- COMPONENTS ---

/** Renders read-only star rating. */
const StarRating = ({ rating, size = 'w-5 h-5' }: { rating: number, size?: string }) => {
    return (
        <div className="flex items-center" aria-label={`Rating: ${rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    className={`${size} ${star <= rating ? 'text-brand-gold' : 'text-gray-500'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    role="presentation" 
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.817 2.042a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.817-2.042a1 1 0 00-1.175 0l-2.817 2.042c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.001 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
};

export default function ArtworkReviews({ artworkId }: Props) {
    const { user, appUser } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState(''); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hoverRating, setHoverRating] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(true);

    // 1. Fetch Existing Reviews
    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/artworks/${artworkId}/reviews`);
            if (!res.ok) throw new Error('Failed to fetch reviews (API error)');
            const data = await res.json();
            setReviews(data.reviews.sort((a: Review, b: Review) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (err: any) {
            console.error("Fetch Reviews Error:", err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (artworkId) {
            fetchReviews();
        }
    }, [artworkId]);

    // Calculate Average Rating
    const { averageRating, roundedAverageRating } = useMemo(() => {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const avg = reviews.length > 0 ? (totalRating / reviews.length) : 0;
        return {
            averageRating: avg > 0 ? avg.toFixed(1) : 'N/A',
            roundedAverageRating: Math.round(avg),
        };
    }, [reviews]);
    
    // Authorization: Anyone logged in can submit a review.
    const canSubmitReview = !!user;

    // 2. Handle Submission of a New Review
    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!user) {
            setError('Must be logged in to submit.');
            return;
        }
        
        if (!newReview.comment.trim()) {
            setError('Comment is required.');
            return;
        }

        setIsSubmitting(true);

        try {
            const reviewData = {
                rating: newReview.rating,
                comment: newReview.comment,
                reviewerId: user.uid, 
                reviewerName: appUser?.name || user.email || 'Anonymous User',
            };

            const res = await fetch(`${API_BASE_URL}/artworks/${artworkId}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Server error during review submission.');
            }

            // Success
            setNewReview({ rating: 5, comment: '' });
            setShowForm(false);
            setSuccessMessage('Review submitted successfully!');
            fetchReviews();

        } catch (err: any) {
            setError(err.message || 'Unknown error during submission.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading && reviews.length === 0) { 
        return <div className="text-gray-400 p-8 text-center">
            <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-brand-gold rounded-full" role="status" aria-label="Loading"></div>
            <p className='mt-2'>Loading reviews...</p>
        </div>;
    }


    return (
    <section 
        className="mt-14 bg-gray-900 p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-800"
        aria-labelledby="reviews-heading"
    >
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
                <h2 id="reviews-heading" className="text-2xl font-heading text-white">
                    Ratings & Reviews
                </h2>
                <p className="text-gray-400 text-sm">
                    {reviews.length} customer review{reviews.length !== 1 && 's'}
                </p>
            </div>

            <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-brand-gold">
                    {averageRating}
                </span>
                <StarRating rating={roundedAverageRating} size='w-7 h-7' />
            </div>
        </div>

        {/* MESSAGES */}
        {error && <div className="p-3 mb-4 text-red-400 bg-red-900/50 rounded-lg border border-red-700">{error}</div>}
        {successMessage && <div className="p-3 mb-4 text-green-400 bg-green-900/50 rounded-lg border border-green-700">{successMessage}</div>}


        {/* WRITE REVIEW BUTTON */}
        {canSubmitReview && !showForm && (
            <button
                onClick={() => { setShowForm(true); setSuccessMessage(''); setError(''); }}
                className="mb-8 px-6 py-3 bg-brand-gold text-gray-900 font-semibold rounded-xl hover:bg-brand-gold-antique transition-all shadow-lg"
            >
                ✍️ Write a review
            </button>
        )}
        
        {/* PROMPT TO SIGN IN */}
        {!canSubmitReview && (
            <p className="mb-6 p-3 bg-gray-800 rounded-lg text-gray-400 text-sm border border-gray-700">
                Please **sign in** to submit your review.
            </p>
        )}


        {/* REVIEW FORM */}
        {canSubmitReview && showForm && (
            <form onSubmit={handleSubmitReview} className="mb-10 bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl animate-fadeIn">
                <h3 className="text-xl font-semibold text-white mb-4">Submit Your Review</h3>

                {/* STAR INPUT */}
                <fieldset className="mb-4">
                    <legend className="text-gray-300 mb-2">Your Rating:</legend>
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => {
                            const active = hoverRating !== null
                                ? star <= hoverRating
                                : star <= newReview.rating;

                            return (
                                <button
                                    key={star}
                                    type="button"
                                    aria-label={`${star} star rating`}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(null)}
                                    onClick={() => setNewReview({ ...newReview, rating: star })}
                                    className={`
                                        transition-all duration-300 transform rounded-full p-1 
                                        ${active
                                            ? 'text-brand-gold scale-110' 
                                            : 'text-gray-500 hover:text-gray-400' 
                                        } 
                                        hover:scale-125 focus:outline-none focus:ring-2 focus:ring-brand-gold
                                    `}
                                >
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.817 2.042a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.817-2.042a1 1 0 00-1.175 0l-2.817 2.042c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.001 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </button>
                            );
                        })}
                    </div>
                </fieldset>

                {/* COMMENT */}
                <textarea
                    id="review-comment"
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    placeholder="Share your experience and thoughts about the artwork..."
                    rows={4}
                    required
                    className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg p-4 focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none mb-4 transition-colors"
                />

                {/* ACTIONS */}
                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={isSubmitting || !newReview.comment.trim()}
                        className="px-6 py-2 bg-brand-gold text-gray-900 font-semibold rounded-lg hover:bg-brand-gold-antique transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                        {isSubmitting ? 'Submitting…' : 'Submit Review'}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setShowForm(false);
                            setError(''); 
                            setNewReview({ rating: 5, comment: '' }); 
                        }}
                        className="px-6 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        )}

        {/* REVIEWS LIST */}
        <div className="space-y-8 mt-10">
            {reviews.length === 0 ? ( 
                <p className="text-gray-400 text-center py-4">No reviews yet. Be the first to leave a review! ⭐</p>
            ) : (
                reviews.map((review) => (
                    <div key={review._id} className="border-b border-gray-700 pb-8 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-white font-semibold text-lg">{review.reviewerName}</p>
                            <StarRating rating={review.rating} size='w-6 h-6' />
                        </div>
                        <p className="text-gray-300 text-md italic mb-3 leading-relaxed">
                            <span className='font-serif text-2xl pr-1 text-brand-gold'>"</span>
                            {review.comment}
                            <span className='font-serif text-2xl pl-1 text-brand-gold'>"</span>
                        </p>
                        <p className="text-xs text-gray-500">
                            Reviewed on: {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                ))
            )}
        </div>

    </section>
);

}