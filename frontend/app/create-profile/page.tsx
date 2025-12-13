"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import { useAuth } from '../components/AuthProvider';

const SPECIALIZATIONS = [
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

const SKILLS = [
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

export default function CreateProfilePage() {
  const router = useRouter();
  const { user, appUser, loading } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    bio: '',
    artistStory: '',
    specializations: [] as string[],
    skills: [] as string[],
    contactPhone: '',
    website: '',
    instagram: '',
    profilePicture: '',
    portfolioImages: [] as string[],
    availability: 'available',
  });

  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  const [portfolioPreviews, setPortfolioPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (appUser && appUser.role !== 'artist') {
        router.push('/');
        return;
      }
      // If profile already complete, redirect to dashboard
      if (appUser?.artistProfile?.isProfileComplete) {
        router.push('/artist/dashboard');
      }
    }
  }, [user, appUser, loading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckboxChange = (category: 'specializations' | 'skills', value: string) => {
    const current = formData[category];
    if (current.includes(value)) {
      setFormData({
        ...formData,
        [category]: current.filter((item) => item !== value),
      });
    } else {
      setFormData({
        ...formData,
        [category]: [...current, value],
      });
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, convert to base64 data URL (in production, upload to Cloudinary)
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfilePicturePreview(result);
        setFormData({ ...formData, profilePicture: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePortfolioImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            setPortfolioPreviews([...portfolioPreviews, ...newPreviews]);
            setFormData({
              ...formData,
              portfolioImages: [...formData.portfolioImages, ...newImages],
            });
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePortfolioImage = (index: number) => {
    setPortfolioPreviews(portfolioPreviews.filter((_, i) => i !== index));
    setFormData({
      ...formData,
      portfolioImages: formData.portfolioImages.filter((_, i) => i !== index),
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

      // Validate required fields
      if (!formData.bio || formData.specializations.length === 0 || !formData.artistStory) {
        setError('Please fill in all required fields (Bio, Specializations, Artist Story)');
        setIsSubmitting(false);
        return;
      }

      // Save to sessionStorage for preview
      sessionStorage.setItem('profilePreview', JSON.stringify(formData));

      // Redirect to preview page
      router.push('/create-profile/preview');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-white text-lg">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Header />
      <div className="min-h-screen container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-heading text-white mb-2 text-center">
            Create Your Artist Profile
          </h1>
          <p className="text-gray-300 text-center mb-8">
            Build a compelling profile to showcase your work and attract art lovers
          </p>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Brand Logo / Profile Picture */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Brand Logo / Profile Picture
              </label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                {profilePicturePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={profilePicturePreview}
                      alt="Profile preview"
                      className="w-32 h-32 rounded-full object-cover mx-auto"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setProfilePicturePreview('');
                        setFormData({ ...formData, profilePicture: '' });
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                      id="profilePicture"
                    />
                    <label
                      htmlFor="profilePicture"
                      className="cursor-pointer text-gray-400 hover:text-gray-300"
                    >
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p>Drag & drop a cover photo or click to upload</p>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* About You Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-200 mb-2">
                  Full Name / Artist Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  placeholder="e.g., Fatima Rahman"
                />
              </div>

              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-200 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  placeholder="+880 1712-345678"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Specializations <span className="text-red-500">*</span>
                </label>
                <div className="bg-gray-700 rounded-md p-4 max-h-48 overflow-y-auto space-y-2">
                  {SPECIALIZATIONS.map((spec) => (
                    <label key={spec} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.specializations.includes(spec)}
                        onChange={() => handleCheckboxChange('specializations', spec)}
                        className="w-4 h-4 text-brand-gold focus:ring-brand-gold rounded"
                      />
                      <span className="ml-2 text-gray-200">{spec}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="availability" className="block text-sm font-medium text-gray-200 mb-2">
                  Availability
                </label>
                <select
                  id="availability"
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
                >
                  <option value="available">Available for Commissions</option>
                  <option value="busy">Busy</option>
                  <option value="unavailable">Not Available</option>
                </select>
              </div>
            </div>

            {/* Artist Story */}
            <div>
              <label htmlFor="artistStory" className="block text-sm font-medium text-gray-200 mb-2">
                Artist Story <span className="text-red-500">*</span>
              </label>
              <textarea
                id="artistStory"
                name="artistStory"
                value={formData.artistStory}
                onChange={handleInputChange}
                required
                rows={5}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
                placeholder="Tell your story: What inspires you? How did you start? What makes your art unique?"
              />
            </div>

            {/* Your Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Your Skills
              </label>
              <div className="bg-gray-700 rounded-md p-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                {SKILLS.map((skill) => (
                  <label key={skill} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.skills.includes(skill)}
                      onChange={() => handleCheckboxChange('skills', skill)}
                      className="w-4 h-4 text-brand-gold focus:ring-brand-gold rounded"
                    />
                    <span className="ml-2 text-gray-200 text-sm">{skill}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Your Portfolio */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Your Portfolio
              </label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePortfolioImagesChange}
                  className="hidden"
                  id="portfolioImages"
                />
                <label
                  htmlFor="portfolioImages"
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
                  <p>Drag & drop your artwork here</p>
                  <p className="text-sm text-gray-500">Upload up to 10 images</p>
                </label>

                {portfolioPreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {portfolioPreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Portfolio ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removePortfolioImage(index)}
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

            {/* Social Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-200 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div>
                <label htmlFor="instagram" className="block text-sm font-medium text-gray-200 mb-2">
                  Instagram
                </label>
                <input
                  type="text"
                  id="instagram"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  placeholder="@yourhandle"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-brand-gold text-gray-900 font-semibold rounded-md hover:bg-brand-gold-antique transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Loading Preview...' : 'Preview Profile →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
