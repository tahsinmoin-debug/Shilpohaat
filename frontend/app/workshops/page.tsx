"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

interface Workshop {
  _id: string;
  title: string;
  description: string;
  category: string;
  skillLevel: string;
  type: 'recorded' | 'live';
  thumbnail: string;
  price: number;
  currency: string;
  instructor: {
    _id: string;
    name: string;
  };
  enrollmentCount: number;
  averageRating: number;
  totalReviews: number;
  scheduledAt?: string;
}

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    skillLevel: '',
    type: '',
    search: ''
  });

  useEffect(() => {
    fetchWorkshops();
  }, [filters]);

  const fetchWorkshops = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.skillLevel) params.append('skillLevel', filters.skillLevel);
      if (filters.type) params.append('type', filters.type);
      if (filters.search) params.append('search', filters.search);

      const res = await fetch(`http://localhost:5000/api/workshops?${params.toString()}`);
      const data = await res.json();
      
      if (data.success) {
        setWorkshops(data.workshops);
      }
    } catch (error) {
      console.error('Failed to fetch workshops:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Painting', 'Sculpture', 'Crafts', 'Textile', 'Digital Art', 'Photography', 'Other'];
  const skillLevels = ['Beginner', 'Intermediate', 'Advanced'];

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-maroon to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-heading text-white mb-4">Art Workshops & Tutorials</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Learn from experienced artists. Master new techniques. Create beautiful art.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search workshops..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-gold outline-none"
            />

            {/* Category */}
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-gold outline-none"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Skill Level */}
            <select
              value={filters.skillLevel}
              onChange={(e) => setFilters({ ...filters, skillLevel: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-gold outline-none"
            >
              <option value="">All Levels</option>
              {skillLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>

            {/* Type */}
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-gold outline-none"
            >
              <option value="">All Types</option>
              <option value="recorded">Recorded</option>
              <option value="live">Live</option>
            </select>
          </div>
        </div>

        {/* Workshops Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold mx-auto"></div>
            <p className="text-white mt-4">Loading workshops...</p>
          </div>
        ) : workshops.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No workshops found matching your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workshops.map((workshop) => (
              <Link
                key={workshop._id}
                href={`/workshops/${workshop._id}`}
                className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-2xl transition-shadow group border border-gray-700"
              >
                {/* Thumbnail */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={workshop.thumbnail}
                    alt={workshop.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Badge */}
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-brand-gold text-xs font-bold uppercase">
                      {workshop.type === 'live' ? '🔴 Live' : '📹 Recorded'}
                    </span>
                  </div>
                  {/* Price Badge */}
                  <div className="absolute top-3 left-3 bg-brand-gold text-gray-900 px-3 py-1 rounded-full">
                    <span className="text-sm font-bold">
                      {workshop.price === 0 ? 'FREE' : `৳${workshop.price}`}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Category & Level */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                      {workshop.category}
                    </span>
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                      {workshop.skillLevel}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-heading text-white mb-2 line-clamp-2 group-hover:text-brand-gold transition-colors">
                    {workshop.title}
                  </h3>

                  {/* Instructor */}
                  <p className="text-gray-400 text-sm mb-3">
                    by {workshop.instructor.name}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      {/* Rating */}
                      {workshop.totalReviews > 0 && (
                        <div className="flex items-center gap-1 text-brand-gold">
                          ⭐ {workshop.averageRating.toFixed(1)}
                          <span className="text-gray-500">({workshop.totalReviews})</span>
                        </div>
                      )}
                      {/* Students */}
                      <div className="text-gray-400">
                        👥 {workshop.enrollmentCount}
                      </div>
                    </div>
                  </div>

                  {/* Live Session Date */}
                  {workshop.type === 'live' && workshop.scheduledAt && (
                    <div className="mt-3 text-sm text-gray-400">
                      📅 {new Date(workshop.scheduledAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}