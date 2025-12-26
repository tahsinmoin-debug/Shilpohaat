"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';

interface Props {
    artworkId: string;
}

export default function WishlistButton({ artworkId }: Props) {
    const { user } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            if (user) {
                const res = await fetch(`http://localhost:5000/api/wishlist/${user.uid}`);
                const data = await res.json();
                setIsFavorite(data.some((art: any) => art._id === artworkId));
            }
        };
        checkStatus();
    }, [user, artworkId]);

    const toggleWishlist = async () => {
        if (!user) {
            alert("Please login to save favorites!");
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/wishlist/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.uid, artworkId })
            });
            const data = await res.json();
            setIsFavorite(data.isAdded);
        } catch (error) {
            console.error("Wishlist error:", error);
        }
    };

    return (
        <button 
            onClick={toggleWishlist}
            className={`p-2 rounded-full transition-all ${isFavorite ? 'text-red-500 scale-110' : 'text-gray-400 hover:text-red-400'}`}
        >
            <svg className="w-6 h-6" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        </button>
    );
}