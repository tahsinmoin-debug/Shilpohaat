"use client";
import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { useAuth } from '../../components/AuthProvider';

interface Promotion {
    _id: string;
    code: string;
    type: string;
    value: number;
    endDate: string;
}

export default function ArtistPromotionPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [activePromos, setActivePromos] = useState<Promotion[]>([]);
    const [promoData, setPromoData] = useState({
        code: '',
        type: 'percentage',
        value: 0,
        minPurchase: 0,
        startDate: '',
        endDate: '',
        description: 'Artist Discount'
    });

    // 1. Fetch existing promotions for this artist
    const fetchPromotions = async () => {
        if (!user) return;
        try {
            const res = await fetch(`http://localhost:5000/api/promotions/artist/${user.uid}`);
            const data = await res.json();
            if (res.ok) setActivePromos(data.promotions || []);
        } catch (error) {
            console.error("Failed to fetch promotions");
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!promoData.code || promoData.value <= 0) {
            alert("Please provide a valid code and value.");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch(`http://localhost:5000/api/promotions/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    ...promoData, 
                    artistId: user?.uid 
                })
            });

            const data = await res.json();

            if (res.ok) {
                alert("Promotion activated successfully! 🎊");
                setPromoData({
                    code: '',
                    type: 'percentage',
                    value: 0,
                    minPurchase: 0,
                    startDate: '',
                    endDate: '',
                    description: 'Artist Discount'
                });
                fetchPromotions(); // Refresh the list
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
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-heading mb-2 text-brand-gold">Promotional Tools</h1>
                    <p className="text-gray-400 mb-8">Create and manage discounts to boost your sales.</p>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT: CREATE FORM */}
                        <div className="lg:col-span-2 bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl h-fit">
                            <h2 className="text-xl font-semibold mb-6">Create New Coupon</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm mb-2 text-gray-400">Coupon Code (Unique)</label>
                                    <input 
                                        type="text"
                                        required
                                        value={promoData.code}
                                        className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 focus:ring-2 focus:ring-brand-gold outline-none uppercase font-mono tracking-widest"
                                        placeholder="e.g. MONSOON20"
                                        onChange={e => setPromoData({...promoData, code: e.target.value.toUpperCase()})}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm mb-2 text-gray-400">Type</label>
                                        <select 
                                            className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none"
                                            value={promoData.type}
                                            onChange={e => setPromoData({...promoData, type: e.target.value})}
                                        >
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="fixed">Fixed (৳)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-2 text-gray-400">Discount Value</label>
                                        <input 
                                            type="number" 
                                            required 
                                            value={promoData.value || ''}
                                            className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none" 
                                            onChange={e => setPromoData({...promoData, value: Number(e.target.value)})} 
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm mb-2 text-gray-400">Start Date</label>
                                        <input 
                                            type="date" 
                                            required 
                                            value={promoData.startDate}
                                            className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 text-gray-300" 
                                            onChange={e => setPromoData({...promoData, startDate: e.target.value})} 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-2 text-gray-400">Expiry Date</label>
                                        <input 
                                            type="date" 
                                            required 
                                            value={promoData.endDate}
                                            className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 text-gray-300" 
                                            onChange={e => setPromoData({...promoData, endDate: e.target.value})} 
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isLoading} 
                                    className="w-full py-4 bg-brand-gold text-black font-bold rounded-xl hover:bg-yellow-500 transition-all shadow-lg transform active:scale-[0.98] disabled:opacity-50"
                                >
                                    {isLoading ? "Validating..." : "Activate Promotion"}
                                </button>
                            </form>
                        </div>

                        {/* RIGHT: ACTIVE PROMOS LIST */}
                        <div className="lg:col-span-1 space-y-4">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Active Tools
                            </h2>
                            {activePromos.length === 0 ? (
                                <div className="p-6 bg-gray-800/50 border border-dashed border-gray-700 rounded-2xl text-center">
                                    <p className="text-gray-500 text-sm">No active coupons.</p>
                                </div>
                            ) : (
                                activePromos.map((promo) => (
                                    <div key={promo._id} className="p-4 bg-gray-800 border border-gray-700 rounded-xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-2 bg-brand-gold/10 text-brand-gold text-[10px] font-bold uppercase">
                                            {promo.type === 'percentage' ? `${promo.value}% Off` : `৳${promo.value} Off`}
                                        </div>
                                        <p className="text-lg font-mono font-bold text-white mb-1">{promo.code}</p>
                                        <p className="text-xs text-gray-400">Expires: {new Date(promo.endDate).toLocaleDateString()}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}