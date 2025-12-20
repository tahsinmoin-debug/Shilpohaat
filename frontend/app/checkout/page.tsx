"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../components/CartProvider';
import { useAuth } from '../components/AuthProvider';
import { API_BASE_URL } from '@/lib/config';
import Header from '../components/Header';
import Link from 'next/link';

type PaymentMethod = 'cod' | 'sslcommerz' | 'stripe';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, subtotal, shippingCost, totalAmount, clearCart } = useCart();
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // --- NEW PROMOTION STATES ---
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponStatus, setCouponStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [promoMessage, setPromoMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    customerName: user?.displayName || '',
    customerEmail: user?.email || '',
    customerPhone: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'Bangladesh',
  });

  // --- NEW VALIDATION FUNCTION ---
  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponStatus('loading');
    setPromoMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/promotions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, cartTotal: subtotal }),
      });

      const data = await res.json();

      if (res.ok) {
        let calculatedDiscount = 0;
        if (data.type === 'percentage') {
          calculatedDiscount = (subtotal * data.discountValue) / 100;
        } else {
          calculatedDiscount = data.discountValue;
        }
        setDiscount(calculatedDiscount);
        setCouponStatus('success');
        setPromoMessage(`Success! ৳${calculatedDiscount.toLocaleString()} discount applied.`);
      } else {
        setCouponStatus('error');
        setPromoMessage(data.message || 'Invalid coupon');
        setDiscount(0);
      }
    } catch (err: any) {
      setCouponStatus('error');
      setPromoMessage('Error validating coupon');
    }
  };

  // Final total after discount
  const finalTotal = totalAmount - discount;

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-brand-maroon to-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-heading text-white mb-4">Your cart is empty</h1>
          <Link href="/artworks" className="inline-block px-6 py-3 bg-brand-gold text-gray-900 font-semibold rounded-md">
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePlaceOrder = async () => {
    setError('');

    // Validate form
    if (!formData.customerName || !formData.customerPhone || !formData.street || !formData.city || !formData.postalCode) {
      setError('Please fill in all required fields');
      return;
    }

    if (!user) {
      setError('You must be logged in to place an order');
      return;
    }

    setIsLoading(true);

    try {
      const orderData = {
        items: cartItems.map((item) => ({
          artworkId: item.artworkId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
        })),
        subtotal,
        discount, // Track discount applied
        couponCode: couponStatus === 'success' ? couponCode : null, // Record code used
        shippingCost,
        totalAmount: finalTotal, // Use final total here
        paymentMethod,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
      };

      // Create order
      const res = await fetch(`${API_BASE_URL}/api/orders?firebaseUID=${user.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create order');
      }

      const orderId = data.order._id;

      // Handle different payment methods
      if (paymentMethod === 'cod') {
        clearCart();
        router.push(`/order-success/${orderId}`);
      } else if (paymentMethod === 'sslcommerz') {
        // Call backend to initiate SSLCommerz and redirect to gateway URL
        const payRes = await fetch(`${API_BASE_URL}/api/payments/sslcommerz/initiate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });
        const payData = await payRes.json();
        if (!payRes.ok || !payData.redirectURL) {
          throw new Error(payData.message || 'Failed to start SSLCommerz payment');
        }
        clearCart();
        window.location.href = payData.redirectURL;
      } else if (paymentMethod === 'stripe') {
        clearCart();
        router.push(`/payment/stripe?orderId=${orderId}`);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to place order');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-maroon to-gray-900">
      <Header />
      <section className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-heading text-white mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg">{error}</div>
            )}

            {/* Shipping Information */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-heading text-white mb-4">Shipping Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="customerName"
                    placeholder="Full Name *"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className="px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  />
                  <input
                    type="email"
                    name="customerEmail"
                    placeholder="Email *"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    className="px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  />
                </div>

                <input
                  type="tel"
                  name="customerPhone"
                  placeholder="Phone Number *"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />

                <input
                  type="text"
                  name="street"
                  placeholder="Street Address *"
                  value={formData.street}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    name="city"
                    placeholder="City *"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  />
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="Postal Code *"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  />
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  >
                    <option value="Bangladesh">Bangladesh</option>
                    <option value="India">India</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-heading text-white mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors" style={{ borderColor: paymentMethod === 'cod' ? '#FFD700' : '#374151', backgroundColor: paymentMethod === 'cod' ? 'rgba(255, 215, 0, 0.1)' : 'transparent' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-4 h-4 mt-1 cursor-pointer"
                  />
                  <div className="ml-4">
                    <p className="font-semibold text-white">Cash on Delivery</p>
                    <p className="text-sm text-gray-400">Pay when you receive your order</p>
                  </div>
                </label>

                <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors" style={{ borderColor: paymentMethod === 'sslcommerz' ? '#FFD700' : '#374151', backgroundColor: paymentMethod === 'sslcommerz' ? 'rgba(255, 215, 0, 0.1)' : 'transparent' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="sslcommerz"
                    checked={paymentMethod === 'sslcommerz'}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-4 h-4 mt-1 cursor-pointer"
                  />
                  <div className="ml-4">
                    <p className="font-semibold text-white">SSLCommerz</p>
                    <p className="text-sm text-gray-400">Pay with Bkash, Nagad, Credit Card, and more (Bangladesh)</p>
                  </div>
                </label>

                <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors" style={{ borderColor: paymentMethod === 'stripe' ? '#FFD700' : '#374151', backgroundColor: paymentMethod === 'stripe' ? 'rgba(255, 215, 0, 0.1)' : 'transparent' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="stripe"
                    checked={paymentMethod === 'stripe'}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-4 h-4 mt-1 cursor-pointer"
                  />
                  <div className="ml-4">
                    <p className="font-semibold text-white">Stripe</p>
                    <p className="text-sm text-gray-400">Pay with international credit/debit cards</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 h-fit sticky top-20">
            <h2 className="text-xl font-heading text-white mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4 pb-4 border-b border-gray-700">
              {cartItems.map((item) => (
                <div key={item.artworkId} className="flex justify-between text-sm text-gray-300">
                  <span>{item.title} x {item.quantity}</span>
                  <span>৳{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* --- NEW COUPON INPUT FIELD --- */}
            <div className="mb-6 pb-6 border-b border-gray-700">
              <label className="text-sm text-gray-400 block mb-2">Have a coupon?</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none text-sm"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponStatus === 'loading'}
                  className="px-4 py-2 bg-gray-600 text-brand-gold rounded text-sm font-bold hover:bg-gray-500 transition disabled:opacity-50"
                >
                  {couponStatus === 'loading' ? '...' : 'Apply'}
                </button>
              </div>
              {promoMessage && (
                <p className={`mt-2 text-xs ${couponStatus === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {promoMessage}
                </p>
              )}
            </div>

            <div className="space-y-2 mb-4 pb-4 border-b border-gray-700">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal:</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              
              {/* --- DISCOUNT LINE --- */}
              {discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount:</span>
                  <span>-৳{discount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-300">
                <span>Shipping:</span>
                <span>{shippingCost === 0 ? 'Free' : `৳${shippingCost.toLocaleString()}`}</span>
              </div>
            </div>

            <div className="flex justify-between text-white font-bold text-lg mb-6">
              <span>Total:</span>
              <span className="text-brand-gold">৳{finalTotal.toLocaleString()}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isLoading}
              className="w-full bg-brand-gold text-gray-900 font-semibold py-3 rounded-lg hover:bg-brand-gold-antique transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Place Order'}
            </button>

            <Link href="/cart" className="text-center block mt-3 text-brand-gold hover:underline text-sm">
              Back to Cart
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}