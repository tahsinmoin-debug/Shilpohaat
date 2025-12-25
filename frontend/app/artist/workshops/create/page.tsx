"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import Header from '@/app/components/Header';

interface Lesson {
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  order: number;
}

interface Material {
  item: string;
  description: string;
  optional: boolean;
}

export default function CreateWorkshopPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Multi-step form

  // Basic Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [skillLevel, setSkillLevel] = useState('Beginner');
  const [type, setType] = useState<'recorded' | 'live'>('recorded');
  const [thumbnail, setThumbnail] = useState('');
  const [price, setPrice] = useState(0);

  // For Recorded Workshops
  const [lessons, setLessons] = useState<Lesson[]>([]);

  // For Live Workshops
  const [liveSessionUrl, setLiveSessionUrl] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState(60);

  // Materials
  const [materials, setMaterials] = useState<Material[]>([]);

  const categories = ['Painting', 'Sculpture', 'Crafts', 'Textile', 'Digital Art', 'Photography', 'Other'];

  const addLesson = () => {
    setLessons([
      ...lessons,
      {
        title: '',
        description: '',
        videoUrl: '',
        duration: 0,
        order: lessons.length + 1
      }
    ]);
  };

  const updateLesson = (index: number, field: keyof Lesson, value: any) => {
    const updated = [...lessons];
    updated[index] = { ...updated[index], [field]: value };
    setLessons(updated);
  };

  const removeLesson = (index: number) => {
    setLessons(lessons.filter((_, i) => i !== index));
  };

  const addMaterial = () => {
    setMaterials([
      ...materials,
      { item: '', description: '', optional: false }
    ]);
  };

  const updateMaterial = (index: number, field: keyof Material, value: any) => {
    const updated = [...materials];
    updated[index] = { ...updated[index], [field]: value };
    setMaterials(updated);
  };

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnail(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (submitForApproval: boolean = false) => {
    const user = auth.currentUser;
    if (!user) {
      alert('Please login first');
      router.push('/login');
      return;
    }

    // Validation
    if (!title.trim() || !description.trim() || !thumbnail || !category) {
      alert('Please fill all required fields: title, description, thumbnail, and category');
      return;
    }

    if (type === 'recorded' && lessons.length === 0) {
      alert('Please add at least one lesson for recorded workshops');
      return;
    }

    if (type === 'live' && !scheduledAt) {
      alert('Please set a scheduled date/time for live workshops');
      return;
    }

    setLoading(true);
    try {
      const workshopData = {
        title,
        description,
        category,
        skillLevel,
        type,
        thumbnail,
        price,
        lessons: type === 'recorded' ? lessons : undefined,
        liveSessionUrl: type === 'live' ? liveSessionUrl : undefined,
        scheduledAt: type === 'live' ? scheduledAt : undefined,
        duration: type === 'live' ? duration : undefined,
        requiredMaterials: materials.filter(m => m.item.trim()),
        status: 'draft'
      };

      // Create workshop
      const res = await fetch(
        `http://localhost:5000/api/workshops/create?firebaseUID=${user.uid}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(workshopData)
        }
      );

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to create workshop');
      }

      // If submit for approval
      if (submitForApproval) {
        const submitRes = await fetch(
          `http://localhost:5000/api/workshops/${data.workshop._id}/submit?firebaseUID=${user.uid}`,
          { method: 'POST' }
        );

        const submitData = await submitRes.json();

        if (submitData.success) {
          alert('Workshop created and submitted for approval!');
        } else {
          alert('Workshop created as draft. You can submit it later.');
        }
      } else {
        alert('Workshop saved as draft!');
      }

      router.push('/artist/workshops');
    } catch (error: any) {
      console.error('Create workshop error:', error);
      alert(error.message || 'Failed to create workshop');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-maroon to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-heading text-white mb-8">Create New Workshop</h1>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= s ? 'bg-brand-gold text-gray-900' : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-brand-gold' : 'bg-gray-700'}`}></div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-heading text-white mb-4">Basic Information</h2>

                {/* Title */}
                <div>
                  <label className="block text-gray-400 mb-2">Workshop Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Mastering Watercolor Landscapes"
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-gold outline-none"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-400 mb-2">Description *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what students will learn..."
                    rows={6}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-gold outline-none resize-none"
                    required
                  />
                </div>

                {/* Category & Skill Level */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-2">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-gold outline-none"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-2">Skill Level *</label>
                    <select
                      value={skillLevel}
                      onChange={(e) => setSkillLevel(e.target.value)}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-gold outline-none"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                {/* Type & Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-2">Workshop Type *</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as 'recorded' | 'live')}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-gold outline-none"
                    >
                      <option value="recorded">📹 Recorded (Multiple Lessons)</option>
                      <option value="live">🔴 Live Session</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-2">Price (৳) *</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      min="0"
                      placeholder="0 for free"
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-gold outline-none"
                    />
                  </div>
                </div>

                {/* Thumbnail */}
                <div>
                  <label className="block text-gray-400 mb-2">Thumbnail Image *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-gold outline-none"
                  />
                  {thumbnail && (
                    <img
                      src={thumbnail}
                      alt="Thumbnail preview"
                      className="mt-4 w-full h-48 object-cover rounded-lg"
                    />
                  )}
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-brand-gold text-gray-900 py-3 rounded-lg font-bold hover:bg-yellow-500"
                >
                  Next: Content →
                </button>
              </div>
            )}

            {/* Step 2: Content */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-heading text-white mb-4">
                  {type === 'recorded' ? 'Lessons' : 'Live Session Details'}
                </h2>

                {type === 'recorded' ? (
                  <>
                    {lessons.map((lesson, index) => (
                      <div key={index} className="bg-gray-700/50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <h3 className="text-white font-semibold">Lesson {index + 1}</h3>
                          <button
                            onClick={() => removeLesson(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>

                        <input
                          type="text"
                          value={lesson.title}
                          onChange={(e) => updateLesson(index, 'title', e.target.value)}
                          placeholder="Lesson title"
                          className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-gold outline-none"
                        />

                        <textarea
                          value={lesson.description}
                          onChange={(e) => updateLesson(index, 'description', e.target.value)}
                          placeholder="Lesson description"
                          rows={2}
                          className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-gold outline-none resize-none"
                        />

                        <input
                          type="url"
                          value={lesson.videoUrl}
                          onChange={(e) => updateLesson(index, 'videoUrl', e.target.value)}
                          placeholder="Video URL (YouTube, Vimeo, etc.)"
                          className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-gold outline-none"
                        />

                        <input
                          type="number"
                          value={lesson.duration}
                          onChange={(e) => updateLesson(index, 'duration', Number(e.target.value))}
                          placeholder="Duration (minutes)"
                          min="0"
                          className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-gold outline-none"
                        />
                      </div>
                    ))}

                    <button
                      onClick={addLesson}
                      className="w-full bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600"
                    >
                      + Add Lesson
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-gray-400 mb-2">Live Session URL (Zoom/Meet Link)</label>
                      <input
                        type="url"
                        value={liveSessionUrl}
                        onChange={(e) => setLiveSessionUrl(e.target.value)}
                        placeholder="https://zoom.us/j/..."
                        className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-gold outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 mb-2">Scheduled Date & Time *</label>
                      <input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-gold outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 mb-2">Duration (minutes)</label>
                      <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        min="15"
                        className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-gold outline-none"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 bg-brand-gold text-gray-900 py-3 rounded-lg font-bold hover:bg-yellow-500"
                  >
                    Next: Materials →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Materials & Submit */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-heading text-white mb-4">Required Materials (Optional)</h2>

                {materials.map((material, index) => (
                  <div key={index} className="bg-gray-700/50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-white font-semibold">Material {index + 1}</h3>
                      <button
                        onClick={() => removeMaterial(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>

                    <input
                      type="text"
                      value={material.item}
                      onChange={(e) => updateMaterial(index, 'item', e.target.value)}
                      placeholder="Item name (e.g., Watercolor paints)"
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-gold outline-none"
                    />

                    <input
                      type="text"
                      value={material.description}
                      onChange={(e) => updateMaterial(index, 'description', e.target.value)}
                      placeholder="Description (e.g., Any brand, 12 colors minimum)"
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-gold outline-none"
                    />

                    <label className="flex items-center gap-2 text-gray-300">
                      <input
                        type="checkbox"
                        checked={material.optional}
                        onChange={(e) => updateMaterial(index, 'optional', e.target.checked)}
                        className="rounded"
                      />
                      This is optional
                    </label>
                  </div>
                ))}

                <button
                  onClick={addMaterial}
                  className="w-full bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600"
                >
                  + Add Material
                </button>

                <div className="border-t border-gray-700 pt-6 mt-6">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => handleSubmit(false)}
                      disabled={loading}
                      className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-500 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save as Draft'}
                    </button>
                    <button
                      onClick={() => handleSubmit(true)}
                      disabled={loading}
                      className="flex-1 bg-brand-gold text-gray-900 py-3 rounded-lg font-bold hover:bg-yellow-500 disabled:opacity-50"
                    >
                      {loading ? 'Submitting...' : 'Submit for Approval'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}