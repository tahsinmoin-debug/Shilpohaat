'use client';

import React from 'react';
import { LanguageProvider } from './components/LanguageProvider';
import { AuthProvider } from './components/AuthProvider';
import { CartProvider } from './components/CartProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
