"use client";

import { Suspense } from 'react';
import SSLCommerzRedirectContent from '../sslcommerz-content';

export default function SSLCommerzPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    }>
      <SSLCommerzRedirectContent />
    </Suspense>
  );
}
