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
        startDate: new Date().toISOString().split('T')[0], // Default to today
        endDate: '',
        description: 'Artist Discount'
    });

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

    // Handy Feature: Delete Promotion
    const handleDelete = async (promoId: string) => {
        if (!confirm("Are you sure you want to delete this promotion?")) return;
        try {
            const res = await fetch(`http://localhost:5000/api/promotions/${promoId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setActivePromos(prev => prev.filter(p => p._id !== promoId));
            }
        } catch (error) {
            alert("Failed to delete promotion");
        }
    };

    // Handy Feature: Copy Code to Clipboard
    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        alert(`Code ${code} copied to clipboard! 📋`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!promoData.code || promoData.value <= 0) {
            alert("Please provide a valid code and value.");
            return;
        }

        if (new Date(promoData.endDate) <= new Date(promoData.startDate)) {
            alert("Expiry date must be after the start date.");
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
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: '',
                    description: 'Artist Discount'
                });
                fetchPromotions();
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
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-heading text-brand-gold">Promotional Tools</h1>
                        <p className="text-gray-400">Boost your sales by offering custom discounts to your collectors.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT: CREATE FORM */}
                        <div className="lg:col-span-2 bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl">
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <span>✨</span> Create New Coupon
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm mb-2 text-gray-400 font-medium">Coupon Code</label>
                                    <input 
                                        type="text"
                                        required
                                        value={promoData.code}
                                        className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 focus:ring-2 focus:ring-brand-gold outline-none uppercase font-mono tracking-widest transition-all"
                                        placeholder="e.g. MONSOON20"
                                        onChange={e => setPromoData({...promoData, code: e.target.value.toUpperCase().replace(/\s/g, '')})}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm mb-2 text-gray-400 font-medium">Type</label>
                                        <select 
                                            className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none cursor-pointer"
                                            value={promoData.type}
                                            onChange={e => setPromoData({...promoData, type: e.target.value})}
                                        >
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="fixed">Fixed (৳)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-2 text-gray-400 font-medium">Value</label>
                                        <input 
                                            type="number" 
                                            required 
                                            value={promoData.value || ''}
                                            className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none" 
                                            placeholder={promoData.type === 'percentage' ? "20" : "500"}
                                            onChange={e => setPromoData({...promoData, value: Number(e.target.value)})} 
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm mb-2 text-gray-400 font-medium">Start Date</label>
                                        <input 
                                            type="date" 
                                            required 
                                            min={new Date().toISOString().split('T')[0]}
                                            value={promoData.startDate}
                                            className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 text-gray-300" 
                                            onChange={e => setPromoData({...promoData, startDate: e.target.value})} 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-2 text-gray-400 font-medium">Expiry Date</label>
                                        <input 
                                            type="date" 
                                            required 
                                            min={promoData.startDate}
                                            value={promoData.endDate}
                                            className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 text-gray-300" 
                                            onChange={e => setPromoData({...promoData, endDate: e.target.value})} 
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isLoading} 
                                    className="w-full py-4 bg-brand-gold text-black font-bold rounded-xl hover:bg-yellow-500 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                >
                                    {isLoading ? "Generating..." : "Activate Promotional Tool"}
                                </button>
                            </form>
                        </div>

                        {/* RIGHT: ACTIVE PROMOS LIST */}
                        <div className="lg:col-span-1">
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Active Campaigns
                            </h2>
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {activePromos.length === 0 ? (
                                    <div className="p-8 bg-gray-800/50 border border-dashed border-gray-700 rounded-2xl text-center">
                                        <p className="text-gray-500 text-sm">No active coupons yet.</p>
                                    </div>
                                ) : (
                                    activePromos.map((promo) => (
                                        <div key={promo._id} className="p-5 bg-gray-800 border border-gray-700 rounded-xl relative group transition-all hover:border-brand-gold/50">
                                            <div className="flex justify-between items-start mb-2">
                                                <p 
                                                    className="text-lg font-mono font-bold text-brand-gold cursor-pointer hover:underline"
                                                    onClick={() => copyToClipboard(promo.code)}
                                                >
                                                    {promo.code}
                                                </p>
                                                <button 
                                                    onClick={() => handleDelete(promo._id)}
                                                    className="text-gray-500 hover:text-red-500 transition-colors"
                                                    title="Delete Coupon"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between mt-4">
                                                <span className="text-xs font-bold uppercase px-2 py-1 bg-gray-700 rounded text-gray-300">
                                                    {promo.type === 'percentage' ? `${promo.value}% Off` : `৳${promo.value} Off`}
                                                </span>
                                                <span className="text-[10px] text-gray-500 font-medium">
                                                    Ends: {new Date(promo.endDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #1f2937;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #374151;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #d4af37;
                }
            `}</style>
        </main>
    );
}