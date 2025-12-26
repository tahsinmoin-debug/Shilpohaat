"use client";
import { useState } from 'react';
import Header from '../../components/Header';
import { useAuth } from '../../components/AuthProvider';

export default function ArtistPromotionPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [promoData, setPromoData] = useState({
        code: '',
        type: 'percentage',
        value: 0,
        minPurchase: 0,
        startDate: '',
        endDate: '',
        description: 'Artist Discount'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!promoData.code || !promoData.value) {
            alert("Please provide a code and a value.");
            return;
        }

        setIsLoading(true);

        try {
            // Using default port 5000 as requested
            const res = await fetch(`http://localhost:5000/api/promotions/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    ...promoData, 
                    artistId: user?.uid // Links the coupon to the logged-in artist
                })
            });

            const data = await res.json();

            if (res.ok) {
                alert("Coupon created successfully! 🎊");
                setPromoData({
                    code: '',
                    type: 'percentage',
                    value: 0,
                    minPurchase: 0,
                    startDate: '',
                    endDate: '',
                    description: 'Artist Discount'
                });
            } else {
                alert(`Error: ${data.message || "Failed to create"}`);
            }
        } catch (error) {
            alert("Network Error: Check if your Backend is running on port 5000");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-900 text-white">
            <Header />
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-3xl font-heading mb-8">Artist Promotional Tools</h1>
                <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 max-w-2xl mx-auto shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm mb-2 text-gray-400">Coupon Code</label>
                            <input 
                                type="text"
                                required
                                value={promoData.code}
                                className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:ring-2 focus:ring-brand-gold outline-none uppercase"
                                placeholder="e.g. DISCOUNT20"
                                onChange={e => setPromoData({...promoData, code: e.target.value.toUpperCase()})}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm mb-2 text-gray-400">Type</label>
                                <select 
                                    className="w-full p-3 bg-gray-700 rounded border border-gray-600 outline-none"
                                    value={promoData.type}
                                    onChange={e => setPromoData({...promoData, type: e.target.value})}
                                >
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed (৳)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm mb-2 text-gray-400">Value</label>
                                <input 
                                    type="number" 
                                    required 
                                    className="w-full p-3 bg-gray-700 rounded border border-gray-600 outline-none" 
                                    onChange={e => setPromoData({...promoData, value: Number(e.target.value)})} 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm mb-2 text-gray-400">Start Date</label>
                                <input type="date" required className="w-full p-3 bg-gray-700 rounded border border-gray-600" onChange={e => setPromoData({...promoData, startDate: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm mb-2 text-gray-400">Expiry Date</label>
                                <input type="date" required className="w-full p-3 bg-gray-700 rounded border border-gray-600" onChange={e => setPromoData({...promoData, endDate: e.target.value})} />
                            </div>
                        </div>

                        {/* --- FIXED BUTTON --- */}
                        <button 
                            type="submit" 
                            disabled={isLoading} 
                            className="w-full py-4 bg-brand-gold text-black font-bold rounded-lg hover:bg-yellow-500 transition shadow-lg disabled:opacity-50"
                        >
                            {isLoading ? "Processing..." : "Activate Promotional Tool"}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}