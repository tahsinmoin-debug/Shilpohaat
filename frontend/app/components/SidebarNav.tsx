"use client";

import Link from 'next/link';
import { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useI18n } from './LanguageProvider';
import { ADMIN_EMAIL } from '@/lib/config';
import { User } from 'firebase/auth';

interface SidebarNavProps {
  isOpen: boolean;        // This removes the red line!
  onClose: () => void;
  user: User | null;
  appUser: any | null;    // Use 'any' for now, or your specific AppUserDoc type
  logout: () => Promise<void>;
  t: (key: string) => string;
}


export default function SidebarNav({ isOpen, onClose }: SidebarNavProps) {
  const { t } = useI18n();
  const { user, loading, appUser } = useAuth();

  // Treat configured admin email as admin even if role is missing in DB
  const isAdmin = appUser?.role === 'admin' || (user?.email && ADMIN_EMAIL && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());

  
useEffect(() => {
  if (isOpen) { // Changed from open
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
  return () => {
    document.body.style.overflow = '';
  };
}, [isOpen]); 

  // Navigation items (base)
  const baseLinks: { href: string; label: string; icon: JSX.Element }[] = [
    {
      href: '/',
      label: t('nav.home'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8l4 4m0 0v4a2 2 0 01-2 2h-2m-6 0H7a2 2 0 01-2-2v-4m0 0l4-4" />
        </svg>
      ),
    },
    {
      href: '/artworks',
      label: t('nav.artworks'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l6-6 4 4 6-6" />
        </svg>
      ),
    },
    {
      href: '/artists',
      label: t('nav.artists'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13a4 4 0 118 0 4 4 0 11-8 0zm9 8a7 7 0 10-10 0" />
        </svg>
      ),
    },
    {
      href: '/categories',
      label: t('nav.categories'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
    },
    {
      href: '/blog',
      label: t('nav.blog'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h8M7 16h6" />
        </svg>
      ),
    },
    {
      href: '/cart',
      label: t('nav.cart'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      href: '/wishlist',
      label: 'Wishlist',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
        </svg>
      ),
    },
    {
      href: '/about',
      label: t('nav.about'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
      ),
    },
  ];

  const roleLinks: { href: string; label: string; icon: JSX.Element }[] = [];

  if (!loading && user) {
    console.log('SidebarNav - User logged in, appUser:', appUser);
    console.log('SidebarNav - appUser?.role:', appUser?.role);
    
    if (appUser?.role === 'artist') {
      roleLinks.push(
        {
          href: appUser?.artistProfile ? '/artist/dashboard' : '/create-profile',
          label: t('nav.artistDashboard'),
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
            </svg>
          ),
        },
        {
          href: '/artist/commissions',
          label: 'Commission Requests',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m4-4H8" />
            </svg>
          ),
        },
        {
          href: '/artist/hub',
          label: 'Collaboration Hub',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 4v-4z" />
            </svg>
          ),
        },
      );
    }
    if (appUser?.role === 'buyer') {
      roleLinks.push(
        {
          href: '/account',
          label: t('nav.myAccount'),
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A7 7 0 1118.879 6.196 7 7 0 015.121 17.804z" />
            </svg>
          ),
        },
        {
          href: '/request-commission',
          label: 'Request Commission',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          ),
        },
        {
          href: '/commissions',
          label: 'My Commissions',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
            </svg>
          ),
        },
      );
    }
    if (isAdmin) {
      roleLinks.push(
        {
          href: '/commissions',
          label: 'Commissions',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m4-4H8" />
            </svg>
          ),
        },
        {
          href: '/admin',
          label: t('nav.admin'),
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m-4-4h8" />
            </svg>
          ),
        }
      );
    }
  }

  return (
    <div
      className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        className={`absolute left-0 top-0 h-full w-[90vw] sm:w-[360px] md:w-[380px] max-w-sm transform transition-transform duration-300 bg-[#0b2438] text-white shadow-2xl border-r border-white/10 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <span className="text-xl font-heading text-brand-gold drop-shadow">শিল্পহাট</span>
          <button
            onClick={onClose}
            className="text-white hover:text-brand-gold"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="px-3 py-4 overflow-y-auto flex-1">
          <div className="space-y-1">
            {[...baseLinks, ...roleLinks].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/10 active:bg-white/15"
                onClick={onClose}
              >
                <span className="text-brand-gold">{item.icon}</span>
                <span className="font-sans text-base text-white">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Bottom actions */}
          <div className="mt-6 border-top border-white/10 pt-4 space-y-1">
            <Link href="/learn" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/10 active:bg-white/15" onClick={onClose}>
              <span className="text-brand-gold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                </svg>
              </span>
              <span className="font-sans text-base text-white">Learn</span>
            </Link>
            <Link href="/more" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/10 active:bg-white/15" onClick={onClose}>
              <span className="text-brand-gold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </span>
              <span className="font-sans text-base text-white">More</span>
            </Link>
          </div>
        </nav>
      </aside>
    </div>
  );
}
