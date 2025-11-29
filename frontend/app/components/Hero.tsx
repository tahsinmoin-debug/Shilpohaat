import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative h-[500px] md:h-[600px] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-pink-400 to-blue-400">
        <Image
          src="/hero-bg.jpg"
          alt="Hero background"
          fill
          className="object-cover object-center"
          priority
          quality={90}
        />
        {/* Dark overlay for better text readability - matching the image's dark bottom section */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#58181F]/30 via-[#58181F]/60 to-[#58181F]/90"></div>
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex items-center justify-center">
        <div className="max-w-4xl text-center">
          {/* Heading */}
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-white mb-4 md:mb-6 leading-tight">
            প্রতিটি তুলির টানে, একটি নতুন গল্প
          </h1>

          {/* Paragraph */}
          <p className="font-sans text-base md:text-lg lg:text-xl text-white/90 mb-6 md:mb-8 leading-relaxed max-w-2xl mx-auto">
            বাংলাদেশের স্থানীয় শিল্পীদের সৃজনশীল কাজ প্রদর্শন ও বিক্রয়ের জন্য একটি বাজার
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/artworks"
              className="font-sans inline-block px-8 py-3 bg-white text-[#58181F] font-semibold rounded-md hover:bg-yellow-500 hover:text-white transition-all duration-300 text-center shadow-lg"
            >
              Shop Now
            </Link>
            <Link
              href="/about"
              className="font-sans inline-block px-8 py-3 bg-transparent text-white font-semibold rounded-md border-2 border-white hover:bg-white hover:text-[#58181F] transition-all duration-300 text-center"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
