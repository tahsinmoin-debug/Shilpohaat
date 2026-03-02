"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { API_BASE_URL } from '@/lib/config';

interface Props {
    artworkId: string;
}

export default function WishlistButton({ artworkId }: Props) {
    const { user } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            if (user) {
                try {
                    const res = await fetch(`${API_BASE_URL}/api/wishlist/${user.uid}`);
                    const data = await res.json();
                    setIsFavorite(data.some((art: any) => art._id === artworkId));
                } catch (error) {
                    console.error("Error checking wishlist status:", error);
                }
            }
        };
        checkStatus();
    }, [user, artworkId]);

    const toggleWishlist = async () => {
        if (!user) {
            alert("Please login to save favorites!");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/wishlist/toggle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.uid, artworkId })
            });
            const data = await res.json();
            setIsFavorite(data.isAdded);
        } catch (error) {
            console.error("Wishlist error:", error);
            alert("Failed to update wishlist. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button 
            onClick={toggleWishlist}
            disabled={isLoading}
            aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
            className={`p-2 rounded-full transition-all ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
            } ${
                isFavorite ? 'text-red-500 scale-110' : 'text-gray-400 hover:text-red-400'
            }`}
        >
            {isLoading ? (
                <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <svg className="w-6 h-6" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            )}
        </button>
    );
}
