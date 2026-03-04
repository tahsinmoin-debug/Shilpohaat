"use client";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import { useAuth } from "../../components/AuthProvider";

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
    code: "",
    type: "percentage",
    value: 0,
    minPurchase: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    description: "Artist Discount",
  });

  const fetchPromotions = async () => {
    if (!user) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/promotions/artist/${user.uid}`
      );
      const data = await res.json();
      if (res.ok) setActivePromos(data.promotions || []);
    } catch {
      console.error("Failed to fetch promotions");
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, [user]);

  const handleDelete = async (promoId: string) => {
    if (!confirm("Are you sure you want to delete this promotion?")) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/promotions/${promoId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setActivePromos((prev) => prev.filter((p) => p._id !== promoId));
      }
    } catch {
      alert("Failed to delete promotion");
    }
  };

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

    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/promotions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...promoData, artistId: user?.uid }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Promotion created successfully!");
        fetchPromotions();
      } else {
        alert(data.message || "Failed to create promotion");
      }
    } catch {
      alert("Backend not reachable (port 5000)");
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
            <h1 className="text-3xl font-heading text-brand-gold">
              Promotional Tools
            </h1>
            <p className="text-gray-400">
              Boost your sales by offering custom discounts.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* CREATE FORM */}
            <div className="lg:col-span-2 bg-gray-800 p-8 rounded-2xl border border-gray-700">
              <h2 className="text-xl font-semibold mb-6">
                ✨ Create New Coupon
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm mb-2 text-gray-400">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    required
                    value={promoData.code}
                    onChange={(e) =>
                      setPromoData({
                        ...promoData,
                        code: e.target.value
                          .toUpperCase()
                          .replace(/\s/g, ""),
                      })
                    }
                    className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 uppercase font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-400">
                      Type
                    </label>
                    <select
                      value={promoData.type}
                      onChange={(e) =>
                        setPromoData({ ...promoData, type: e.target.value })
                      }
                      className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed (৳)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-400">
                      Value
                    </label>
                    <input
                      type="number"
                      required
                      value={promoData.value}
                      onChange={(e) =>
                        setPromoData({
                          ...promoData,
                          value: Number(e.target.value),
                        })
                      }
                      className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-400">
                      Start Date
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
                      className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-400">
                      Expiry Date
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
                      className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-brand-gold text-black font-bold rounded-xl disabled:opacity-50"
                >
                  {isLoading ? "Creating..." : "Activate Promotion"}
                </button>
              </form>
            </div>

            {/* ACTIVE PROMOS */}
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Active Campaigns
              </h2>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {activePromos.length === 0 ? (
                  <p className="text-gray-500">No active coupons</p>
                ) : (
                  activePromos.map((promo) => (
                    <div
                      key={promo._id}
                      className="p-4 bg-gray-800 border border-gray-700 rounded-xl"
                    >
                      <div className="flex justify-between">
                        <span
                          onClick={() => copyToClipboard(promo.code)}
                          className="font-mono text-brand-gold cursor-pointer"
                        >
                          {promo.code}
                        </span>
                        <button
                          onClick={() => handleDelete(promo._id)}
                          className="text-red-400"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Ends:{" "}
                        {new Date(promo.endDate).toLocaleDateString()}
                      </p>
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
