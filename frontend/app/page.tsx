'use client';

import React from 'react';
import Link from 'next/link';
import Header from './components/Header';
import FeaturedArtists from './components/FeaturedArtists';
import CloudinaryResponsiveImage from './components/CloudinaryResponsiveImage';
import { useI18n } from './components/LanguageProvider';
import { motion } from 'framer-motion';

// Add this interface at the top after imports
interface Artwork {
  _id: string;
  title: string;
  description?: string;
  category: string;
  price: number;
  images: string[];
  artist?: {
    _id: string;
    name: string;
  };
}


// HERO COMPONENT
function Hero() {
  // Keep the hero headline in Bengali regardless of language selection
  const headingBn = 'প্রতিটি তুলির টানে, একটি নতুন গল্প';
  const subheadingBn = 'বাংলাদেশের স্থানীয় শিল্পীদের অসাধারণ সৃজনশীলতা আবিষ্কার করুন';
  return (
    <section className="relative h-[560px] sm:h-[620px] md:h-[680px] w-full overflow-hidden">
      {/* Softer overlay so the artwork stays visible */}
      <div className="absolute inset-0 bg-[rgba(6,21,35,0.28)] backdrop-blur-[1.5px]"></div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex items-center justify-center">
        <div className="max-w-4xl text-center rounded-2xl border border-white/20 bg-[rgba(6,21,35,0.34)] px-4 py-8 sm:px-6 sm:py-10 md:px-10 md:py-14 shadow-2xl backdrop-blur-sm">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-sans inline-flex items-center gap-2 text-xs md:text-sm uppercase tracking-[0.18em] text-brand-gold mb-5 font-semibold"
          >
            Crafted in Bangladesh
          </motion.p>

          {/* Heading - Bold & Emotional */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-heading text-4xl md:text-6xl lg:text-7xl text-white font-bold mb-5 md:mb-6 leading-tight tracking-tight drop-shadow-2xl"
          >
            {headingBn}
          </motion.h1>

          {/* Subheadline - Cleaner & Shorter */}
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="font-sans text-base md:text-xl text-gray-100 mb-8 md:mb-10 leading-relaxed max-w-2xl mx-auto drop-shadow-lg"
          >
            {subheadingBn}
          </motion.p>

          {/* Single Primary CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/artworks"
              className="font-sans inline-flex items-center justify-center px-10 md:px-12 py-3.5 bg-brand-gold text-[#0b1926] font-extrabold rounded-lg hover:bg-brand-gold-antique hover:scale-105 transition-all duration-300 text-center shadow-2xl text-base md:text-lg ring-2 ring-white/10"
            >
              Explore Artworks
            </Link>
            <Link
              href="/artists"
              className="font-sans inline-block px-10 md:px-12 py-3.5 bg-transparent text-white font-semibold rounded-lg border-2 border-white/80 hover:bg-white/10 hover:border-white transition-all duration-300 text-center text-base md:text-lg"
            >
              Meet the Artists
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
            className="mt-6 hidden sm:grid grid-cols-3 gap-3 text-left"
          >
            <div className="rounded-lg border border-white/15 bg-[rgba(11,36,56,0.55)] px-4 py-3">
              <p className="text-brand-gold text-sm font-semibold">500+ Artworks</p>
              <p className="text-gray-200 text-sm">Curated originals</p>
            </div>
            <div className="rounded-lg border border-white/15 bg-[rgba(11,36,56,0.55)] px-4 py-3">
              <p className="text-brand-gold text-sm font-semibold">Local Artists</p>
              <p className="text-gray-200 text-sm">Across Bangladesh</p>
            </div>
            <div className="rounded-lg border border-white/15 bg-[rgba(11,36,56,0.55)] px-4 py-3">
              <p className="text-brand-gold text-sm font-semibold">Secure Checkout</p>
              <p className="text-gray-200 text-sm">Trusted transactions</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// FEATURED ARTWORKS COMPONENT

import { API_BASE_URL } from '@/lib/config';

function FeaturedArtworks() {
  const [artworks, setArtworks] = React.useState<Artwork[]>([]); // ← Fixed type
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchFeaturedArtworks = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/artworks?featured=true&limit=4&fields=card&thumbnailOnly=true&includeArtistProfile=false`);
        const data = await res.json();
        setArtworks(data.artworks || []);
      } catch (error) {
        console.error('Failed to fetch featured artworks:', error);
        setArtworks([]);
      } finally {
        setLoading(false);
      }
    };


    fetchFeaturedArtworks();
  }, []);

  if (loading) {
    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block h-12 w-12 border-4 border-brand-gold border-t-transparent rounded-full"
          ></motion.div>
        </div>
      </section>
    );
  }

  if (artworks.length === 0) {
    return null; // Don't show section if no featured artworks
  }

  return (
    <section className="py-12 md:py-20 bg-[rgba(6,21,35,0.32)] backdrop-blur-sm border-t border-b border-white/10">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-heading text-4xl md:text-5xl text-white text-center mb-3"
        >
          Featured Artworks
        </motion.h2>
        
        {/* Subheadline */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-sans text-gray-300 text-center mb-12 max-w-xl mx-auto text-lg"
        >
          Discover stunning pieces from talented artists
        </motion.p>

        {/* Artworks Grid - Show 6 max */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 max-w-6xl mx-auto">
          {artworks.slice(0, 6).map((artwork, index) => (
            <motion.div
              key={artwork._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                href={`/artworks/${artwork._id}`}
                className="glass-card rounded-xl overflow-hidden hover:shadow-2xl group block"
              >
                {/* Artwork Image with AR Badge */}
                <div className="relative h-72 sm:h-[320px] w-full overflow-hidden">
                  <CloudinaryResponsiveImage
                    src={artwork.images?.[0] || 'https://placehold.co/400x400/555/FFF.png'}
                    alt={artwork.title}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    widths={[320, 480, 640, 800]}
                  />
                  {/* AR Badge */}
                  {artwork.category && (
                    <div className="absolute top-3 right-3 bg-brand-gold/95 text-gray-900 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l1.5 4.5L18 8l-3 3 .7 4.5L12 13l-3.7 2.5L9 11 6 8l4.5-1.5L12 2z" />
                      </svg>
                      Spotlight
                    </div>
                  )}
                </div>
                
                {/* Artwork Info */}
                <div className="p-5">
                  <h3 className="font-heading text-xl text-white mb-2 group-hover:text-brand-gold transition-colors line-clamp-1">
                    {artwork.title}
                  </h3>
                  <p className="font-sans text-gray-400 text-sm mb-3 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {artwork.artist?.name || 'Unknown Artist'}
                  </p>
                  <p className="font-sans text-brand-gold font-bold text-2xl mb-4">
                    ৳{artwork.price?.toLocaleString()}
                  </p>
                  
                  <div className="w-full bg-brand-gold text-[#0b1926] font-bold py-3 px-4 rounded-lg hover:bg-brand-gold-antique transition-colors shadow-lg text-center">
                    View Details
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link
            href="/artworks"
            className="inline-block px-8 py-3 bg-transparent text-white font-semibold rounded-lg border-2 border-brand-gold hover:bg-brand-gold hover:text-gray-900 transition-all duration-300"
          >
            View All Artworks
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// CATEGORIES SHOWCASE
interface CategoryTile { id: string; name: string; image: string; }
const HOMEPAGE_CATEGORIES: CategoryTile[] = [
  { id: 'Abstract', name: 'Abstract', image: 'https://res.cloudinary.com/dt0mwoirn/image/upload/v1765522371/shilpohaat/categories/abstract.jpg' },
  { id: 'Landscape', name: 'Landscape', image: 'https://res.cloudinary.com/dt0mwoirn/image/upload/v1765522524/shilpohaat/categories/landscape.jpg' },
  { id: 'Portrait', name: 'Portrait', image: 'https://res.cloudinary.com/dt0mwoirn/image/upload/v1765522389/shilpohaat/categories/portrait.jpg' },
  { id: 'Modern Art', name: 'Modern Art', image: 'https://res.cloudinary.com/dt0mwoirn/image/upload/v1765522390/shilpohaat/categories/modern-art.jpg' },
  { id: 'Traditional Art', name: 'Traditional Art', image: 'https://res.cloudinary.com/dt0mwoirn/image/upload/v1765522391/shilpohaat/categories/traditional-art.jpg' },
  { id: 'Watercolor', name: 'Watercolor', image: 'https://res.cloudinary.com/dt0mwoirn/image/upload/v1765522404/shilpohaat/categories/watercolor.jpg' },
];

function CategoriesShowcase() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [visibleCount, setVisibleCount] = React.useState(3);
  const [isPaused, setIsPaused] = React.useState(false);
  const touchStartXRef = React.useRef<number | null>(null);
  const touchDeltaXRef = React.useRef(0);
  const total = HOMEPAGE_CATEGORIES.length;
  const maxIndex = Math.max(0, total - visibleCount);

  const goNext = React.useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const goPrev = React.useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  React.useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 768) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  React.useEffect(() => {
    setCurrentIndex(0);
  }, [visibleCount]);

  React.useEffect(() => {
    if (total <= visibleCount) return;
    if (isPaused) return;

    const intervalId = setInterval(() => {
      goNext();
    }, 3200);

    return () => clearInterval(intervalId);
  }, [goNext, isPaused, total, visibleCount]);

  const cardBasis = visibleCount === 1 ? '100%' : visibleCount === 2 ? '50%' : '33.3333%';

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchDeltaXRef.current = 0;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null) return;
    touchDeltaXRef.current = e.touches[0].clientX - touchStartXRef.current;
  };

  const handleTouchEnd = () => {
    const threshold = 50;
    if (Math.abs(touchDeltaXRef.current) > threshold) {
      if (touchDeltaXRef.current < 0) {
        goNext();
      } else {
        goPrev();
      }
    }
    touchStartXRef.current = null;
    touchDeltaXRef.current = 0;
    setIsPaused(false);
  };

  return (
    <section className="py-14 md:py-20 bg-[rgba(6,21,35,0.34)] backdrop-blur-sm border-t border-b border-white/10">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-4xl md:text-5xl text-white mb-3">Browse by Category</h2>
          <p className="font-sans text-gray-300 max-w-xl mx-auto">Find artworks by style and medium</p>
        </motion.div>

        <div
          className="max-w-6xl mx-auto overflow-hidden touch-pan-y"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <motion.div
            animate={{ x: `-${(currentIndex * 100) / visibleCount}%` }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex -mx-2"
          >
            {HOMEPAGE_CATEGORIES.map((cat) => (
              <div key={cat.id} className="shrink-0 px-2" style={{ flexBasis: cardBasis }}>
                <Link href={`/artworks?category=${encodeURIComponent(cat.name)}`} className="group rounded-xl overflow-hidden relative block">
                  <div className="h-48 sm:h-56 w-full overflow-hidden">
                    <CloudinaryResponsiveImage
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      widths={[320, 480, 640, 960]}
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute inset-x-0 bottom-0 p-5 flex items-center justify-between">
                    <h3 className="text-white font-heading text-xl">{cat.name}</h3>
                    <span className="px-4 py-1.5 bg-brand-gold text-gray-900 text-sm font-semibold rounded-full group-hover:scale-110 transition-transform">Browse</span>
                  </div>
                </Link>
              </div>
            ))}
          </motion.div>
        </div>

        {maxIndex > 0 && (
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to category slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all ${idx === currentIndex ? 'w-8 bg-brand-gold' : 'w-2 bg-white/40 hover:bg-white/70'}`}
              />
            ))}
          </div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-10"
        >
          <Link href="/categories" className="inline-block px-8 py-3 border-2 border-brand-gold text-white rounded-lg hover:bg-brand-gold hover:text-gray-900 transition-all">Browse All Categories</Link>
        </motion.div>
      </div>
    </section>
  );
}

// TRUST SECTION
function TrustSection() {
  const items = [
    { title: 'Verified Local Artists', desc: 'Profiles reviewed for authenticity' },
    { title: 'Secure Payments', desc: 'Protected checkout experience' },
    { title: 'Handcrafted Originals', desc: 'Unique pieces, no mass copies' },
    { title: 'AR Preview Before Buying', desc: 'See art in your space' },
  ];
  return (
    <section className="py-14 md:py-20 bg-[rgba(6,21,35,0.26)] backdrop-blur-sm border-t border-b border-white/10">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="font-heading text-3xl md:text-4xl text-white">Why buy from ShilpoHaat?</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {items.map((it, index) => (
            <motion.div 
              key={it.title} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card rounded-xl p-6 text-center"
            >
              <div className="mb-3 text-brand-gold inline-flex">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-white font-semibold mb-2">{it.title}</p>
              <p className="text-gray-400 text-sm">{it.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// BLOG PREVIEW SECTION
interface BlogPost { _id: string; title: string; slug: string; excerpt: string; coverImage: string; }
function BlogPreview() {
  const [posts, setPosts] = React.useState<BlogPost[]>([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/blog`);
        const data = await res.json();
        setPosts((data.posts || []).slice(0, 3));
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);
  if (loading) return null;
  if (posts.length === 0) return null;
  return (
    <section className="py-14 md:py-20 bg-[rgba(6,21,35,0.3)] backdrop-blur-sm border-t border-b border-white/10">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-4xl md:text-5xl text-white mb-3">Stories & Culture</h2>
          <p className="font-sans text-gray-300">Read interviews, heritage, and process stories</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {posts.map((post, index) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/blog/${post.slug}`} className="glass-card rounded-xl overflow-hidden hover:shadow-2xl block group">
                <div className="relative h-56 w-full overflow-hidden">
                  <CloudinaryResponsiveImage
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    widths={[320, 480, 640, 800]}
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-white font-heading text-xl mb-2 line-clamp-2 group-hover:text-brand-gold transition-colors">{post.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2">{post.excerpt}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-10"
        >
          <Link href="/blog" className="inline-block px-8 py-3 border-2 border-brand-gold text-white rounded-lg hover:bg-brand-gold hover:text-gray-900 transition-all">Read Stories</Link>
        </motion.div>
      </div>
    </section>
  );
}

// FOOTER COMPONENT
function Footer({ t }: { t: (key: string) => string }) {
  return (
    <footer className="py-14 md:py-20 bg-[rgba(6,21,35,0.34)] backdrop-blur-sm border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Logo and Mission */}
          <div>
            <h3 className="font-heading text-2xl text-brand-gold mb-4">
              শিল্পহাট
            </h3>
            <p className="font-sans text-gray-400 text-sm leading-relaxed">
              {t('footer.mission')}
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-4">
              <a href="#" aria-label="Facebook" className="text-white hover:text-brand-gold">🔗</a>
              <a href="#" aria-label="Instagram" className="text-white hover:text-brand-gold">🎨</a>
              <a href="#" aria-label="Twitter" className="text-white hover:text-brand-gold">📰</a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-sans text-white font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="font-sans text-gray-300 hover:text-brand-gold transition-colors text-sm">
                  {t('footer.home')}
                </Link>
              </li>
              <li>
                <Link href="/artworks" className="font-sans text-gray-300 hover:text-brand-gold transition-colors text-sm">
                  {t('footer.artworks')}
                </Link>
              </li>
              <li>
                <Link href="/artists" className="font-sans text-gray-300 hover:text-brand-gold transition-colors text-sm">
                  {t('footer.artists')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="font-sans text-gray-300 hover:text-brand-gold transition-colors text-sm">
                  {t('footer.about')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h4 className="font-sans text-white font-semibold mb-4">{t('footer.customerService')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="font-sans text-gray-300 hover:text-brand-gold transition-colors text-sm">
                  {t('footer.contact')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="font-sans text-gray-300 hover:text-brand-gold transition-colors text-sm">
                  {t('footer.faq')}
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="font-sans text-gray-300 hover:text-brand-gold transition-colors text-sm">
                  {t('footer.shipping')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: For Artists */}
          <div>
            <h4 className="font-sans text-white font-semibold mb-4">{t('footer.forArtists')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/become-seller" className="font-sans text-gray-300 hover:text-brand-gold transition-colors text-sm">
                  {t('footer.becomeSeller')}
                </Link>
              </li>
              <li>
                <Link href="/artist-dashboard" className="font-sans text-gray-300 hover:text-brand-gold transition-colors text-sm">
                  {t('footer.artistDashboard')}
                </Link>
              </li>
              <li>
                <Link href="/seller-guidelines" className="font-sans text-gray-300 hover:text-brand-gold transition-colors text-sm">
                  {t('footer.sellerGuidelines')}
                </Link>
              </li>
            </ul>
            {/* CTA: Learn about artists */}
            <div className="mt-4">
              <Link href="/artists" className="inline-block px-4 py-2 border border-brand-gold text-white rounded hover:bg-brand-gold hover:text-gray-900 transition-all text-sm">Learn About Artists</Link>
            </div>
          </div>
        </div>

        {/* Horizontal Line */}
        <div className="border-t border-gray-700 pt-8">
          <p className="font-sans text-gray-400 text-sm text-center">
            © {new Date().getFullYear()} শিল্পহাট (ShilpoHaat). {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}

// HOME PAGE (Main Export)
export default function Home() {
  const { t } = useI18n();
  return (
    <main>
      <Header />
      <Hero />
      <CategoriesShowcase />
      <FeaturedArtists /> {/* NEW: Featured Artists Section */}
      <FeaturedArtworks />
      <TrustSection />
      <BlogPreview />
      <Footer t={t} />
    </main>
  );
}


