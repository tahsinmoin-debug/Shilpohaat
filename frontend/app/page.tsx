'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from './components/Header';

// HERO COMPONENT
function Hero() {
  return (
    <section className="relative h-[600px] w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="/hero-bg.jpg"
        alt="Hero Background"
        fill
        className="object-cover"
        priority
        quality={90}
      />
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex items-center justify-center">
        <div className="max-w-4xl text-center">
          {/* Heading */}
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white font-bold mb-6 leading-tight">
            প্রতিটি তুলির টানে, একটি নতুন গল্প
          </h1>

          {/* Paragraph */}
          <p className="font-sans text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto">
            বাংলাদেশের স্থানীয় শিল্পীদের অসাধারণ সৃজনশীলতার জগতটি ঘুরে দেখুন...
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/artworks"
              className="font-sans inline-block px-8 py-3 bg-white text-gray-900 font-semibold rounded-md hover:bg-brand-gold hover:text-white transition-all duration-300 text-center shadow-lg"
            >
              Shop Now
            </Link>
            <Link
              href="/about"
              className="font-sans inline-block px-8 py-3 bg-transparent text-white font-semibold rounded-md border-2 border-white hover:bg-white hover:text-gray-900 transition-all duration-300 text-center"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// SHOP BY CATEGORY COMPONENT
function ShopByCategory() {
  const categories = [
    { name: 'Paintings', items: '150+ Items', href: '/products?category=paintings', imageSrc: 'https://placehold.co/400x300/333/FFF.png?text=Painting' },
    { name: 'Textiles', items: '80+ Items', href: '/products?category=textiles', imageSrc: 'https://placehold.co/400x300/333/FFF.png?text=Textile' },
    { name: 'Sculptures', items: '60+ Items', href: '/products?category=sculptures', imageSrc: 'https://placehold.co/400x300/333/FFF.png?text=Sculpture' },
    { name: 'Jewelry', items: '90+ Items', href: '/products?category=jewelry', imageSrc: 'https://placehold.co/400x300/333/FFF.png?text=Jewelry' }
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <h2 className="font-heading text-4xl text-white text-center mb-4">
          Shop by Category
        </h2>
        
        {/* Paragraph */}
        <p className="font-sans text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          Explore our diverse collection of authentic Bangladeshi artworks and crafts
        </p>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="bg-gray-800 rounded-lg overflow-hidden group hover:shadow-xl transition-shadow"
            >
              {/* Category Image */}
              <div className="relative h-[300px] w-full overflow-hidden">
                <Image
                  src={category.imageSrc}
                  alt={category.name}
                  width={400}
                  height={300}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              {/* Category Info */}
              <div className="p-4">
                <h3 className="font-heading text-xl text-white mb-1">
                  {category.name}
                </h3>
                <p className="font-sans text-gray-400 text-sm">
                  {category.items}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// FEATURED ARTWORKS COMPONENT
function FeaturedArtworks() {
  const [artworks, setArtworks] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchFeaturedArtworks = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/artworks?featured=true');
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
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <h2 className="font-heading text-4xl text-white text-center mb-4">
          Featured Artworks
        </h2>
        
        {/* Paragraph */}
        <p className="font-sans text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          Handpicked masterpieces from our talented local artists
        </p>

        {/* Artworks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {artworks.map((artwork) => (
            <Link
              key={artwork._id}
              href={`/artworks/${artwork._id}`}
              className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Artwork Image */}
              <div className="relative h-[400px] w-full">
                <Image
                  src={artwork.images?.[0] || 'https://placehold.co/400x400/555/FFF.png'}
                  alt={artwork.title}
                  width={400}
                  height={400}
                  className="object-cover w-full h-full"
                />
              </div>
              
              {/* Artwork Info */}
              <div className="p-4">
                <h3 className="font-heading text-xl text-white mb-1">
                  {artwork.title}
                </h3>
                <p className="font-sans text-gray-400 text-sm mb-2">
                  by {artwork.artist?.name || 'Unknown Artist'}
                </p>
                <p className="font-sans text-white font-semibold text-lg mb-4">
                  ৳{artwork.price?.toLocaleString()}
                </p>
                
                {/* Add to Cart Button */}
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Cart functionality coming soon!');
                  }}
                  className="w-full bg-brand-gold text-gray-900 font-semibold py-2 px-4 rounded-md hover:bg-brand-gold-antique transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// FOOTER COMPONENT
function Footer() {
  return (
    <footer className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Logo and Mission */}
          <div>
            <h3 className="font-heading text-2xl text-brand-gold mb-4">
              শিল্পহাট
            </h3>
            <p className="font-sans text-gray-400 text-sm leading-relaxed">
              Empowering local Bangladeshi artists by connecting them with art lovers worldwide. Every purchase supports creative communities.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-sans text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="font-sans text-gray-300 hover:text-brand-gold transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/artworks" className="font-sans text-gray-300 hover:text-brand-gold transition-colors text-sm">
                  Artworks
                </Link>
              </li>
              <li>
                <Link href="/artists" className="font-sans text-gray-300 hover:text-brand-gold transition-colors text-sm">
                  Artists
                </Link>
              </li>
              <li>
                <Link href="/about" className="font-sans text-gray-300 hover:text-brand-gold transition-colors text-sm">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h4 className="font-sans text-white font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="font-sans text-gray-300 hover:text-brand-gold transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="font-sans text-gray-300 hover:text-brand-gold transition-colors text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="font-sans text-gray-300 hover:text-brand-gold transition-colors text-sm">
                  Shipping & Returns
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: For Artists */}
          <div>
            <h4 className="font-sans text-white font-semibold mb-4">For Artists</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/become-seller" className="font-sans text-gray-300 hover:text-brand-gold transition-colors text-sm">
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link href="/artist-dashboard" className="font-sans text-gray-300 hover:text-brand-gold transition-colors text-sm">
                  Artist Dashboard
                </Link>
              </li>
              <li>
                <Link href="/seller-guidelines" className="font-sans text-gray-300 hover:text-brand-gold transition-colors text-sm">
                  Seller Guidelines
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Horizontal Line */}
        <div className="border-t border-gray-700 pt-8">
          <p className="font-sans text-gray-400 text-sm text-center">
            © {new Date().getFullYear()} শিল্পহাট (ShilpoHaat). All rights reserved. Crafted with ❤️ for Bangladeshi artists.
          </p>
        </div>
      </div>
    </footer>
  );
}

// HOME PAGE (Main Export)
export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <ShopByCategory />
      <FeaturedArtworks />
      <Footer />
    </main>
  );
}
