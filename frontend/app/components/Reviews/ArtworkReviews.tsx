// frontend/app/components/Reviews/ArtworkReviews.tsx

'use client';

import React, { useState, useEffect, useMemo } from 'react'; 
import { useAuth } from '../AuthProvider';
import LoadingSpinner, { SkeletonList } from '../LoadingSpinner';
import { API_BASE_URL } from '@/lib/config';

// --- TYPES ---
interface Review {
    _id: string;
    reviewerName: string;
    rating: number;
    comment: string;
    createdAt: string;
    verifiedBuyer?: boolean;
}

interface Props {
    artworkId: string;
}

// --- COMPONENTS ---

/** Renders read-only star rating. */
const StarRating = ({ rating, size = 'w-4 h-4', showNumber = false }: { rating: number, size?: string, showNumber?: boolean }) => {
    return (
        <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    className={`${size} ${star <= rating ? 'text-brand-gold' : 'text-gray-600'} transition-colors`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    role="presentation" 
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.817 2.042a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.817-2.042a1 1 0 00-1.175 0l-2.817 2.042c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.001 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
            {showNumber && <span className="text-sm text-gray-400 ml-1">({rating})</span>}
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
    const [showForm, setShowForm] = useState(false);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

    // 1. Fetch Existing Reviews
    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/artworks/${artworkId}/reviews`);
            if (!res.ok) throw new Error('Failed to fetch reviews');
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
    const { averageRating, roundedAverageRating, verifiedCount } = useMemo(() => {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const avg = reviews.length > 0 ? (totalRating / reviews.length) : 0;
        const verified = reviews.filter((review) => review.verifiedBuyer).length;
        
        return {
            averageRating: avg > 0 ? avg.toFixed(1) : 'N/A',
            roundedAverageRating: Math.round(avg),
            verifiedCount: verified,
        };
    }, [reviews]);

    // Sort reviews
    const sortedReviews = useMemo(() => {
        const sorted = [...reviews];
        
        switch (sortBy) {
            case 'newest':
                sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case 'oldest':
                sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                break;
            case 'highest':
                sorted.sort((a, b) => b.rating - a.rating);
                break;
            case 'lowest':
                sorted.sort((a, b) => a.rating - b.rating);
                break;
        }
        
        return sorted;
    }, [reviews, sortBy]);

    // Show only first 3 reviews initially
    const displayedReviews = showAllReviews ? sortedReviews : sortedReviews.slice(0, 3);
    
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
                comment: newReview.comment.trim(),
                reviewerId: user.uid, 
                reviewerName: appUser?.name || user.displayName || user.email || 'Anonymous User',
            };

            console.log('Submitting review:', reviewData);
            console.log('To URL:', `${API_BASE_URL}/api/artworks/${artworkId}/reviews`);

            const res = await fetch(`${API_BASE_URL}/api/artworks/${artworkId}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData),
            });

            const data = await res.json();
            console.log('Response:', data);
            
            if (!res.ok) {
                throw new Error(data.message || 'Server error during review submission.');
            }

            // Success
            setNewReview({ rating: 5, comment: '' });
            setShowForm(false);
            setSuccessMessage('Review submitted successfully!');
            fetchReviews();

        } catch (err: any) {
            console.error('Review submission error:', err);
            setError(err.message || 'Unknown error during submission.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading && reviews.length === 0) { 
        return (
            <section className="mt-8 bg-gray-800/30 p-4 rounded-xl border border-gray-700/50">
                <h2 className="text-xl font-semibold text-white mb-4">Ratings & Reviews</h2>
                <SkeletonList count={2} />
            </section>
        );
    }

    return (
        <section 
            className="mt-8 bg-gray-800/30 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-gray-700/50"
            aria-labelledby="reviews-heading"
        >
            
            {/* COMPACT HEADER */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700/50">
                <div className="flex items-center gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-white">Reviews</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <StarRating rating={roundedAverageRating} size='w-4 h-4' />
                            <span className="text-sm text-gray-400">
                                {averageRating} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            {verifiedCount} verified {verifiedCount === 1 ? 'buyer' : 'buyers'}
                        </p>
                    </div>
                </div>

                {/* Write Review Button */}
                {canSubmitReview && !showForm && (
                    <button
                        onClick={() => { setShowForm(true); setSuccessMessage(''); setError(''); }}
                        className="px-4 py-2 bg-brand-gold text-gray-900 font-semibold rounded-lg hover:bg-brand-gold-antique transition-colors text-sm flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Write Review
                    </button>
                )}
            </div>

            {/* MESSAGES */}
            {error && <div className="p-3 mb-4 text-sm text-red-400 bg-red-900/30 rounded-lg border border-red-700/50">{error}</div>}
            {successMessage && <div className="p-3 mb-4 text-sm text-green-400 bg-green-900/30 rounded-lg border border-green-700/50">{successMessage}</div>}
            
            {/* PROMPT TO SIGN IN */}
            {!canSubmitReview && (
                <div className="mb-4 p-4 bg-gray-800/30 rounded-lg text-center border border-gray-700/50">
                    <p className="text-sm text-gray-400 mb-2">Sign in to write a review</p>
                    <a href="/login" className="text-brand-gold hover:underline font-semibold text-sm">Sign In →</a>
                </div>
            )}

            {/* COMPACT REVIEW FORM */}
            {canSubmitReview && showForm && (
                <form onSubmit={handleSubmitReview} className="mb-6 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-3">Write Your Review</h3>

                    {/* COMPACT STAR INPUT */}
                    <div className="mb-3">
                        <label className="text-sm text-gray-300 mb-2 block">Your Rating:</label>
                        <div className="flex items-center gap-1">
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
                                        className={`transition-all duration-200 ${
                                            active ? 'text-brand-gold scale-110' : 'text-gray-600 hover:text-gray-500'
                                        }`}
                                    >
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.817 2.042a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.817-2.042a1 1 0 00-1.175 0l-2.817 2.042c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.001 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </button>
                                );
                            })}
                            <span className="ml-2 text-lg font-semibold text-brand-gold">
                                {hoverRating || newReview.rating}/5
                            </span>
                        </div>
                    </div>

                    {/* COMPACT COMMENT */}
                    <div className="mb-3">
                        <label htmlFor="review-comment" className="block text-sm text-gray-300 mb-2">
                            Your Review:
                        </label>
                        <textarea
                            id="review-comment"
                            value={newReview.comment}
                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                            placeholder="Share your thoughts about this artwork..."
                            rows={3}
                            required
                            maxLength={500}
                            className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all resize-none text-sm"
                        />
                    </div>

                    {/* COMPACT ACTIONS */}
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={isSubmitting || !newReview.comment.trim()}
                            className="flex-1 px-4 py-2 bg-brand-gold text-gray-900 font-semibold rounded-lg hover:bg-brand-gold-antique transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                        >
                            {isSubmitting ? (
                                <>
                                    <LoadingSpinner size="sm" />
                                    <span>Submitting...</span>
                                </>
                            ) : (
                                <span>Submit Review</span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setShowForm(false);
                                setError(''); 
                                setNewReview({ rating: 5, comment: '' }); 
                            }}
                            className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors font-semibold text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* COMPACT REVIEWS LIST */}
            <div className="space-y-3">
                {/* Sort Control */}
                {reviews.length > 1 && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">
                            Showing {displayedReviews.length} of {reviews.length}
                        </span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                        >
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                            <option value="highest">Highest Rated</option>
                            <option value="lowest">Lowest Rated</option>
                        </select>
                    </div>
                )}
                
                {displayedReviews.length === 0 ? ( 
                    <div className="text-center py-8 bg-gray-800/20 rounded-lg border border-gray-700/50">
                        <p className="text-gray-400 text-sm">
                            No reviews yet. Be the first to share your thoughts!
                        </p>
                    </div>
                ) : (
                    <>
                        {displayedReviews.map((review) => (
                            <div 
                                key={review._id} 
                                className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center text-gray-900 font-bold text-sm">
                                            {review.reviewerName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-white font-semibold text-sm">{review.reviewerName}</p>
                                                {review.verifiedBuyer && (
                                                    <span className="text-[10px] font-semibold uppercase tracking-wide bg-green-500/15 text-green-300 px-2 py-0.5 rounded-full border border-green-500/30">
                                                        Verified Buyer
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {new Date(review.createdAt).toLocaleDateString('en-US', { 
                                                    year: 'numeric', 
                                                    month: 'short', 
                                                    day: 'numeric' 
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <StarRating rating={review.rating} size='w-4 h-4' />
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    {review.comment}
                                </p>
                            </div>
                        ))}
                        
                        {/* Show More/Less Button */}
                        {reviews.length > 3 && (
                            <button
                                onClick={() => setShowAllReviews(!showAllReviews)}
                                className="w-full py-2 text-sm text-brand-gold hover:text-brand-gold-antique font-semibold transition-colors"
                            >
                                {showAllReviews ? 'Show Less' : `Show All ${reviews.length} Reviews`}
                            </button>
                        )}
                    </>
                )}
            </div>

        </section>
    );
}
