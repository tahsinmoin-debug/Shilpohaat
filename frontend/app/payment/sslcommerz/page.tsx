"use client";

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '../../components/Header';

export default function SSLCommerzRedirectPage() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get('orderId');

  useEffect(() => {
    // If this page is reached directly, send back to checkout
    if (!orderId) {
      router.replace('/checkout');
    }
  }, [orderId, router]);

  return (
    <main className="min-h-screen">
      <Header />
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-8 border border-gray-700">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold mx-auto mb-4"></div>
          <h1 className="text-2xl font-heading text-white mb-2">Redirecting to SSLCommerz</h1>
          <p className="text-gray-300">Please wait while we start your secure payment...</p>
        </div>
      </section>
    </main>
  );
}
