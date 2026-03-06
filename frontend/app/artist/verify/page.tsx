"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import { useAuth } from '../../components/AuthProvider';
import { API_BASE_URL } from '@/lib/config';

interface VerificationStatus {
  emailVerified: boolean;
  phoneVerified: boolean;
  nidStatus: 'unsubmitted' | 'pending' | 'approved' | 'rejected';
  nidNumber?: string;
  nidDocumentUrl?: string;
}

export default function VerificationPage() {
  const router = useRouter();
  const { user, appUser, loading: authLoading } = useAuth();
  const [nidNumber, setNidNumber] = useState('');
  const [nidFile, setNidFile] = useState<File | null>(null);
  const [status, setStatus] = useState<VerificationStatus>({
    emailVerified: false,
    phoneVerified: false,
    nidStatus: 'unsubmitted'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (!appUser || appUser.role !== 'artist') {
        router.push('/');
        return;
      }
    }
  }, [user, appUser, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchVerificationStatus();
    }
  }, [user]);

  const fetchVerificationStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/verify/status/${user?.uid}`);
      const data = await res.json();
      setStatus({
        emailVerified: user?.emailVerified || false,
        phoneVerified: data.phoneVerified || false,
        nidStatus: data.nidStatus || 'unsubmitted',
        nidNumber: data.nidNumber,
        nidDocumentUrl: data.nidDocumentUrl
      });
    } catch (err) {
      console.error('Failed to fetch verification status:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file (JPG, PNG, etc.)');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setNidFile(file);
      setError('');
    }
  };

  const uploadNidDocument = async (): Promise<string> => {
    if (!nidFile) return '';

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', nidFile);

    try {
      const res = await fetch(`${API_BASE_URL}/api/upload/image`, {
        method: 'POST',
        body: formData
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any = null;

      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const raw = await res.text();
        const preview = raw.slice(0, 120);
        throw new Error(`Invalid response from upload API (${res.status}). ${preview}`);
      }

      if (!res.ok) {
        throw new Error(data?.error || data?.message || `Upload failed (${res.status})`);
      }

      if (!data?.url) {
        throw new Error('Upload completed but no file URL was returned');
      }

      return data.url;
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to upload NID document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleNidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Validate NID number (10 or 17 digits)
      if (!/^\d{10}$|^\d{17}$/.test(nidNumber)) {
        throw new Error('NID must be 10 or 17 digits');
      }

      if (!nidFile) {
        throw new Error('Please upload your NID document');
      }

      // Upload NID document
      const nidDocumentUrl = await uploadNidDocument();

      // Submit verification request
      const res = await fetch(`${API_BASE_URL}/api/verify/submit-nid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid,
          nidNumber: nidNumber,
          nidDocumentUrl: nidDocumentUrl
        })
      });

      const submitContentType = res.headers.get('content-type') || '';
      let data: any = null;
      if (submitContentType.includes('application/json')) {
        data = await res.json();
      } else {
        const raw = await res.text();
        const preview = raw.slice(0, 120);
        throw new Error(`Invalid response from verification API (${res.status}). ${preview}`);
      }

      if (!res.ok) {
        throw new Error(data.message || 'Submission failed');
      }

      setSuccess('NID submitted successfully! Our team will review it within 24-48 hours.');
      setStatus(prev => ({ ...prev, nidStatus: 'pending' }));
      setNidNumber('');
      setNidFile(null);
    } catch (err: any) {
      setError(err.message || 'Failed to submit NID');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-gray-900">
        <Header />
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-heading mb-2">Identity Verification</h1>
          <p className="text-gray-400 mb-8">Verify your identity to build trust with buyers and unlock premium features</p>

          {/* Verification Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Email Verification */}
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold">Email</span>
              </div>
              <div className="flex items-center gap-2">
                {status.emailVerified ? (
                  <>
                    <span className="text-green-500 text-sm">✓ Verified</span>
                  </>
                ) : (
                  <span className="text-yellow-500 text-sm">Pending</span>
                )}
              </div>
            </div>

            {/* Phone Verification */}
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="font-semibold">Phone</span>
              </div>
              <div className="flex items-center gap-2">
                {status.phoneVerified ? (
                  <span className="text-green-500 text-sm">✓ Verified</span>
                ) : (
                  <span className="text-gray-500 text-sm">Not verified</span>
                )}
              </div>
            </div>

            {/* NID Verification */}
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                <span className="font-semibold">NID</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm capitalize ${
                  status.nidStatus === 'approved' ? 'text-green-500' :
                  status.nidStatus === 'pending' ? 'text-yellow-500' :
                  status.nidStatus === 'rejected' ? 'text-red-500' :
                  'text-gray-500'
                }`}>
                  {status.nidStatus === 'approved' && '✓ '}
                  {status.nidStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-lg text-green-400">
              {success}
            </div>
          )}

          {/* NID Verification Form */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">National ID (NID) Verification</h2>

            {status.nidStatus === 'unsubmitted' || status.nidStatus === 'rejected' ? (
              <form onSubmit={handleNidSubmit} className="space-y-6">
                {status.nidStatus === 'rejected' && (
                  <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-400 text-sm">
                    Your previous submission was rejected. Please resubmit with correct information.
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">NID Number</label>
                  <input
                    type="text"
                    value={nidNumber}
                    onChange={(e) => setNidNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 outline-none focus:border-brand-gold transition-colors"
                    placeholder="Enter 10 or 17 digit NID number"
                    maxLength={17}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter your National ID card number</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">NID Document</label>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-brand-gold transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="nid-upload"
                    />
                    <label htmlFor="nid-upload" className="cursor-pointer">
                      <svg className="w-12 h-12 mx-auto mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      {nidFile ? (
                        <p className="text-brand-gold font-medium">{nidFile.name}</p>
                      ) : (
                        <>
                          <p className="text-white font-medium mb-1">Click to upload NID image</p>
                          <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                        </>
                      )}
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Upload a clear photo of your National ID card</p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || isUploading}
                  className="w-full py-3 bg-brand-gold text-gray-900 font-bold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading || isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                      <span>{isUploading ? 'Uploading...' : 'Submitting...'}</span>
                    </>
                  ) : (
                    'Submit for Verification'
                  )}
                </button>
              </form>
            ) : status.nidStatus === 'pending' ? (
              <div className="p-6 bg-blue-900/20 border border-blue-700 rounded-lg text-center overflow-hidden">
                <svg className="w-16 h-16 mx-auto mb-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-white mb-2">Verification in Progress</h3>
                <p className="text-blue-400">Your identity is being verified by our team. This usually takes 24-48 hours.</p>
                {status.nidNumber && (
                  <p className="text-sm text-gray-400 mt-3 break-all px-2">NID: {status.nidNumber}</p>
                )}
              </div>
            ) : status.nidStatus === 'approved' ? (
              <div className="p-6 bg-green-900/20 border border-green-700 rounded-lg text-center overflow-hidden">
                <svg className="w-16 h-16 mx-auto mb-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-white mb-2">Verified Artist</h3>
                <p className="text-green-400">Your identity has been successfully verified!</p>
                {status.nidNumber && (
                  <p className="text-sm text-gray-400 mt-3 break-all px-2">NID: {status.nidNumber}</p>
                )}
              </div>
            ) : null}
          </div>

          {/* Info Section */}
          <div className="mt-8 bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <h3 className="text-lg font-semibold mb-3">Why verify your identity?</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-brand-gold mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Build trust with buyers and increase sales</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-brand-gold mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Get a verified badge on your profile</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-brand-gold mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Access premium features and promotions</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-brand-gold mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Secure your account and prevent fraud</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
