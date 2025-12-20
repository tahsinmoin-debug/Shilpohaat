'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { useCart } from './CartProvider';
import { useI18n } from './LanguageProvider';
import { ADMIN_EMAIL } from '@/lib/config';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, loading, appUser } = useAuth();
  const { cartItems } = useCart();
  const { t, language, setLanguage } = useI18n();

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
              {t('nav.home')}
            </Link>
            <Link 
              href="/artworks" 
              className="font-sans text-white hover:text-brand-gold transition-colors"
            >
              {t('nav.artworks')}
            </Link>
            <Link 
              href="/artists" 
              className="font-sans text-white hover:text-brand-gold transition-colors"
            >
              {t('nav.artists')}
            </Link>
            <Link 
              href="/blog" 
              className="font-sans text-white hover:text-brand-gold transition-colors"
            >
              {t('nav.blog')}
            </Link>
            <Link 
              href="/categories" 
              className="font-sans text-white hover:text-brand-gold transition-colors"
            >
              {t('nav.categories')}
            </Link>
            <Link 
              href="/about" 
              className="font-sans text-white hover:text-brand-gold transition-colors"
            >
              {t('nav.about')}
            </Link>

            {/* Role-based links */}
            {!loading && user && (
              <>
                {appUser?.role === 'artist' && (
                  <>
                    <Link 
                      href={appUser?.artistProfile ? '/artist/dashboard' : '/create-profile'}
                      className="font-sans text-white hover:text-brand-gold transition-colors"
                    >
                      {t('nav.artistDashboard')}
                    </Link>
                    <Link 
                      href="/artist/commissions"
                      className="font-sans text-white hover:text-brand-gold transition-colors"
                    >
                      Commission Requests
                    </Link>
                  </>
                )}
                {appUser?.role === 'buyer' && (
                  <>
                    <Link 
                      href="/account"
                      className="font-sans text-white hover:text-brand-gold transition-colors"
                    >
                      {t('nav.myAccount')}
                    </Link>
                    <Link 
                      href="/request-commission"
                      className="font-sans text-white hover:text-brand-gold transition-colors"
                    >
                      Request Commission
                    </Link>
                    <Link 
                      href="/commissions"
                      className="font-sans text-white hover:text-brand-gold transition-colors"
                    >
                      My Commissions
                    </Link>
                  </>
                )}
                {(appUser?.role === 'admin' || (ADMIN_EMAIL && appUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase())) && (
                  <Link 
                    href="/admin"
                    className="font-sans text-white hover:text-brand-gold transition-colors"
                  >
                    {t('nav.admin')}
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right side icons and mobile menu */}
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

            {/* R do this: Message Icon (Desktop) */}
            {/* The icon is moved here, beside the cart icon */}
            {!loading && user && appUser?.role === 'artist' && (
                <Link 
                    href="/artist/hub" 
                    className="text-white hover:text-brand-gold transition-colors"
                    aria-label="Collaboration Hub"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 4v-4z" />
                    </svg>
                </Link>
            )}

            {/* Shopping Cart Icon with Badge */}
            <Link 
              href="/cart" 
              className="relative text-white hover:text-brand-gold transition-colors"
              aria-label={t('nav.cart')}
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
              <span className="text-white text-sm">{t('nav.loading')}</span>
            ) : user ? (
              <div className="flex items-center gap-2">
                <span className="text-white text-sm hidden sm:inline">{user.displayName || user.email}</span>
                <button
                  onClick={logout}
                  className="text-white text-xs border border-white/30 px-3 py-1 rounded hover:bg-white hover:text-brand-maroon transition-colors"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-white text-sm border border-white/30 px-3 py-1 rounded hover:bg-white hover:text-brand-maroon transition-colors"
              >
                {t('nav.login')}
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
            {/* R do this - Mobile Message Link */}
            {!loading && user && appUser?.role === 'artist' && (
                <Link 
                    href="/artist/hub" 
                    className="font-sans text-white hover:text-brand-gold transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    🤝 Collaboration Hub
                </Link>
            )}
            <Link 
              href="/" 
              className="font-sans text-white hover:text-brand-gold transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.home')}
            </Link>
            <Link 
              href="/artworks" 
              className="font-sans text-white hover:text-brand-gold transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.artworks')}
            </Link>
            <Link 
              href="/artists" 
              className="font-sans text-white hover:text-brand-gold transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.artists')}
            </Link>
            <Link 
              href="/blog" 
              className="font-sans text-white hover:text-brand-gold transition-colors"
            >
              {t('nav.blog')}
            </Link>
            <Link 
              href="/categories" 
              className="font-sans text-white hover:text-brand-gold transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.categories')}
            </Link>
            <Link 
              href="/about" 
              className="font-sans text-white hover:text-brand-gold transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.about')}
            </Link>
            {/* Role-based (mobile) */}
            {user ? (
              <>
                {appUser?.role === 'artist' && (
                    <Link
                      href={appUser?.artistProfile ? '/artist/dashboard' : '/create-profile'}
                      className="font-sans text-white hover:text-brand-gold transition-colors py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('nav.artistDashboard')}
                    </Link>
                  )}
                  {appUser?.role === 'buyer' && (
                    <Link
                      href="/account"
                      className="font-sans text-white hover:text-brand-gold transition-colors py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('nav.myAccount')}
                    </Link>
                  )}
                  {(appUser?.role === 'admin' || (ADMIN_EMAIL && appUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase())) && (
                    <Link
                      href="/admin"
                      className="font-sans text-white hover:text-brand-gold transition-colors py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('nav.admin')}
                    </Link>
                  )}
              </>
            ) : null
            }
            {!loading && (
              user ? (
                <button
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="text-left font-sans text-white hover:text-brand-gold transition-colors py-2"
                >
                  {t('nav.logout')}
                </button>
              ) : (
                <Link
                  href="/login"
                  className="font-sans text-white hover:text-brand-gold transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('nav.login')}
                </Link>
              )
            )}
            {/* Mobile language toggle */}
            <div className="flex md:hidden items-center gap-1 pt-2">
              {(['en', 'bn'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => { setLanguage(lang); setIsMobileMenuOpen(false); }}
                  className={`text-xs px-2 py-1 rounded border border-white/20 transition-colors ${language === lang ? 'bg-white text-brand-maroon' : 'text-white hover:bg-white/10'}`}
                  aria-label={`${t('nav.language')}: ${lang.toUpperCase()}`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
