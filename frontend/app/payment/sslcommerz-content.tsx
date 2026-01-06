"use client";

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/app/components/Header';

export default function SSLCommerzRedirectContent() {
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
      <section className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-gray-400">Redirecting to SSLCommerz payment gateway...</p>
        </div>
      </section>
    </main>
  );
}
