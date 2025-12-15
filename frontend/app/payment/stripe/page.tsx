"use client";

import { Suspense } from 'react';
import StripePaymentContent from '../stripe-content';

export default function StripePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    }>
      <StripePaymentContent />
    </Suspense>
  );
}
