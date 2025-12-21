'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';

export default function TestUIDPage() {
  const [firebaseUID, setFirebaseUID] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setFirebaseUID(user.uid);
        setEmail(user.email);
      } else {
        setFirebaseUID(null);
        setEmail(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('✅ Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!firebaseUID) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg text-center">
          <h1 className="text-white text-2xl mb-4">🔒 Not Logged In</h1>
          <p className="text-gray-400 mb-4">
            Please login first to see your Firebase UID
          </p>
          <a
            href="/login"
            className="bg-brand-gold text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-brand-gold-antique inline-block"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-gray-800 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            🔑 Your Firebase UID
          </h1>

          {/* Email */}
          <div className="mb-6">
            <label className="text-gray-400 text-sm block mb-2">
              Logged in as:
            </label>
            <div className="bg-gray-900 p-4 rounded">
              <p className="text-white text-lg">{email}</p>
            </div>
          </div>

          {/* Firebase UID */}
          <div className="mb-6">
            <label className="text-gray-400 text-sm block mb-2">
              Your Firebase UID:
            </label>
            <div className="bg-gray-900 p-4 rounded flex items-center justify-between gap-4">
              <code className="text-brand-gold text-sm break-all flex-1">
                {firebaseUID}
              </code>
              <button
                onClick={() => copyToClipboard(firebaseUID)}
                className="bg-brand-gold text-gray-900 px-4 py-2 rounded font-semibold hover:bg-brand-gold-antique whitespace-nowrap"
              >
                📋 Copy
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-900/30 border border-blue-500/30 rounded p-4 mb-6">
            <h3 className="text-blue-400 font-semibold mb-2">
              📝 How to Use This UID:
            </h3>
            <ul className="text-gray-300 text-sm space-y-2 list-disc list-inside">
              <li>Use this UID in Postman for testing APIs</li>
              <li>Replace <code className="bg-gray-900 px-2 py-1 rounded">YOUR_FIREBASE_UID</code> with this value</li>
              <li>Example: <code className="bg-gray-900 px-2 py-1 rounded text-xs">?firebaseUID={firebaseUID.slice(0, 10)}...</code></li>
            </ul>
          </div>

          {/* Postman Example */}
          <div className="bg-gray-900 border border-gray-700 rounded p-4">
            <h3 className="text-white font-semibold mb-3">
              📮 Postman Test URL:
            </h3>
            <div className="bg-black p-3 rounded mb-2">
              <code className="text-green-400 text-xs break-all">
                GET http://localhost:1350/api/messages/conversations?firebaseUID={firebaseUID}
              </code>
            </div>
            <button
              onClick={() =>
                copyToClipboard(
                  `http://localhost:1350/api/messages/conversations?firebaseUID=${firebaseUID}`
                )
              }
              className="bg-gray-700 text-white px-4 py-2 rounded text-sm hover:bg-gray-600 w-full"
            >
              Copy Full URL
            </button>
          </div>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <a
              href="/"
              className="text-brand-gold hover:text-brand-gold-antique underline"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}