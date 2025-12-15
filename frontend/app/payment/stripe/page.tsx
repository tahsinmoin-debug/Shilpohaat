"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import Header from '../../components/Header';
import Link from 'next/link';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

// Card form component
function PaymentForm({ orderId, clientSecret }: { orderId: string; clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const { push } = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      }) as { error?: { message?: string }; paymentIntent?: { status: string; id: string } };

      if (result.error) {
        setError(result.error.message || 'An error occurred during payment');
        setIsProcessing(false);
      } else if (result.paymentIntent?.status === 'succeeded') {
        setSucceeded(true);

        // Confirm with backend
        const confirmRes = await fetch(
          'http://localhost:5000/api/payments/stripe/confirm',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              paymentIntentId: result.paymentIntent.id,
            }),
          }
        );

        const confirmData = await confirmRes.json();
        if (confirmData.success) {
          push(`/order-success/${orderId}`);
        } else {
          setError(confirmData.message || 'Payment confirmation failed');
          setIsProcessing(false);
        }
      } else {
        setError('Payment was not completed');
        setIsProcessing(false);
      }
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message || 'An error occurred' : 'An error occurred');
      setIsProcessing(false);
    }
  };

  if (succeeded) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-heading text-green-500 mb-4">✓ Payment Successful</h2>
        <p className="text-gray-400 mb-6">Your payment has been processed successfully.</p>
        <p className="text-gray-500">Redirecting to order confirmation...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#FFFFFF',
                '::placeholder': {
                  color: '#9CA3AF',
                },
              },
              invalid: {
                color: '#EF4444',
              },
            },
          }}
        />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-brand-gold text-gray-900 font-semibold py-3 rounded-lg hover:bg-brand-gold-antique transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : 'Complete Payment'}
      </button>

      <p className="text-center text-gray-500 text-sm">
        Use card <code className="text-gray-300">4242 4242 4242 4242</code> (test) with any future date and CVC
      </p>
    </form>
  );
}

// Main page component
export default function StripePaymentPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('Order ID is missing');
      setLoading(false);
      return;
    }

    const initializePayment = async () => {
      try {
        const res = await fetch(
          'http://localhost:5000/api/payments/stripe/create-intent',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId }),
          }
        );

        const data = await res.json() as { clientSecret: string; message?: string };
        if (!res.ok) {
          throw new Error(data.message || 'Failed to initialize payment');
        }

        setClientSecret(data.clientSecret);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    initializePayment();
  }, [orderId]);

  if (loading) {
    return (
      <main className="min-h-screen">
        <Header />
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-center text-gray-400">Loading payment form...</p>
          </div>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen">
        <Header />
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg mb-4">
              {error}
            </div>
            <Link
              href="/checkout"
              className="inline-block px-6 py-3 bg-brand-gold text-gray-900 font-semibold rounded-md"
            >
              Back to Checkout
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (!clientSecret) {
    return (
      <main className="min-h-screen">
        <Header />
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-center text-red-400">Failed to initialize payment. Please try again.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Header />
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h1 className="text-2xl font-heading text-white mb-2">Complete Payment</h1>
            <p className="text-gray-400 mb-6">Enter your card details below to complete your purchase</p>

            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm orderId={orderId!} clientSecret={clientSecret} />
            </Elements>

            <Link
              href="/checkout"
              className="block text-center mt-4 text-brand-gold hover:underline text-sm"
            >
              Cancel Payment
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
