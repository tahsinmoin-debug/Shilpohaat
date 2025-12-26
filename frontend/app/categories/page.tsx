"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';

interface Category {
  id: string;
  name: string;
  image: string;
  description: string;
  count: number;
}

// Category data with Cloudinary images
const CATEGORIES: Category[] = [
  {
    id: 'abstract',
    name: 'Abstract',
    image: 'https://res.cloudinary.com/dt0mwoirn/image/upload/v1765522371/shilpohaat/categories/abstract.jpg',
    description: 'Expressive and non-representational artworks',
    count: 0,
  },
  {
    id: 'landscape',
    name: 'Landscape',
    image: 'https://res.cloudinary.com/dt0mwoirn/image/upload/v1765522524/shilpohaat/categories/landscape.jpg',
    description: 'Nature scenes and outdoor environments',
    count: 0,
  },
  {
    id: 'portrait',
    name: 'Portrait',
    image: 'https://res.cloudinary.com/dt0mwoirn/image/upload/v1765522389/shilpohaat/categories/portrait.jpg',
    description: 'Human figures and character studies',
    count: 0,
  },
  {
    id: 'modern-art',
    name: 'Modern Art',
    image: 'https://res.cloudinary.com/dt0mwoirn/image/upload/v1765522390/shilpohaat/categories/modern-art.jpg',
    description: 'Contemporary artistic expressions',
    count: 0,
  },
  {
    id: 'traditional-art',
    name: 'Traditional Art',
    image: 'https://res.cloudinary.com/dt0mwoirn/image/upload/v1765522391/shilpohaat/categories/traditional-art.jpg',
    description: 'Classic and heritage artistic styles',
    count: 0,
  },
  {
    id: 'nature-wildlife',
    name: 'Nature & Wildlife',
    image: 'https://res.cloudinary.com/dt0mwoirn/image/upload/v1765522392/shilpohaat/categories/nature-wildlife.jpg',
    description: 'Animals and natural world subjects',
    count: 0,
  },
  {
    id: 'cityscape',
    name: 'Cityscape',
    image: 'https://res.cloudinary.com/dt0mwoirn/image/upload/v1765522394/shilpohaat/categories/cityscape.jpg',
    description: 'Urban environments and city scenes',
    count: 0,
  },
  {
    id: 'floral-art',
    name: 'Floral Art',
    image: 'https://res.cloudinary.com/dt0mwoirn/image/upload/v1765522395/shilpohaat/categories/floral-art.jpg',
    description: 'Flowers and botanical subjects',
    count: 0,
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    image: 'https://res.cloudinary.com/dt0mwoirn/image/upload/v1765522397/shilpohaat/categories/minimalist.jpg',
    description: 'Simple and refined artistic approach',
    count: 0,
  },
  {
    id: 'pop-art',
    name: 'Pop Art',
    image: 'https://res.cloudinary.com/dt0mwoirn/image/upload/v1765522398/shilpohaat/categories/pop-art.jpg',
    description: 'Bold, colorful, and popular culture art',
    count: 0,
  },
  {
    id: 'digital-art',
    name: 'Digital Art',
    image: 'https://res.cloudinary.com/dt0mwoirn/image/upload/v1765522400/shilpohaat/categories/digital-art.jpg',
    description: 'Computer-generated and digital creations',
    count: 0,
  },
  {
    id: 'acrylic',
    name: 'Acrylic',
    image: 'https://res.cloudinary.com/dt0mwoirn/image/upload/v1765522401/shilpohaat/categories/acrylic.jpg',
    description: 'Vibrant acrylic medium artworks',
    count: 0,
  },
  {
    id: 'oil',
    name: 'Oil',
    image: 'https://res.cloudinary.com/dt0mwoirn/image/upload/v1765522403/shilpohaat/categories/oil.jpg',
    description: 'Traditional oil painting masterpieces',
    count: 0,
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    image: 'https://res.cloudinary.com/dt0mwoirn/image/upload/v1765522404/shilpohaat/categories/watercolor.jpg',
    description: 'Delicate watercolor paintings',
    count: 0,
  },
  {
    id: 'mixed-media',
    name: 'Mixed Media',
    image: 'https://res.cloudinary.com/dt0mwoirn/image/upload/v1765522406/shilpohaat/categories/mixed-media.jpg',
    description: 'Combined materials and techniques',
    count: 0,
  },
];

export default function CategoriesPage() {
  const router = useRouter();
  const [categories] = useState<Category[]>(CATEGORIES);

  const handleCategoryClick = (categoryName: string) => {
    // Navigate to artworks page with category filter
    router.push(`/artworks?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="min-h-screen relative">
      <Header />

      {/* Hero Section */}
      <section className="text-white py-16 px-4 bg-[rgba(6,21,35,0.32)] backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Art Categories
          </h1>
          <p className="text-xl text-slate-300 mb-2">
            Explore diverse artistic styles and mediums
          </p>
          <p className="text-slate-400">
            Discover {categories.length} unique categories of extraordinary artwork
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 px-4 bg-[rgba(6,21,35,0.32)] backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto">
          {/* Style Categories */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-white mb-2">Artistic Styles</h2>
            <p className="text-gray-300 mb-12">Browse by creative approach and vision</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.slice(0, 10).map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category.name)}
                  className="group cursor-pointer"
                >
                  {/* Image Container */}
                  <div className="relative h-64 overflow-hidden rounded-lg bg-slate-200 mb-4">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e2e8f0' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' fill='%23475569' text-anchor='middle' dy='.3em'%3E${category.name}%3C/text%3E%3C/svg%3E`;
                      }}
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-slate-900 px-6 py-2 rounded-lg font-semibold hover:bg-slate-100">
                        View Collection
                      </button>
                    </div>
                  </div>

                  {/* Category Info */}
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-300 text-sm">{category.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Medium Categories */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Mediums</h2>
            <p className="text-gray-300 mb-12">Explore specific artistic materials and techniques</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.slice(10).map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category.name)}
                  className="group cursor-pointer"
                >
                  {/* Image Container */}
                  <div className="relative h-64 overflow-hidden rounded-lg bg-slate-200 mb-4">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e2e8f0' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' fill='%23475569' text-anchor='middle' dy='.3em'%3E${category.name}%3C/text%3E%3C/svg%3E`;
                      }}
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-slate-900 px-6 py-2 rounded-lg font-semibold hover:bg-slate-100">
                        View Collection
                      </button>
                    </div>
                  </div>

                  {/* Category Info */}
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-300 text-sm">{category.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-brand-maroon text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Can&apos;t find what you&apos;re looking for?</h2>
          <p className="text-slate-300 mb-8">
            Browse all artworks or discover featured collections
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/artworks')}
              className="bg-white text-slate-900 px-8 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
            >
              View All Artworks
            </button>
            <button
              onClick={() => router.push('/artists')}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-slate-900 transition-colors"
            >
              Discover Artists
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
