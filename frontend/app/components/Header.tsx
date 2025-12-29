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

  return (
    <header className="sticky top-0 z-50 bg-[#0b1926] border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo and Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-black tracking-tighter text-white group-hover:text-brand-gold transition-colors italic">
                SHILPO<span className="text-brand-gold group-hover:text-white">HAAT</span>
              </span>
            </Link>
          </div>

          {/* Main Navigation - Visible to Everyone */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/artworks" className="text-white hover:text-brand-gold transition-colors font-medium">
              {t('nav.shop')}
            </Link>
            
            {/* Added Workshops Link */}
            <Link href="/workshops" className="text-white hover:text-brand-gold transition-colors font-medium">
              Workshops & Events
            </Link>

            <Link href="/artists" className="text-white hover:text-brand-gold transition-colors font-medium">
              {t('nav.artists')}
            </Link>
            
            <Link href="/blog" className="text-white hover:text-brand-gold transition-colors font-medium">
              {t('nav.blog')}
            </Link>
          </nav>

          {/* Right Section: Artist Studio, Cart, Language, Auth */}
          <div className="flex items-center gap-3 sm:gap-6">
            
            {/* Artist Studio Button - Only for Artists */}
            {!loading && appUser?.role === 'artist' && (
              <Link 
                href="/artist/dashboard" 
                className="hidden lg:block bg-brand-gold text-[#0b1926] px-4 py-2 rounded-full text-xs font-bold hover:bg-yellow-500 transition-all shadow-md transform hover:scale-105"
              >
                ARTIST STUDIO
              </Link>
            )}

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="text-white text-xs font-bold hover:text-brand-gold transition-colors border border-white/20 px-2 py-1 rounded"
            >
              {language === 'en' ? 'বং' : 'EN'}
            </button>

            {/* Cart Icon */}
            <Link href="/cart" className="relative p-2 text-white hover:text-brand-gold transition-colors group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-gold text-[#0b1926] text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center border-2 border-[#0b1926]">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {/* Auth status */}
            <div className="flex items-center gap-3">
              {loading ? (
                <div className="h-4 w-12 bg-white/10 animate-pulse rounded"></div>
              ) : user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-white text-[11px] font-bold leading-none opacity-70 uppercase tracking-widest">{appUser?.role}</span>
                    <span className="text-white text-sm font-medium truncate max-w-[120px]">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                  </div>
                  <button 
                    onClick={logout} 
                    className="text-white text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded hover:bg-red-500/20 hover:border-red-500/50 transition-all font-bold"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              ) : (
                <Link 
                  href="/login" 
                  className="bg-white text-[#0b1926] text-xs font-bold px-5 py-2 rounded-full hover:bg-brand-gold transition-colors"
                >
                  {t('nav.login')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Navigation (Mobile & Desktop Drawer) */}
      <SidebarNav 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        user={user}
        appUser={appUser}
        logout={logout}
        t={t}
      />
    </header>
  );
}