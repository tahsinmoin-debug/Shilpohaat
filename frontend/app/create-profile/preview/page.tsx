"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '../../components/Header';
import { useAuth } from '../../components/AuthProvider';

interface ProfileData {
  profilePicture: string;
  bio: string;
  name: string;
  portfolioImages: string[];
  availability?: 'available' | 'busy' | 'unavailable';
  specializations?: string[];
  artistStory?: string;
  skills?: string[];
  contactPhone?: string;
  website?: string;
  instagram?: string;
}

export default function ProfilePreviewPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Get profile data from sessionStorage
    const data = sessionStorage.getItem('profilePreview');
    if (data) {
      setProfileData(JSON.parse(data));
    } else {
      router.push('/create-profile');
    }
  }, [router]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!user) {
        alert('You must be logged in');
        setIsSaving(false);
        return;
      }

      console.log('Saving profile for user:', user.uid);
      console.log('Profile data:', profileData);

      const res = await fetch(`http://localhost:5000/api/artist/profile?firebaseUID=${user.uid}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Server response:', errorText);
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log('Profile saved successfully:', data);

      // Clear preview data
      sessionStorage.removeItem('profilePreview');
      
      // Force refresh auth context to get updated profile
      window.location.href = '/artist/dashboard';
    } catch (err: any) {
      console.error('Save error:', err);
      alert(`Failed to save profile: ${err.message}\n\nPlease ensure the backend server is running on port 5000.`);
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/create-profile');
  };

  if (!profileData) {
    return (
      <main>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-white text-lg">Loading preview...</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Header />
      <div className="min-h-screen py-12">
        {/* Preview Banner */}
        <div className="bg-brand-gold text-gray-900 py-3 px-4 text-center font-semibold mb-6">
          🔍 Profile Preview - This is how other users will see your profile
        </div>

        <div className="container mx-auto px-4 max-w-5xl">
          {/* Profile Header */}
          <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden mb-6">
            {/* Cover/Banner Area */}
            <div className="h-48 bg-gradient-to-r from-brand-maroon to-gray-900"></div>
            
            {/* Profile Info */}
            <div className="px-8 pb-8">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16 md:-mt-20">
                {/* Profile Picture */}
                <div className="relative">
                  {profileData.profilePicture ? (
                    <Image
                      src={profileData.profilePicture}
                      alt={profileData.bio}
                      width={160}
                      height={160}
                      className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-gray-800 object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-gray-800 bg-gray-700 flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  <div className={`absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-gray-800 ${
                    profileData.availability === 'available' ? 'bg-green-500' :
                    profileData.availability === 'busy' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`}></div>
                </div>

                {/* Name and Bio */}
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-heading text-white mb-2">
                    {profileData.bio || 'Artist Name'}
                  </h1>
                  <p className="text-brand-gold mb-3">
                    {profileData.specializations?.join(' • ') || 'Artist'}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      profileData.availability === 'available' ? 'bg-green-500/20 text-green-400' :
                      profileData.availability === 'busy' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {profileData.availability === 'available' ? '✓ Available for Commissions' :
                       profileData.availability === 'busy' ? '⏳ Currently Busy' : '✗ Not Available'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className="px-6 py-2 bg-brand-gold text-gray-900 font-semibold rounded-md hover:bg-brand-gold-antique transition-colors">
                    Follow
                  </button>
                  <button className="px-6 py-2 bg-gray-700 text-white font-semibold rounded-md hover:bg-gray-600 transition-colors">
                    Message
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Artist Story */}
              {profileData.artistStory && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-2xl font-heading text-white mb-4">Artist Story</h2>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {profileData.artistStory}
                  </p>
                </div>
              )}

              {/* Portfolio */}
              {profileData.portfolioImages.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-2xl font-heading text-white mb-4">Portfolio</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {profileData.portfolioImages.map((img: string, index: number) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden">
                        <Image
                          src={img}
                          alt={`Artwork ${index + 1}`}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Skills */}
              {profileData.skills && profileData.skills.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-xl font-heading text-white mb-4">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill: string) => (
                      <span key={skill} className="px-3 py-1 bg-gray-700 text-gray-200 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-heading text-white mb-4">Contact</h3>
                <div className="space-y-3">
                  {profileData.contactPhone && (
                    <div className="flex items-center gap-3 text-gray-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{profileData.contactPhone}</span>
                    </div>
                  )}
                  {profileData.website && (
                    <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-brand-gold hover:text-brand-gold-antique">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <span>Website</span>
                    </a>
                  )}
                  {profileData.instagram && (
                    <a href={`https://instagram.com/${profileData.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-brand-gold hover:text-brand-gold-antique">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      <span>{profileData.instagram}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleCancel}
                className="px-8 py-3 bg-gray-700 text-white font-semibold rounded-md hover:bg-gray-600 transition-colors"
              >
                ← Back to Edit
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-8 py-3 bg-brand-gold text-gray-900 font-semibold rounded-md hover:bg-brand-gold-antique transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : '✓ Confirm & Save Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
