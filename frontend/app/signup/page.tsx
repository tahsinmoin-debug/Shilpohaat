'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import Header from '../components/Header';

export default function SignupPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('buyer');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Check if any fields are empty
    if (!email || !password || !name || !role) {
      setError('Please fill in all fields.');
      setIsLoading(false);
      return;
    }

    try {
      // Step 1: Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUID = userCredential.user.uid;

      // Optionally set display name in Firebase
      if (userCredential.user && name) {
        try { await updateProfile(userCredential.user, { displayName: name }); } catch {}
      }

      // Step 2: Send data to our backend API (password NOT sent; backend expects firebaseUID only)
      const res = await fetch('http://localhost:5000/api/auth/register', {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, role, firebaseUID }),
      });

      // Step 3: Handle backend response
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to register on backend');
      }

      // Step 4: Redirect the user
      setIsLoading(false);
      if (role === 'artist') {
        router.push('/create-profile');
      } else {
        router.push('/');
      }

    } catch (error: any) {
      setIsLoading(false);
      console.error(error);
      setError(error.message);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-maroon to-gray-900">
      <Header />
      
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold text-center text-white font-heading mb-2">
            Create Your Account
          </h2>
          <p className="text-center text-gray-300 mb-6">
            Join শিল্পহাট and discover local art.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label 
                htmlFor="name" 
                className="block text-sm font-medium text-gray-200 mb-1"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                placeholder="Enter your full name"
              />
            </div>

            {/* Role Radio Buttons */}
            <fieldset>
              <legend className="block text-sm font-medium text-gray-200 mb-2">
                I am a:
              </legend>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="buyer"
                    checked={role === 'buyer'}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-4 h-4 text-brand-gold focus:ring-brand-gold focus:ring-2"
                  />
                  <span className="ml-2 text-gray-200">Art Lover (Buyer)</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="artist"
                    checked={role === 'artist'}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-4 h-4 text-brand-gold focus:ring-brand-gold focus:ring-2"
                  />
                  <span className="ml-2 text-gray-200">Artist (Seller)</span>
                </label>
              </div>
            </fieldset>

            {/* Email */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-200 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-200 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                placeholder="Enter a secure password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 font-semibold text-gray-900 bg-brand-gold rounded-md hover:bg-brand-gold-antique transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing Up...' : 'Sign Up'}
            </button>

            {/* Login Link */}
            <p className="text-center text-gray-300 text-sm">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="text-brand-gold hover:text-brand-gold-antique font-semibold"
              >
                Log In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}