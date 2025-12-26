"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useCart } from './CartProvider';
import { useI18n } from './LanguageProvider';
import { ADMIN_EMAIL } from '@/lib/config';
import SidebarNav from './SidebarNav';

export default function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout, loading, appUser } = useAuth();
  const { cartItems } = useCart();
  const { t, language, setLanguage } = useI18n();


const [directAppUser, setDirectAppUser] = useState<any>(null);

useEffect(() => {
  const checkUser = async () => {
    if (user) {
      try {
        const res = await fetch(
          `http://localhost:5000/api/auth/me?firebaseUID=${user.uid}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setDirectAppUser(data.user);
            console.log('Direct fetch user:', data.user);
          }
        }
      } catch (err) {
        console.error('Direct fetch failed:', err);
      }
    }
  };
  
  checkUser();
}, [user]);




console.log('Current user:', user?.email);
console.log('App user:', appUser);
console.log('User role:', appUser?.role);


  const toggleSidebar = () => setIsSidebarOpen((v) => !v);

  return (
    <header className="sticky top-0 z-50 bg-[#0b2438] border-b border-white/10 shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo + Hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="text-white hover:text-brand-gold transition-colors"
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            <Link
              href="/"
              className="text-2xl md:text-3xl font-heading text-brand-gold hover:text-brand-gold-antique transition-colors"
            >
              শিল্পহাট
            </Link>
          </div>

          {/* Desktop Navigation - Simplified */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="font-sans text-white hover:text-brand-gold transition-colors">
              {t('nav.home')}
            </Link>
            <Link href="/artworks" className="font-sans text-white hover:text-brand-gold transition-colors">
              {t('nav.artworks')}
            </Link>
          </nav>

          {/* Right side icons */}
          <div className="flex items-center gap-4">
            {/* Language Toggle (Desktop) */}
            <div className="hidden md:flex items-center gap-1">
              {(['en', 'bn'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`text-xs px-2 py-1 rounded border border-white/20 transition-colors ${language === lang ? 'bg-white text-brand-maroon font-semibold' : 'text-white hover:bg-white/10'}`}
                  aria-label={`${t('nav.language')}: ${lang.toUpperCase()}`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Artist hub shortcut (desktop) */}
            {!loading && user && appUser?.role === 'artist' && (
              <Link href="/artist/hub" className="text-white hover:text-brand-gold transition-colors" aria-label="Collaboration Hub">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 4v-4z" />
                </svg>
              </Link>
            )}

            {/* Shopping Cart Icon with Badge */}
            <Link href="/cart" className="relative text-white hover:text-brand-gold transition-colors" aria-label={t('nav.cart')}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-gold text-[#0b1926] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {/* Auth status */}
            {loading ? (
              <span className="text-white text-sm">{t('nav.loading')}</span>
            ) : user ? (
              <div className="flex items-center gap-2">
                <span className="text-white text-sm hidden sm:inline">{user.displayName || user.email}</span>
                <button onClick={logout} className="text-white text-xs border border-white/30 px-3 py-1 rounded hover:bg-white hover:text-brand-maroon transition-colors">
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <Link href="/login" className="text-white text-sm border border-white/30 px-3 py-1 rounded hover:bg-white hover:text-brand-maroon transition-colors">
                {t('nav.login')}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Kaggle-style Sidebar Drawer */}
      {isSidebarOpen && <SidebarNav open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}
    </header>
  );
}