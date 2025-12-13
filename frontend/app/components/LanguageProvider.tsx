'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Language = 'en' | 'bn';
type TranslateFn = (key: string) => string;

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslateFn;
};

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.artworks': 'Artworks',
    'nav.artists': 'Artists',
    'nav.blog': 'Blog',
    'nav.categories': 'Categories',
    'nav.about': 'About',
    'nav.artistDashboard': 'Artist Dashboard',
    'nav.myAccount': 'My Account',
    'nav.admin': 'Admin',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    'nav.loading': 'Loading...',
    'nav.cart': 'Shopping cart',
    'nav.language': 'Language',

    'hero.heading': 'Every brushstroke tells a new story',
    'hero.subheading': 'Explore the extraordinary creativity of Bangladeshi artists and discover the stories behind each piece.',
    'hero.shopNow': 'Shop Now',
    'hero.learnMore': 'Learn More',

    'shopByCategory.title': 'Shop by Category',
    'shopByCategory.subtitle': 'Explore our diverse collection of authentic Bangladeshi artworks and crafts',
    'shopByCategory.paintings': 'Paintings',
    'shopByCategory.textiles': 'Textiles',
    'shopByCategory.sculptures': 'Sculptures',
    'shopByCategory.jewelry': 'Jewelry',
    'shopByCategory.paintingsCount': '150+ Items',
    'shopByCategory.textilesCount': '80+ Items',
    'shopByCategory.sculpturesCount': '60+ Items',
    'shopByCategory.jewelryCount': '90+ Items',

    'featuredArtworks.title': 'Featured Artworks',
    'featuredArtworks.subtitle': 'Handpicked masterpieces from our talented local artists',
    'featuredArtworks.by': 'by',
    'featuredArtworks.unknownArtist': 'Unknown Artist',
    'featuredArtworks.addToCart': 'Add to Cart',

    'featuredArtists.title': 'Featured Local Artists',
    'featuredArtists.subtitle': 'Discover trending Bangladeshi artists based on ratings, popularity, and curator selection',
    'featuredArtists.featured': 'Featured',
    'featuredArtists.views': 'views',
    'featuredArtists.viewProfile': 'View Profile',
    'featuredArtists.exploreAll': 'Explore All Artists',

    'footer.mission': 'Empowering local Bangladeshi artists by connecting them with art lovers worldwide. Every purchase supports creative communities.',
    'footer.quickLinks': 'Quick Links',
    'footer.customerService': 'Customer Service',
    'footer.forArtists': 'For Artists',
    'footer.home': 'Home',
    'footer.artworks': 'Artworks',
    'footer.artists': 'Artists',
    'footer.about': 'About',
    'footer.contact': 'Contact Us',
    'footer.faq': 'FAQ',
    'footer.shipping': 'Shipping & Returns',
    'footer.becomeSeller': 'Become a Seller',
    'footer.artistDashboard': 'Artist Dashboard',
    'footer.sellerGuidelines': 'Seller Guidelines',
    'footer.copyright': 'All rights reserved. Crafted with ❤️ for Bangladeshi artists.',
  },
  bn: {
    'nav.home': 'হোম',
    'nav.artworks': 'শিল্পকর্ম',
    'nav.artists': 'শিল্পীরা',
    'nav.blog': 'ব্লগ',
    'nav.categories': 'বিভাগ',
    'nav.about': 'আমাদের সম্পর্কে',
    'nav.artistDashboard': 'শিল্পী ড্যাশবোর্ড',
    'nav.myAccount': 'আমার একাউন্ট',
    'nav.admin': 'অ্যাডমিন',
    'nav.login': 'লগইন',
    'nav.logout': 'লগআউট',
    'nav.loading': 'লোড হচ্ছে...',
    'nav.cart': 'শপিং কার্ট',
    'nav.language': 'ভাষা',

    'hero.heading': 'প্রতিটি তুলির টানে, একটি নতুন গল্প',
    'hero.subheading': 'বাংলাদেশের স্থানীয় শিল্পীদের অসাধারণ সৃজনশীলতার জগতটি ঘুরে দেখুন...',
    'hero.shopNow': 'এখনই কেনাকাটা করুন',
    'hero.learnMore': 'আরও জানুন',

    'shopByCategory.title': 'বিভাগ অনুযায়ী কেনাকাটা',
    'shopByCategory.subtitle': 'বাংলাদেশি শিল্প ও হস্তশিল্পের বহুমাত্রিক সংগ্রহ অন্বেষণ করুন',
    'shopByCategory.paintings': 'পেইন্টিং',
    'shopByCategory.textiles': 'টেক্সটাইল',
    'shopByCategory.sculptures': 'মূর্তি',
    'shopByCategory.jewelry': 'গহনা',
    'shopByCategory.paintingsCount': '১৫০+ পণ্য',
    'shopByCategory.textilesCount': '৮০+ পণ্য',
    'shopByCategory.sculpturesCount': '৬০+ পণ্য',
    'shopByCategory.jewelryCount': '৯০+ পণ্য',

    'featuredArtworks.title': 'নির্বাচিত শিল্পকর্ম',
    'featuredArtworks.subtitle': 'আমাদের মেধাবী স্থানীয় শিল্পীদের বাছাইকৃত শ্রেষ্ঠ কাজ',
    'featuredArtworks.by': 'শিল্পী',
    'featuredArtworks.unknownArtist': 'অজানা শিল্পী',
    'featuredArtworks.addToCart': 'কার্টে যোগ করুন',

    'featuredArtists.title': 'নির্বাচিত স্থানীয় শিল্পী',
    'featuredArtists.subtitle': 'রেটিং, জনপ্রিয়তা ও কিউরেটর নির্বাচনের ভিত্তিতে ট্রেন্ডিং বাংলাদেশি শিল্পীদের খুঁজে নিন',
    'featuredArtists.featured': 'নির্বাচিত',
    'featuredArtists.views': 'বার দেখা হয়েছে',
    'featuredArtists.viewProfile': 'প্রোফাইল দেখুন',
    'featuredArtists.exploreAll': 'সব শিল্পী দেখুন',

    'footer.mission': 'বাংলাদেশি শিল্পীদের কাজ বিশ্বব্যাপী শিল্পপ্রেমীদের কাছে পৌঁছে দিয়ে তাদের সক্ষম করছি। প্রতিটি কেনাকাটা সৃজনশীল সম্প্রদায়কে সমর্থন করে।',
    'footer.quickLinks': 'দ্রুত লিঙ্ক',
    'footer.customerService': 'কাস্টমার সার্ভিস',
    'footer.forArtists': 'শিল্পীদের জন্য',
    'footer.home': 'হোম',
    'footer.artworks': 'শিল্পকর্ম',
    'footer.artists': 'শিল্পীরা',
    'footer.about': 'আমাদের সম্পর্কে',
    'footer.contact': 'যোগাযোগ করুন',
    'footer.faq': 'প্রশ্নোত্তর',
    'footer.shipping': 'শিপিং ও রিটার্ন',
    'footer.becomeSeller': 'বিক্রেতা হন',
    'footer.artistDashboard': 'শিল্পী ড্যাশবোর্ড',
    'footer.sellerGuidelines': 'বিক্রেতা নির্দেশিকা',
    'footer.copyright': 'সর্বস্বত্ব সংরক্ষিত। বাংলাদেশি শিল্পীদের জন্য ভালবাসা দিয়ে তৈরি।',
  },
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('language') : null;
    if (stored === 'en' || stored === 'bn') {
      setLanguage(stored);
    } else if (typeof navigator !== 'undefined' && navigator.language?.startsWith('bn')) {
      setLanguage('bn');
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', language);
    }
  }, [language]);

  const t = useMemo<TranslateFn>(() => {
    return (key: string) => translations[language]?.[key] ?? translations.en[key] ?? key;
  }, [language]);

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useI18n must be used within a LanguageProvider');
  return ctx;
}
