import type { Metadata } from "next";
// Import our new artistic fonts from Google
import { Manrope, Cormorant_Garamond } from "next/font/google";
// This imports your globals.css file
import "./globals.css";
import Providers from "./providers";
import AIChatbot from "./components/AIChatbot";

// Setup the font variables
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope", // Clean, modern body text
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant", // Elegant headings to pair with the artwork
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  // New title with Bangla
  title: "শিল্পহাট (ShilpoHaat) - Empowering Local Artists",
  description:
    "A marketplace for Bangladeshi artists to sell and showcase their creative work.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* This is the KEY!
        1. We add our font variables: `${manrope.variable} ${cormorant.variable}`
        2. We set the default font to `font-sans` (which Tailwind now knows is Manrope).
        3. The background is now driven by globals.css, using your artwork.
        4. Text color is set in globals.css to harmonize with the background.
      */}
      <body className={`${manrope.variable} ${cormorant.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <AIChatbot />
        </Providers>
      </body>
    </html>
  );
}