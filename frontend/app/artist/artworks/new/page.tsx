"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import { API_BASE_URL } from '@/lib/config';
import { useAuth } from '../../../components/AuthProvider';

const CATEGORIES = [
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

const MATERIALS = [
  'Oil',
  'Acrylic',
  'Watercolor',
  'Canvas',
  'Paper',
  'Mixed Media',
];

export default function UploadArtworkPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Abstract',
    price: '',
    images: [] as string[],
    dimensions: {
      width: '',
      height: '',
      depth: '',
      unit: 'cm',
    },
    materials: [] as string[],
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      dimensions: {
        ...formData.dimensions,
        [e.target.name]: e.target.value,
      },
    });
  };

  const handleMaterialToggle = (material: string) => {
    if (formData.materials.includes(material)) {
      setFormData({
        ...formData,
        materials: formData.materials.filter((m) => m !== material),
      });
    } else {
      setFormData({
        ...formData,
        materials: [...formData.materials, material],
      });
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPreviews: string[] = [];
      const newImages: string[] = [];
      let filesProcessed = 0;

      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          newPreviews.push(result);
          newImages.push(result);
          filesProcessed++;

          if (filesProcessed === files.length) {
            setImagePreviews([...imagePreviews, ...newPreviews]);
            setFormData({
              ...formData,
              images: [...formData.images, ...newImages],
            });
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!user) {
        setError('You must be logged in');
        setIsSubmitting(false);
        return;
      }

      if (!formData.title || !formData.price || formData.images.length === 0) {
        setError('Please fill in title, price, and upload at least one image');
        setIsSubmitting(false);
        return;
      }

      const artworkData = {
        ...formData,
        price: Number(formData.price),
        dimensions: {
          width: formData.dimensions.width ? Number(formData.dimensions.width) : undefined,
          height: formData.dimensions.height ? Number(formData.dimensions.height) : undefined,
          depth: formData.dimensions.depth ? Number(formData.dimensions.depth) : undefined,
          unit: formData.dimensions.unit,
        },
      };

      const res = await fetch(`${API_BASE_URL}/api/artworks?firebaseUID=${user.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(artworkData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to upload artwork');
      }

      alert('Artwork uploaded successfully!');
      router.push('/artist/dashboard');
    } catch (err: Error | unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to upload artwork');
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <Header />
      <div className="min-h-screen container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-heading text-white mb-2 text-center">
            Upload New Artwork
          </h1>
          <p className="text-gray-300 text-center mb-8">
            Share your creation with art lovers around the world
          </p>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-200 mb-2">
                Artwork Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
                placeholder="e.g., Sunset Over Padma River"
              />
            </div>

            {/* Category and Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-200 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-200 mb-2">
                  Price (৳) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  placeholder="15000"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-200 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
                placeholder="Describe your artwork, inspiration, techniques used..."
              />
            </div>

            {/* Dimensions */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Dimensions
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <input
                  type="number"
                  name="width"
                  value={formData.dimensions.width}
                  onChange={handleDimensionChange}
                  placeholder="Width"
                  className="px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
                <input
                  type="number"
                  name="height"
                  value={formData.dimensions.height}
                  onChange={handleDimensionChange}
                  placeholder="Height"
                  className="px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
                <input
                  type="number"
                  name="depth"
                  value={formData.dimensions.depth}
                  onChange={handleDimensionChange}
                  placeholder="Depth"
                  className="px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
                <select
                  name="unit"
                  value={formData.dimensions.unit}
                  onChange={handleDimensionChange}
                  className="px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
                >
                  <option value="cm">cm</option>
                  <option value="in">in</option>
                  <option value="m">m</option>
                </select>
              </div>
            </div>

            {/* Materials */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Materials Used
              </label>
              <div className="bg-gray-700 rounded-md p-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                {MATERIALS.map((material) => (
                  <label key={material} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.materials.includes(material)}
                      onChange={() => handleMaterialToggle(material)}
                      className="w-4 h-4 text-brand-gold focus:ring-brand-gold rounded"
                    />
                    <span className="ml-2 text-gray-200 text-sm">{material}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Artwork Images */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Artwork Images <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesChange}
                  className="hidden"
                  id="artworkImages"
                />
                <label
                  htmlFor="artworkImages"
                  className="cursor-pointer text-center block text-gray-400 hover:text-gray-300"
                >
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p>Click to upload artwork images</p>
                  <p className="text-sm text-gray-500">Upload multiple angles or details</p>
                </label>

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Artwork ${index + 1}`}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-brand-gold text-gray-900 font-semibold rounded-md hover:bg-brand-gold-antique transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Uploading...' : 'Upload Artwork'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
