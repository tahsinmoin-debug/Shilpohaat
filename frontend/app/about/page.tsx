"use client";

import Header from "../components/Header";
import Link from "next/link";
import CloudinaryResponsiveImage from "../components/CloudinaryResponsiveImage";

const TEAM_MEMBERS = ["Tahsin", "Rusammi", "Elma", "Rahat", "Nuhana"];

function TeamInitial({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase();
  return (
    <div className="w-12 h-12 rounded-full bg-brand-gold text-[#0b1926] font-bold flex items-center justify-center">
      {initial}
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="min-h-screen text-white">
      <Header />

      <section className="relative bg-[rgba(6,21,35,0.34)] border-b border-white/10 pt-14 md:pt-20 pb-28 md:pb-36">
        <div className="container mx-auto px-4 text-center">
          <p className="text-brand-gold text-xs md:text-sm tracking-[0.18em] uppercase font-semibold mb-3">
            About ShilpoHaat
          </p>
          <h1 className="font-heading text-4xl md:text-6xl mb-4">Built for Local Artists</h1>
          <p className="max-w-3xl mx-auto text-base md:text-lg text-gray-200">
            We are building a platform where Bangladeshi creativity gets the visibility, trust, and
            business opportunity it deserves.
          </p>
        </div>

        <div className="container mx-auto px-4 absolute left-0 right-0 -bottom-16 md:-bottom-24">
          <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden border border-white/20 shadow-2xl relative">
            <CloudinaryResponsiveImage
              src="/backgrounds/site-artwork.jpg"
              alt="ShilpoHaat team and vision"
              className="w-full h-64 sm:h-80 md:h-[420px] object-cover"
              sizes="(max-width: 768px) 100vw, 1100px"
              widths={[640, 960, 1280]}
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div
                className="border rounded-xl px-8 py-4 sm:px-10 sm:py-5 shadow-2xl"
                style={{ backgroundColor: "#0b2438", borderColor: "#1f5e86" }}
              >
                <h2 className="font-heading text-5xl sm:text-6xl md:text-7xl text-white drop-shadow-2xl tracking-wide text-center">
                  About Us
                </h2>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-24 md:pt-32 pb-12 md:pb-16 bg-[rgba(6,21,35,0.24)] border-b border-white/10">
        <div className="container mx-auto px-4 max-w-5xl">
          <p className="text-lg md:text-xl text-gray-100 leading-relaxed">
            <span className="font-semibold text-white">ShilpoHaat</span> is a digital marketplace
            focused on empowering local artists through better discovery, storytelling, and commerce.
            We connect creators and collectors in one seamless experience, from browsing to secure checkout.
          </p>
          <p className="text-base md:text-lg text-gray-300 leading-relaxed mt-6">
            Our goal is simple: make art more accessible for buyers and more sustainable for artists.
            We combine thoughtful product design, transparent profiles, and curated presentation so every
            artwork gets the stage it deserves.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[rgba(6,21,35,0.30)] border-b border-white/10">
        <div className="container mx-auto px-4 max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="rounded-2xl border border-white/15 bg-[rgba(11,36,56,0.50)] p-6 md:p-8">
            <h2 className="font-heading text-3xl md:text-4xl mb-4">What We Do</h2>
            <ul className="space-y-3 text-gray-200 text-base md:text-lg">
              <li>Artist-first online showcase for original works</li>
              <li>Reliable buyer flow with secure cart and checkout</li>
              <li>Category-based discovery and featured curation</li>
              <li>Direct creator visibility through artist profiles</li>
              <li>Messaging and engagement tools for collaboration</li>
            </ul>
          </div>

          <div className="rounded-2xl overflow-hidden border border-white/15 shadow-xl">
            <CloudinaryResponsiveImage
              src="https://res.cloudinary.com/dt0mwoirn/image/upload/v1765522391/shilpohaat/categories/traditional-art.jpg"
              alt="Bangladeshi art community"
              className="w-full h-72 md:h-[420px] object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              widths={[480, 768, 1024]}
            />
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[rgba(6,21,35,0.24)] border-b border-white/10">
        <div className="container mx-auto px-4 max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="rounded-2xl overflow-hidden border border-white/15 shadow-xl">
            <CloudinaryResponsiveImage
              src="https://res.cloudinary.com/dt0mwoirn/image/upload/v1765522524/shilpohaat/categories/landscape.jpg"
              alt="Creative impact of ShilpoHaat"
              className="w-full h-72 md:h-[360px] object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              widths={[480, 768, 1024]}
            />
          </div>

          <div className="rounded-2xl border border-white/15 bg-[rgba(11,36,56,0.50)] p-6 md:p-8">
            <h2 className="font-heading text-3xl md:text-4xl mb-4">Our Impact</h2>
            <ul className="space-y-3 text-gray-200 text-base md:text-lg">
              <li>Stronger digital presence for emerging local artists</li>
              <li>Better trust between collectors and creators</li>
              <li>Simpler discovery through curated categories and filters</li>
              <li>A growing ecosystem around Bangladeshi visual culture</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[rgba(6,21,35,0.30)]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-10">
            <p className="text-brand-gold text-xs md:text-sm tracking-[0.18em] uppercase font-semibold mb-3">
              Our Team
            </p>
            <h2 className="font-heading text-3xl md:text-4xl mb-3">Built by BRAC University Students</h2>
            <p className="text-gray-300 text-base md:text-lg max-w-3xl mx-auto">
              ShilpoHaat is designed and developed by a student team from BRAC University.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
            {TEAM_MEMBERS.map((member) => (
              <div
                key={member}
                className="rounded-xl border border-white/15 bg-[rgba(11,36,56,0.50)] p-4 flex items-center gap-3"
              >
                <TeamInitial name={member} />
                <div>
                  <p className="text-white font-semibold">{member}</p>
                  <p className="text-gray-400 text-sm">Core Team</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/artworks"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-brand-gold text-[#0b1926] font-bold hover:bg-brand-gold-antique transition-colors"
            >
              Explore Artworks
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
