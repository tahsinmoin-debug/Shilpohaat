"use client";

import Link from 'next/link';
import { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useI18n } from './LanguageProvider';
import { ADMIN_EMAIL } from '@/lib/config';
import { User } from 'firebase/auth';

interface SidebarNavProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  appUser: any | null;
  logout: () => Promise<void>;
  t: (key: string) => string;
}

export default function SidebarNav({ isOpen, onClose }: SidebarNavProps) {
  const { t } = useI18n();
  const { user, loading, appUser } = useAuth();

  const isAdmin =
    appUser?.role === 'admin' ||
    (user?.email && ADMIN_EMAIL && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // ── Icons ──────────────────────────────────────────────────────────────
  const icons = {
    home: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    shop: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
    workshop: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.869v6.262a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" /></svg>,
    artists: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    blog: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h8M7 16h6" /></svg>,
    cart: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    heart: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>,
    about: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>,
    dashboard: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" /></svg>,
    commission: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    hub: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 4v-4z" /></svg>,
    shield: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    account: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  };

  // ── Base links (shown to everyone) ────────────────────────────────────
  const baseLinks = [
    { href: '/', label: t('nav.home') || 'Home', icon: icons.home },
    { href: '/artworks', label: t('nav.shop') || 'Shop', icon: icons.shop },
    // Workshops link — destination changes based on role (see below)
    { href: '/artists', label: t('nav.artists') || 'Artists', icon: icons.artists },
    { href: '/blog', label: t('nav.blog') || 'Blog', icon: icons.blog },
    { href: '/cart', label: t('nav.cart') || 'Cart', icon: icons.cart },
    { href: '/wishlist', label: 'Wishlist', icon: icons.heart },
    { href: '/about', label: t('nav.about') || 'About', icon: icons.about },
  ];

  // ── Role-specific links ───────────────────────────────────────────────
  const roleLinks: { href: string; label: string; icon: JSX.Element }[] = [];

  if (!loading && user) {
    if (appUser?.role === 'artist') {
      roleLinks.push(
        {
          href: appUser?.artistProfile ? '/artist/dashboard' : '/create-profile',
          label: 'Artist Dashboard',
          icon: icons.dashboard,
        },
        {
          // ← This is the key fix: artists go to /artist/workshops, not /workshops
          href: '/artist/workshops',
          label: 'My Workshops',
          icon: icons.workshop,
        },
        {
          href: '/artist/commissions',
          label: 'Commission Requests',
          icon: icons.commission,
        },
        {
          href: '/artist/hub',
          label: 'Collaboration Hub',
          icon: icons.hub,
        },
      );
    }

    if (appUser?.role === 'buyer' || appUser?.role === 'user') {
      roleLinks.push(
        { href: '/account', label: t('nav.myAccount') || 'My Account', icon: icons.account },
        { href: '/request-commission', label: 'Request Commission', icon: icons.commission },
        // Regular users see Browse Workshops → /workshops
        { href: '/workshops', label: 'Browse Workshops', icon: icons.workshop },
      );
    }

    if (isAdmin) {
      roleLinks.push(
        { href: '/admin', label: 'Admin Panel', icon: icons.shield },
        { href: '/admin/workshops', label: 'Moderate Workshops', icon: icons.workshop },
      );
    }
  }

  // ── Workshops link for the Explore section ────────────────────────────
  // Artists → /artist/workshops | Everyone else → /workshops
  const workshopsHref = appUser?.role === 'artist' ? '/artist/workshops' : '/workshops';
  const workshopsLabel = appUser?.role === 'artist' ? 'My Workshops' : 'Workshops';

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-[60]" onClick={onClose} />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        className="fixed left-0 top-0 h-full w-[280px] sm:w-[320px] md:w-[360px] z-[70] bg-[#0b2438] text-white shadow-2xl border-r border-white/10 flex flex-col overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <span className="text-xl font-heading text-brand-gold">শিল্পহাট</span>
          <button onClick={onClose} className="text-white hover:text-brand-gold transition-colors" aria-label="Close menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="px-3 py-4 flex-1">

          {/* Role-specific section at top if logged in */}
          {roleLinks.length > 0 && (
            <>
              <p className="text-xs uppercase text-gray-500 font-bold px-3 mb-2 tracking-widest">My Space</p>
              <div className="space-y-1 mb-4">
                {roleLinks.map((item) => (
                  <Link key={item.href} href={item.href}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/10 transition-colors"
                    onClick={onClose}>
                    <span className="text-brand-gold">{item.icon}</span>
                    <span className="text-base text-white">{item.label}</span>
                  </Link>
                ))}
              </div>
              <div className="border-t border-white/10 mb-4" />
            </>
          )}

          {/* Explore section */}
          <p className="text-xs uppercase text-gray-500 font-bold px-3 mb-2 tracking-widest">Explore</p>
          <div className="space-y-1">
            {/* Home */}
            <Link href="/" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/10 transition-colors" onClick={onClose}>
              <span className="text-brand-gold">{icons.home}</span>
              <span className="text-base text-white">{t('nav.home') || 'Home'}</span>
            </Link>
            {/* Shop */}
            <Link href="/artworks" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/10 transition-colors" onClick={onClose}>
              <span className="text-brand-gold">{icons.shop}</span>
              <span className="text-base text-white">{t('nav.shop') || 'Shop'}</span>
            </Link>
            {/* Workshops — smart link based on role */}
            <Link href={workshopsHref} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/10 transition-colors" onClick={onClose}>
              <span className="text-brand-gold">{icons.workshop}</span>
              <span className="text-base text-white">{workshopsLabel}</span>
            </Link>
            {/* Artists */}
            <Link href="/artists" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/10 transition-colors" onClick={onClose}>
              <span className="text-brand-gold">{icons.artists}</span>
              <span className="text-base text-white">{t('nav.artists') || 'Artists'}</span>
            </Link>
            {/* Blog */}
            <Link href="/blog" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/10 transition-colors" onClick={onClose}>
              <span className="text-brand-gold">{icons.blog}</span>
              <span className="text-base text-white">{t('nav.blog') || 'Blog'}</span>
            </Link>
            {/* Cart */}
            <Link href="/cart" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/10 transition-colors" onClick={onClose}>
              <span className="text-brand-gold">{icons.cart}</span>
              <span className="text-base text-white">{t('nav.cart') || 'Cart'}</span>
            </Link>
            {/* Wishlist */}
            <Link href="/wishlist" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/10 transition-colors" onClick={onClose}>
              <span className="text-brand-gold">{icons.heart}</span>
              <span className="text-base text-white">Wishlist</span>
            </Link>
            {/* About */}
            <Link href="/about" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/10 transition-colors" onClick={onClose}>
              <span className="text-brand-gold">{icons.about}</span>
              <span className="text-base text-white">{t('nav.about') || 'About'}</span>
            </Link>
          </div>
        </nav>
      </aside>
    </>
  );
}
