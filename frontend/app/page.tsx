'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from './components/Header';
import FeaturedArtists from './components/FeaturedArtists';
import { useI18n } from './components/LanguageProvider';

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
function Hero({ t }: { t: (key: string) => string }) {
  // Keep the hero headline in Bengali regardless of language selection
  const headingBn = 'প্রতিটি তুলির টানে, একটি নতুন গল্প';
  const subheadingBn = 'বাংলাদেশের স্থানীয় শিল্পীদের অসাধারণ সৃজনশীলতা আবিষ্কার করুন';
  return (
    <section className="relative h-[560px] md:h-[600px] w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="/hero-bg.jpg"
        alt="Hero Background"
        fill
        className="object-cover"
        priority
        quality={90}
      />
      
      {/* Stronger dark overlay for better contrast */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex items-center justify-center">
        <div className="max-w-3xl md:max-w-4xl text-center">
          {/* Heading - Bold & Emotional */}
          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white font-bold mb-4 md:mb-6 leading-tight tracking-tight drop-shadow-2xl">
            {headingBn}
          </h1>

          {/* Subheadline - Cleaner & Shorter */}
          <p className="font-sans text-xl md:text-2xl text-gray-100 mb-8 md:mb-10 leading-relaxed max-w-2xl mx-auto drop-shadow-lg">
            {subheadingBn}
          </p>

          {/* Single Primary CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/artworks"
              className="font-sans inline-block px-10 md:px-12 py-4 bg-brand-gold text-gray-900 font-bold rounded-lg hover:bg-brand-gold-antique hover:scale-105 transition-all duration-300 text-center shadow-2xl text-lg"
            >
              Explore Artworks
            </Link>
            <Link
              href="/artists"
              className="font-sans inline-block px-10 md:px-12 py-4 bg-transparent text-white font-semibold rounded-lg border-2 border-white/80 hover:bg-white/10 hover:border-white transition-all duration-300 text-center text-lg"
            >
              Meet the Artists
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// FEATURED ARTWORKS COMPONENT

import { API_BASE_URL } from '@/lib/config';

function FeaturedArtworks({ t }: { t: (key: string) => string }) {
  const [artworks, setArtworks] = React.useState<Artwork[]>([]); // ← Fixed type
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchFeaturedArtworks = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/artworks?featured=true`);
        const data = await res.json();
        setArtworks(data.artworks?.slice(0, 4) || []);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold mx-auto"></div>
        </div>
      </section>
    );
  }

  if (artworks.length === 0) {
    return null; // Don't show section if no featured artworks
  }

  return (
    <section className="py-16 md:py-24 bg-gray-900/30">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <h2 className="font-heading text-4xl md:text-5xl text-white text-center mb-3">
          Featured Artworks
        </h2>
        
        {/* Subheadline */}
        <p className="font-sans text-gray-300 text-center mb-12 max-w-xl mx-auto text-lg">
          Discover stunning pieces from talented artists
        </p>

        {/* Artworks Grid - Show 6 max */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {artworks.slice(0, 6).map((artwork) => (
            <Link
              key={artwork._id}
              href={`/artworks/${artwork._id}`}
              className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
            >
              {/* Artwork Image with AR Badge */}
              <div className="relative h-[320px] w-full overflow-hidden">
                <Image
                  src={artwork.images?.[0] || 'https://placehold.co/400x400/555/FFF.png'}
                  alt={artwork.title}
                  width={400}
                  height={320}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                />
                {/* AR Badge */}
                {artwork.category && (
                  <div className="absolute top-3 right-3 bg-brand-gold/95 text-gray-900 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                    <span className="text-sm">🔥</span>
                    AR Ready
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
                
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Cart functionality coming soon!');
                  }}
                  className="w-full bg-brand-gold text-gray-900 font-bold py-3 px-4 rounded-lg hover:bg-brand-gold-antique transition-colors shadow-lg"
                >
                  View Details
                </button>
              </div>
            </Link>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12">
          <Link
            href="/artworks"
            className="inline-block px-8 py-3 bg-transparent text-white font-semibold rounded-lg border-2 border-brand-gold hover:bg-brand-gold hover:text-gray-900 transition-all duration-300"
          >
            View All Artworks →
          </Link>
        </div>
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
  return (
    <section className="py-20 bg-gradient-to-b from-brand-maroon to-gray-900/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-4xl md:text-5xl text-white mb-3">Browse by Category</h2>
          <p className="font-sans text-gray-300 max-w-xl mx-auto">Find artworks by style and medium</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {HOMEPAGE_CATEGORIES.map((cat) => (
            <Link key={cat.id} href={`/artworks?category=${encodeURIComponent(cat.name)}`} className="group rounded-xl overflow-hidden relative">
              <div className="h-56 w-full overflow-hidden">
                <Image src={cat.image} alt={cat.name} width={600} height={300} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
              <div className="absolute inset-x-0 bottom-0 p-5 flex items-center justify-between">
                <h3 className="text-white font-heading text-xl">{cat.name}</h3>
                <span className="px-4 py-1.5 bg-brand-gold text-gray-900 text-sm font-semibold rounded-full">Browse</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/categories" className="inline-block px-8 py-3 border-2 border-brand-gold text-white rounded-lg hover:bg-brand-gold hover:text-gray-900 transition-all">Browse All Categories →</Link>
        </div>
      </div>
    </section>
  );
}

// TRUST SECTION
function TrustSection() {
  const items = [
    { icon: '✔', title: 'Verified Local Artists', desc: 'Profiles reviewed for authenticity' },
    { icon: '✔', title: 'Secure Payments', desc: 'Protected checkout experience' },
    { icon: '✔', title: 'Handcrafted Originals', desc: 'Unique pieces, no mass copies' },
    { icon: '✔', title: 'AR Preview Before Buying', desc: 'See art in your space' },
  ];
  return (
    <section className="py-20 bg-gray-900/40">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl md:text-4xl text-white">Why buy from ShilpoHaat?</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {items.map((it) => (
            <div key={it.title} className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700">
              <div className="text-2xl mb-3 text-brand-gold">{it.icon}</div>
              <p className="text-white font-semibold mb-2">{it.title}</p>
              <p className="text-gray-400 text-sm">{it.desc}</p>
            </div>
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
      } catch (e) {
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
    <section className="py-20 bg-gradient-to-b from-gray-900/30 to-brand-maroon/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-4xl md:text-5xl text-white mb-3">Stories & Culture</h2>
          <p className="font-sans text-gray-300">Read interviews, heritage, and process stories</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {posts.map((post) => (
            <Link key={post._id} href={`/blog/${post.slug}`} className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all">
              <div className="relative h-56 w-full overflow-hidden">
                <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-5">
                <h3 className="text-white font-heading text-xl mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-gray-400 text-sm line-clamp-2">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/blog" className="inline-block px-8 py-3 border-2 border-brand-gold text-white rounded-lg hover:bg-brand-gold hover:text-gray-900 transition-all">Read Stories →</Link>
        </div>
      </div>
    </section>
  );
}

// FOOTER COMPONENT
function Footer({ t }: { t: (key: string) => string }) {
  return (
    <footer className="py-20 bg-gray-900/50">
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
      <Hero t={t} />
      <CategoriesShowcase />
      <FeaturedArtists /> {/* NEW: Featured Artists Section */}
      <FeaturedArtworks t={t} />
      <TrustSection />
      <BlogPreview />
      <Footer t={t} />
    </main>
  );
}