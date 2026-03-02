"use client";

import { Suspense } from 'react';
import StripePaymentContent from '../stripe-content';
import Header from '../../components/Header.tsx';

export default function StripePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#0b2438]">
          <Header />
          <div className="flex items-center justify-center px-4 py-12">
            <p className="text-gray-200">Loading payment details...</p>
          </div>
        </main>
      }
    >
      <StripePaymentContent />
    </Suspense>
  );
}
