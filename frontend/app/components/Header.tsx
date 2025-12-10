'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { useCart } from './CartProvider';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, loading, appUser } = useAuth();
  const { cartItems } = useCart();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-brand-maroon sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-2xl md:text-3xl font-heading text-brand-gold hover:text-brand-gold-antique transition-colors"
          >
            শিল্পহাট
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              href="/" 
              className="font-sans text-white hover:text-brand-gold transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/artworks" 
              className="font-sans text-white hover:text-brand-gold transition-colors"
            >
              Artworks
            </Link>
            <Link 
              href="/artists" 
              className="font-sans text-white hover:text-brand-gold transition-colors"
            >
              Artists
            </Link>
            <Link 
              href="/blog" 
              className="font-sans text-white hover:text-brand-gold transition-colors"
            >
              Blog
            </Link>
            <Link 
              href="/categories" 
              className="font-sans text-white hover:text-brand-gold transition-colors"
            >
              Categories
            </Link>
            <Link 
              href="/about" 
              className="font-sans text-white hover:text-brand-gold transition-colors"
            >
              About
            </Link>

            {/* Role-based links */}
            {!loading && user && (
              <>
                {appUser?.role === 'artist' && (
                  <Link 
                    href={appUser?.artistProfile ? '/artist/dashboard' : '/create-profile'}
                    className="font-sans text-white hover:text-brand-gold transition-colors"
                  >
                    Artist Dashboard
                  </Link>
                )}
                {appUser?.role === 'buyer' && (
                  <Link 
                    href="/account"
                    className="font-sans text-white hover:text-brand-gold transition-colors"
                  >
                    My Account
                  </Link>
                )}
                {appUser?.role === 'admin' && (
                  <Link 
                    href="/admin"
                    className="font-sans text-white hover:text-brand-gold transition-colors"
                  >
                    Admin
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right side icons and mobile menu */}
          <div className="flex items-center gap-4">
            {/* Shopping Cart Icon with Badge */}
            <Link 
              href="/cart" 
              className="relative text-white hover:text-brand-gold transition-colors"
              aria-label="Shopping cart"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {/* Cart item count badge */}
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-gold text-brand-maroon text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {/* Auth status */}
            {loading ? (
              <span className="text-white text-sm">Loading...</span>
            ) : user ? (
              <div className="flex items-center gap-2">
                <span className="text-white text-sm hidden sm:inline">{user.displayName || user.email}</span>
                <button
                  onClick={logout}
                  className="text-white text-xs border border-white/30 px-3 py-1 rounded hover:bg-white hover:text-brand-maroon transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-white text-sm border border-white/30 px-3 py-1 rounded hover:bg-white hover:text-brand-maroon transition-colors"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button 
              onClick={toggleMobileMenu}
              className="md:hidden text-white focus:outline-none hover:text-brand-gold transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 flex flex-col gap-3 pb-4 border-t border-brand-gold/20 pt-4">
            <Link 
              href="/" 
              className="font-sans text-white hover:text-brand-gold transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/artworks" 
              className="font-sans text-white hover:text-brand-gold transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Artworks
            </Link>
            <Link 
              href="/artists" 
              className="font-sans text-white hover:text-brand-gold transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Artists
            </Link>
            <Link 
              href="/blog" 
              className="font-sans text-white hover:text-brand-gold transition-colors"
            >
              Blog
            </Link>
            <Link 
              href="/categories" 
              className="font-sans text-white hover:text-brand-gold transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Categories
            </Link>
            <Link 
              href="/about" 
              className="font-sans text-white hover:text-brand-gold transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            {/* Role-based (mobile) */}
            {!loading && (
              user ? (
                <>
                  {appUser?.role === 'artist' && (
                    <Link
                      href={appUser?.artistProfile ? '/artist/dashboard' : '/create-profile'}
                      className="font-sans text-white hover:text-brand-gold transition-colors py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Artist Dashboard
                    </Link>
                  )}
                  {appUser?.role === 'buyer' && (
                    <Link
                      href="/account"
                      className="font-sans text-white hover:text-brand-gold transition-colors py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Account
                    </Link>
                  )}
                  {appUser?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="font-sans text-white hover:text-brand-gold transition-colors py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                </>
              ) : null
            )}
            {!loading && (
              user ? (
                <button
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="text-left font-sans text-white hover:text-brand-gold transition-colors py-2"
                >
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  className="font-sans text-white hover:text-brand-gold transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
