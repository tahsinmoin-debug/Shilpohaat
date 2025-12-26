"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import { useAuth } from '../components/AuthProvider';
import { API_BASE_URL } from '@/lib/config';

const STYLES = [
  'Abstract',
  'Landscape',
  'Portrait',
  'Modern Art',
  'Traditional Art',
  'Nature & Wildlife',
  'Cityscape',
  'Floral Art',
  'Minimalist',
  'Pop Art',
  'Digital Art',
  'Acrylic',
  'Oil',
  'Watercolor',
  'Mixed Media',
];

export default function RequestCommissionPage() {
  const router = useRouter();
  const { user, appUser, loading } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    style: '',
    budget: '',
    width: '',
    height: '',
    deadline: '',
  });

  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const authHeaders = () => ({ 'x-firebase-uid': user?.uid || '' });

  // Check if user is buyer
  if (!loading && (!user || appUser?.role !== 'buyer')) {
    return (
      <main>
        <Header />
        <div className="min-h-screen container mx-auto px-4 py-8">
          <div className="text-center text-red-400 py-8">
            <p>Only buyers can request custom commissions</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-6 py-2 bg-brand-gold text-black rounded hover:bg-yellow-400"
            >
              Go Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    setError('');

    try {
      const images: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(files[i]);
        });
        images.push(base64);
      }

      const res = await fetch(`${API_BASE_URL}/api/upload/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images,
          folder: 'shilpohaat/commissions',
        }),
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      setReferenceImages((prev) => [...prev, ...(data.urls || [])]);
      setSuccess(`${files.length} image(s) uploaded successfully`);
    } catch (err) {
      setError('Failed to upload images');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    if (!formData.title || !formData.style || !formData.budget) {
      setError('Please fill in all required fields');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/commissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          style: formData.style,
          budget: parseFloat(formData.budget),
          dimensions: formData.width || formData.height ? {
            width: formData.width ? parseFloat(formData.width) : undefined,
            height: formData.height ? parseFloat(formData.height) : undefined,
            unit: 'cm',
          } : undefined,
          referenceImages,
          deadline: formData.deadline || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to create commission request');
      }

      setSuccess('Commission request submitted successfully!');
      setTimeout(() => {
        router.push('/commissions');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <Header />
      <div className="min-h-screen container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-heading text-white mb-2">Request Custom Commission</h1>
          <p className="text-gray-400 mb-8">Describe your dream artwork and connect with talented artists</p>

          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded text-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-900/50 border border-green-700 rounded text-green-200">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Commission Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Portrait of my family"
                className="w-full px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-brand-gold focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your vision in detail..."
                rows={4}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-brand-gold focus:outline-none"
              />
            </div>

            {/* Style */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Art Style *
              </label>
              <select
                name="style"
                value={formData.style}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-brand-gold focus:outline-none"
              >
                <option value="">Select a style</option>
                {STYLES.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Budget (৳) *
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                placeholder="e.g., 5000"
                min="0"
                step="1000"
                className="w-full px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-brand-gold focus:outline-none"
              />
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-semibold mb-2">
                  Width (cm)
                </label>
                <input
                  type="number"
                  name="width"
                  value={formData.width}
                  onChange={handleInputChange}
                  placeholder="e.g., 50"
                  min="0"
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-brand-gold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">
                  Height (cm)
                </label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  placeholder="e.g., 70"
                  min="0"
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-brand-gold focus:outline-none"
                />
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Preferred Deadline
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-brand-gold focus:outline-none"
              />
            </div>

            {/* Reference Images */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Reference Images
              </label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-brand-gold transition"
                onClick={() => fileInputRef.current?.click()}
              >
                <p className="text-gray-400 mb-2">Click to upload reference images</p>
                <p className="text-gray-500 text-sm">PNG, JPG up to 10MB each</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {referenceImages.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {referenceImages.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={img}
                        alt={`Reference ${idx}`}
                        className="w-full h-32 object-cover rounded border border-gray-700"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-700 text-white px-2 py-1 rounded text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting || uploading}
                className="flex-1 px-6 py-3 bg-brand-gold text-black font-semibold rounded hover:bg-yellow-400 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Commission Request'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
