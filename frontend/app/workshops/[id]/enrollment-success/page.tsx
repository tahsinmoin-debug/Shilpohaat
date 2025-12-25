"use client";

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/app/components/Header';

export default function EnrollmentSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const workshopId = params.id as string;
  const sessionId = searchParams.get('session_id');
  const enrollmentId = searchParams.get('enrollmentId');

  const [confirming, setConfirming] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (enrollmentId && sessionId) {
      confirmEnrollment();
    } else {
      setConfirming(false);
      setSuccess(true); // Free workshop
    }
  }, [enrollmentId, sessionId]);

  const confirmEnrollment = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/workshops/enroll/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentId,
          sessionId
        })
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setSuccess(false);
      }
    } catch (error) {
      console.error('Confirmation error:', error);
      setSuccess(false);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-maroon to-gray-900">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
            {confirming ? (
              <>
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-gold mx-auto mb-4"></div>
                <h2 className="text-2xl font-heading text-white mb-2">
                  Confirming Your Enrollment...
                </h2>
                <p className="text-gray-400">Please wait a moment</p>
              </>
            ) : success ? (
              <>
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-heading text-white mb-4">
                  Enrollment Successful!
                </h2>
                <p className="text-gray-300 mb-6">
                  You're now enrolled in the workshop. Start learning right away!
                </p>

                <div className="space-y-3">
                  <Link
                    href={`/workshops/${workshopId}/learn`}
                    className="block w-full bg-brand-gold text-gray-900 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors"
                  >
                    Start Learning →
                  </Link>

                  <Link
                    href="/workshops"
                    className="block w-full bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Browse More Workshops
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">❌</div>
                <h2 className="text-3xl font-heading text-white mb-4">
                  Enrollment Failed
                </h2>
                <p className="text-gray-300 mb-6">
                  There was an issue confirming your enrollment. Please contact support.
                </p>

                <Link
                  href={`/workshops/${workshopId}`}
                  className="block w-full bg-brand-gold text-gray-900 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors"
                >
                  Back to Workshop
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}