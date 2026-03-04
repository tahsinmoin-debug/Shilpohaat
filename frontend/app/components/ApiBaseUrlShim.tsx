'use client';

import { useEffect } from 'react';
import { API_BASE_URL } from '@/lib/config';

declare global {
  interface Window {
    __apiShimApplied?: boolean;
  }
}

export default function ApiBaseUrlShim() {
  useEffect(() => {
    if (typeof window === 'undefined' || window.__apiShimApplied) return;
    window.__apiShimApplied = true;

    const fromBase = 'http://localhost:5000';
    const toBase = API_BASE_URL || fromBase;

    if (!toBase || toBase === fromBase) return;

    const originalFetch = window.fetch.bind(window);
    window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      if (typeof input === 'string' && input.startsWith(fromBase)) {
        input = input.replace(fromBase, toBase);
      } else if (input instanceof URL && input.href.startsWith(fromBase)) {
        input = new URL(input.href.replace(fromBase, toBase));
      } else if (input instanceof Request && input.url.startsWith(fromBase)) {
        input = new Request(input.url.replace(fromBase, toBase), input);
      }
      return originalFetch(input as RequestInfo | URL, init);
    }) as typeof window.fetch;
  }, []);

  return null;
}

