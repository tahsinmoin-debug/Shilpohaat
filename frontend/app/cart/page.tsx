"use client";

import { useCart } from '../components/CartProvider';
import Header from '../components/Header';
import Link from 'next/link';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, subtotal, shippingCost, totalAmount } = useCart();

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h1 className="text-3xl font-heading text-white mb-2">Your Cart is Empty</h1>
          <p className="text-gray-400 mb-6">Add some beautiful artworks to get started!</p>
          <Link href="/artworks" className="inline-block px-6 py-3 bg-brand-gold text-gray-900 font-semibold rounded-md hover:bg-brand-gold-antique transition-colors">
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Header />
      <section className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-heading text-white mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.artworkId} className="bg-gray-800 rounded-lg p-4 flex gap-4 border border-gray-700">
                {item.image && (
                  <img src={item.image} alt={item.title} className="w-24 h-24 object-cover rounded" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-lg truncate">{item.title}</h3>
                  <p className="text-brand-gold font-bold">৳{item.price.toLocaleString()}</p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => updateQuantity(item.artworkId, item.quantity - 1)}
                      className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 bg-gray-700 text-white rounded">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.artworkId, item.quantity + 1)}
                      className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFromCart(item.artworkId)}
                  className="text-red-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 h-fit sticky top-20">
            <h2 className="text-xl font-heading text-white mb-4">Order Summary</h2>

            <div className="space-y-2 mb-4 pb-4 border-b border-gray-700">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal:</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Shipping:</span>
                <span>{shippingCost === 0 ? 'Free' : `৳${shippingCost.toLocaleString()}`}</span>
              </div>
            </div>

            <div className="flex justify-between text-white font-bold text-lg mb-6">
              <span>Total:</span>
              <span className="text-brand-gold">৳{totalAmount.toLocaleString()}</span>
            </div>

            <Link
              href="/checkout"
              className="w-full block text-center bg-brand-gold text-gray-900 font-semibold py-3 rounded-lg hover:bg-brand-gold-antique transition-colors shadow-lg"
            >
              Proceed to Checkout
            </Link>

            <Link href="/artworks" className="text-center block mt-3 text-brand-gold hover:underline text-sm">
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
