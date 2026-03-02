"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from './AuthProvider';
import { useCart } from './CartProvider';
import { useI18n } from './LanguageProvider';
import { ADMIN_EMAIL } from '@/lib/config';
import SidebarNav from './SidebarNav';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, logout, loading, appUser } = useAuth();
  const { cartItems } = useCart();
  const { t, language, setLanguage } = useI18n();

  const toggleSidebar = () => setIsSidebarOpen((v) => !v);

  // Needed so the sidebar portal renders only on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-[#0b2438] border-b border-white/10 shadow-md backdrop-blur-sm"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo + Hamburger */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSidebar}
              className="text-white hover:text-brand-gold transition-colors"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {isSidebarOpen ? (
                  <motion.svg 
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-6 h-6" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </motion.svg>
                ) : (
                  <motion.svg 
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-6 h-6" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.button>

            <Link
              href="/"
              className="text-2xl md:text-3xl font-heading text-brand-gold hover:text-brand-gold-antique transition-colors hover:scale-105 inline-block"
            >
              শিল্পহাট
            </Link>
          </div>

          {/* Center: Desktop Navigation - Enhanced */}
          <nav className="hidden lg:flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
            <Link href="/" className="font-sans text-white hover:text-brand-gold transition-colors relative group">
              {t('nav.home')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-gold transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/artworks" className="font-sans text-white hover:text-brand-gold transition-colors relative group">
              {t('nav.artworks')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-gold transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/artists" className="font-sans text-white hover:text-brand-gold transition-colors relative group">
              {t('nav.artists')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-gold transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/categories" className="font-sans text-white hover:text-brand-gold transition-colors relative group">
              {t('nav.categories')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-gold transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/blog" className="font-sans text-white hover:text-brand-gold transition-colors relative group">
              {t('nav.blog')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-gold transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/wishlist" className="font-sans text-white hover:text-brand-gold transition-colors relative group">
              Wishlist
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-gold transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Right side icons */}
          <div className="flex items-center gap-4">
            {/* Language Toggle (Desktop) */}
            <div className="hidden md:flex items-center gap-1">
              {(['en', 'bn'] as const).map((lang) => (
                <motion.button
                  key={lang}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setLanguage(lang)}
                  className={`text-xs px-2 py-1 rounded border border-white/20 transition-all ${language === lang ? 'bg-white text-brand-maroon font-semibold shadow-md' : 'text-white hover:bg-white/10'}`}
                  aria-label={`${t('nav.language')}: ${lang.toUpperCase()}`}
                >
                  {lang.toUpperCase()}
                </motion.button>
              ))}
            </div>

            {/* Messages icon for all logged-in users */}
            {!loading && user && (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Link href="/messages" className="text-white hover:text-brand-gold transition-colors" aria-label="Messages">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 4v-4z" />
                  </svg>
                </Link>
              </motion.div>
            )}

            {/* Shopping Cart Icon with Badge */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Link href="/cart" className="relative text-white hover:text-brand-gold transition-colors" aria-label={t('nav.cart')}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <AnimatePresence>
                  {cartItems.length > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-2 -right-2 bg-brand-gold text-[#0b1926] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                    >
                      {cartItems.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>

            {/* Auth status */}
            {loading ? (
              <motion.span 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-white text-sm"
              >
                {t('nav.loading')}
              </motion.span>
            ) : user ? (
              <div className="flex items-center gap-2">
                {/* User Profile Icon */}
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    href={appUser?.role === 'artist' ? '/artist/dashboard' : '/account'} 
                    className="text-white hover:text-brand-gold transition-colors" 
                    aria-label="Profile"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </Link>
                </motion.div>
                <span className="text-white text-sm hidden sm:inline">{user.displayName || user.email}</span>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout} 
                  className="text-white text-xs border border-white/30 px-3 py-1 rounded hover:bg-white hover:text-brand-maroon transition-colors"
                >
                  {t('nav.logout')}
                </motion.button>
              </div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/login" className="text-white text-sm border border-white/30 px-3 py-1 rounded hover:bg-white hover:text-brand-maroon transition-colors inline-block">
                  {t('nav.login')}
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Kaggle-style Sidebar Drawer */}
      {mounted && isSidebarOpen && createPortal(
        <SidebarNav open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />,
        document.body
      )}
    </motion.header>
  );
}
