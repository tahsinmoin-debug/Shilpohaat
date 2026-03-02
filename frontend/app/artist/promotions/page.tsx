"use client";

import { useState, useEffect } from "react";
import Header from "../../components/Header";
import { useAuth } from "../../components/AuthProvider";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";

interface Artwork {
  _id: string;
  title: string;
  price: number;
  images: string[];
}

interface Promotion {
  _id: string;
  code: string;
  type: string;
  value: number;
  minPurchase: number;
  startDate: string;
  endDate: string;
  description: string;
  applicableArtworks: Artwork[];
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
}

export default function ArtistPromotionPage() {
  const router = useRouter();
  const { user, appUser, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activePromos, setActivePromos] = useState<Promotion[]>([]);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [artworksLoading, setArtworksLoading] = useState(true);
  const [selectedArtworks, setSelectedArtworks] = useState<string[]>([]);
  
  const [promoData, setPromoData] = useState({
    code: "",
    type: "percentage",
    value: 0,
    minPurchase: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    description: "Special Discount",
    usageLimit: null as number | null,
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (!appUser || appUser.role !== 'artist') {
        router.push('/');
        return;
      }
    }
  }, [user, appUser, authLoading, router]);

  useEffect(() => {
    if (user && appUser) {
      fetchPromotions();
      fetchArtworks();
    }
  }, [user, appUser]);

  const fetchPromotions = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/promotions/artist/${user.uid}`);
      const data = await res.json();
      if (res.ok) setActivePromos(data.promotions || []);
    } catch (error) {
      console.error("Failed to fetch promotions", error);
    }
  };

  const fetchArtworks = async () => {
    if (!user || !appUser) {
      console.log('Cannot fetch artworks - missing user or appUser:', { user: !!user, appUser: !!appUser });
      setArtworksLoading(false);
      return;
    }
    
    try {
      setArtworksLoading(true);
      console.log('=== Fetching Artworks ===');
      console.log('User Firebase UID:', user.uid);
      console.log('AppUser MongoDB ID:', appUser._id);
      console.log('AppUser object:', appUser);
      
      const url = `${API_BASE_URL}/api/artworks/artist/${appUser._id}`;
      console.log('Fetching from URL:', url);
      
      const res = await fetch(url);
      console.log('Response status:', res.status);
      
      const data = await res.json();
      console.log('Response data:', data);
      
      if (res.ok && data.artworks) {
        console.log('✓ Found', data.artworks.length, 'artworks for this artist');
        setArtworks(data.artworks);
      } else {
        console.error('✗ Failed to fetch artworks:', data);
        setArtworks([]);
      }
    } catch (error) {
      console.error("✗ Exception while fetching artworks:", error);
      setArtworks([]);
    } finally {
      setArtworksLoading(false);
    }
  };

  const handleDelete = async (promoId: string) => {
    if (!confirm("Delete this promotion?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/promotions/${promoId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setActivePromos((prev) => prev.filter((p) => p._id !== promoId));
      }
    } catch {
      alert("Failed to delete promotion");
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Code ${code} copied! 📋`);
  };

  const toggleArtwork = (artworkId: string) => {
    setSelectedArtworks(prev =>
      prev.includes(artworkId)
        ? prev.filter(id => id !== artworkId)
        : [...prev, artworkId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!promoData.code || promoData.value <= 0) {
      alert("Please provide a valid code and value.");
      return;
    }

    if (promoData.type === 'percentage' && promoData.value > 100) {
      alert("Percentage discount cannot exceed 100%");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/promotions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...promoData,
          artistId: user?.uid,
          applicableArtworks: selectedArtworks,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Promotion created successfully!");
        fetchPromotions();
        // Reset form
        setPromoData({
          code: "",
          type: "percentage",
          value: 0,
          minPurchase: 0,
          startDate: new Date().toISOString().split("T")[0],
          endDate: "",
          description: "Special Discount",
          usageLimit: null,
        });
        setSelectedArtworks([]);
      } else {
        console.error('Promotion creation error:', data);
        alert(data.message || "Failed to create promotion");
      }
    } catch (error) {
      console.error('Promotion creation exception:', error);
      alert("Failed to create promotion. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-gray-900">
        <Header />
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
        </div>
      </main>
    );
  }

  const getDiscountDisplay = (promo: Promotion) => {
    if (promo.type === 'percentage') {
      return `${promo.value}% OFF`;
    }
    return `৳${promo.value} OFF`;
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <Header />

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-heading text-brand-gold mb-2">
              Promotional Tools
            </h1>
            <p className="text-sm md:text-base text-gray-400">
              Create discount codes and limited-time sales to boost your artwork sales
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
            {/* CREATE FORM */}
            <div className="xl:col-span-2 bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-700">
              <h2 className="text-lg md:text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="text-2xl">🎫</span>
                Create New Coupon
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Coupon Code */}
                <div>
                  <label className="block text-sm mb-2 text-gray-400 font-medium">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={promoData.code}
                    onChange={(e) =>
                      setPromoData({
                        ...promoData,
                        code: e.target.value.toUpperCase().replace(/\s/g, ""),
                      })
                    }
                    placeholder="e.g., SUMMER2024"
                    className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 uppercase font-mono focus:border-brand-gold outline-none transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm mb-2 text-gray-400 font-medium">
                    Description
                  </label>
                  <input
                    type="text"
                    value={promoData.description}
                    onChange={(e) =>
                      setPromoData({ ...promoData, description: e.target.value })
                    }
                    placeholder="e.g., Summer Sale"
                    className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 focus:border-brand-gold outline-none transition-colors"
                  />
                </div>

                {/* Type and Value */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-400 font-medium">
                      Discount Type *
                    </label>
                    <select
                      value={promoData.type}
                      onChange={(e) =>
                        setPromoData({ ...promoData, type: e.target.value })
                      }
                      className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 focus:border-brand-gold outline-none transition-colors"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (৳)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-400 font-medium">
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max={promoData.type === 'percentage' ? 100 : undefined}
                      value={promoData.value}
                      onChange={(e) =>
                        setPromoData({
                          ...promoData,
                          value: Number(e.target.value),
                        })
                      }
                      placeholder={promoData.type === 'percentage' ? '10' : '500'}
                      className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 focus:border-brand-gold outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Min Purchase and Usage Limit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-400 font-medium">
                      Minimum Purchase (৳)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={promoData.minPurchase}
                      onChange={(e) =>
                        setPromoData({
                          ...promoData,
                          minPurchase: Number(e.target.value),
                        })
                      }
                      placeholder="0"
                      className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 focus:border-brand-gold outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-400 font-medium">
                      Usage Limit (optional)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={promoData.usageLimit || ''}
                      onChange={(e) =>
                        setPromoData({
                          ...promoData,
                          usageLimit: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      placeholder="Unlimited"
                      className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 focus:border-brand-gold outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-400 font-medium">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={promoData.startDate}
                      onChange={(e) =>
                        setPromoData({
                          ...promoData,
                          startDate: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 focus:border-brand-gold outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-400 font-medium">
                      End Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={promoData.endDate}
                      onChange={(e) =>
                        setPromoData({
                          ...promoData,
                          endDate: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 focus:border-brand-gold outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Artwork Selection */}
                <div>
                  <label className="block text-sm mb-3 text-gray-400 font-medium">
                    Apply to Artworks (leave empty for all artworks)
                  </label>
                  <div className="max-h-48 sm:max-h-64 overflow-y-auto bg-gray-900 rounded-lg border border-gray-700 p-2 sm:p-3">
                    {artworksLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold"></div>
                      </div>
                    ) : artworks.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm">No artworks found</p>
                        <button
                          onClick={fetchArtworks}
                          className="mt-2 text-xs text-brand-gold hover:text-yellow-500 underline"
                        >
                          Retry
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {artworks.map((artwork) => (
                          <label
                            key={artwork._id}
                            className="flex items-center gap-2 sm:gap-3 p-2 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedArtworks.includes(artwork._id)}
                              onChange={() => toggleArtwork(artwork._id)}
                              className="w-4 h-4 flex-shrink-0 text-brand-gold bg-gray-800 border-gray-600 rounded focus:ring-brand-gold focus:ring-2"
                            />
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                              {artwork.images[0] ? (
                                <img
                                  src={artwork.images[0]}
                                  alt={artwork.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm text-white truncate">{artwork.title}</p>
                              <p className="text-xs text-gray-500 break-words">৳{artwork.price.toLocaleString()}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedArtworks.length > 0 && (
                    <p className="text-xs text-brand-gold mt-2">
                      {selectedArtworks.length} artwork{selectedArtworks.length > 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 md:py-4 bg-brand-gold text-gray-900 font-bold rounded-xl hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Creating..." : "Create Promotion"}
                </button>
              </form>
            </div>

            {/* ACTIVE PROMOS */}
            <div className="xl:col-span-1">
              <h2 className="text-lg md:text-xl font-semibold mb-4">
                Active Promotions
              </h2>

              <div className="space-y-4 max-h-[600px] xl:max-h-[800px] overflow-y-auto">
                {activePromos.length === 0 ? (
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                    <p className="text-gray-500">No active promotions</p>
                    <p className="text-xs text-gray-600 mt-2">Create your first coupon to boost sales</p>
                  </div>
                ) : (
                  activePromos.map((promo) => (
                    <div
                      key={promo._id}
                      className={`p-4 bg-gray-800 border rounded-xl transition-all ${
                        isExpired(promo.endDate)
                          ? 'border-gray-700 opacity-60'
                          : 'border-brand-gold/30 hover:border-brand-gold/60'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0 pr-2">
                          <div
                            onClick={() => !isExpired(promo.endDate) && copyToClipboard(promo.code)}
                            className={`font-mono text-base sm:text-lg font-bold break-all ${
                              isExpired(promo.endDate) ? 'text-gray-500' : 'text-brand-gold cursor-pointer hover:text-yellow-500'
                            }`}
                          >
                            {promo.code}
                          </div>
                          <p className="text-xs text-gray-400 mt-1 break-words">{promo.description}</p>
                        </div>
                        <button
                          onClick={() => handleDelete(promo._id)}
                          className="text-red-400 hover:text-red-300 transition-colors p-1"
                          title="Delete promotion"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="px-2 sm:px-3 py-1 bg-brand-gold/20 text-brand-gold text-xs font-bold rounded-full whitespace-nowrap">
                          {getDiscountDisplay(promo)}
                        </span>
                        {isExpired(promo.endDate) && (
                          <span className="px-2 sm:px-3 py-1 bg-red-900/30 text-red-400 text-xs font-bold rounded-full whitespace-nowrap">
                            EXPIRED
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-xs text-gray-400">
                        <div className="flex justify-between gap-2">
                          <span className="flex-shrink-0">Valid until:</span>
                          <span className="text-white text-right break-words">{new Date(promo.endDate).toLocaleDateString()}</span>
                        </div>
                        {promo.minPurchase > 0 && (
                          <div className="flex justify-between gap-2">
                            <span className="flex-shrink-0">Min purchase:</span>
                            <span className="text-white text-right break-words">৳{promo.minPurchase.toLocaleString()}</span>
                          </div>
                        )}
                        {promo.usageLimit && (
                          <div className="flex justify-between gap-2">
                            <span className="flex-shrink-0">Usage:</span>
                            <span className="text-white text-right break-words">{promo.usedCount} / {promo.usageLimit}</span>
                          </div>
                        )}
                        {promo.applicableArtworks && promo.applicableArtworks.length > 0 && (
                          <div className="flex justify-between gap-2">
                            <span className="flex-shrink-0">Applies to:</span>
                            <span className="text-white text-right break-words">{promo.applicableArtworks.length} artwork{promo.applicableArtworks.length > 1 ? 's' : ''}</span>
                          </div>
                        )}
                        {(!promo.applicableArtworks || promo.applicableArtworks.length === 0) && (
                          <div className="text-center py-1 bg-gray-700/50 rounded">
                            <span className="text-brand-gold text-xs">Applies to all artworks</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
