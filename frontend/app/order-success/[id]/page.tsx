"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';

interface Order {
  _id: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  items?: Array<{ title: string; price: number; quantity: number }>;
  createdAt?: string;
  paymentMethod?: string;
  shippingAddress?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

interface PageProps {
  params: { id: string };
}

export default function OrderSuccessPage({ params }: PageProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async (): Promise<void> => {
      try {
        const res = await fetch(`http://localhost:5000/api/orders/${params.id}`);
        const data = await res.json();
        if (res.ok) {
          setOrder(data.order);
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.id]);

  return (
    <main className="min-h-screen">
      <Header />
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-heading text-white mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-300 text-lg">Thank you for your purchase</p>
          </div>

          {loading ? (
            <div className="text-gray-400">Loading order details...</div>
          ) : order ? (
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 mb-8 text-left">
              <div className="mb-6 pb-6 border-b border-gray-700">
                <p className="text-gray-400 text-sm mb-1">Order ID</p>
                <p className="text-white font-mono text-lg">{order._id}</p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Order Date</p>
                  <p className="text-white">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Amount</p>
                  <p className="text-brand-gold text-lg font-bold">৳{order.totalAmount.toLocaleString()}</p>
                </div>
              </div>

              <div className="mb-6 pb-6 border-b border-gray-700">
                <p className="text-gray-400 text-sm mb-2">Payment Method</p>
                <p className="text-white capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-2">Shipping Address</p>
                <p className="text-white">
                  {order.shippingAddress 
                    ? `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`
                    : 'Not provided'}
                </p>
              </div>
            </div>
          ) : null}

          <div className="space-y-3">
            <p className="text-gray-300">
              {order?.paymentMethod === 'cod'
                ? 'Your order has been placed. Our team will contact you soon to confirm delivery.'
                : 'Your order is being processed. You will receive a confirmation email shortly.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/account"
                className="px-6 py-3 bg-brand-gold text-gray-900 font-semibold rounded-lg hover:bg-brand-gold-antique transition-colors"
              >
                View My Orders
              </Link>
              <Link
                href="/artworks"
                className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
