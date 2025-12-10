import type { Metadata } from "next";
// Import our new artistic fonts from Google
import { Inter, Playfair_Display } from "next/font/google";
// This imports your globals.css file
import "./globals.css";
import { AuthProvider } from "./components/AuthProvider";
import { CartProvider } from "./components/CartProvider";

// Setup the font variables
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // We'll use this for body text
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair", // We'll use this for headings
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
        1. We add our font variables: `${inter.variable} ${playfair.variable}`
        2. We set the default font to `font-sans` (which Tailwind now knows is Inter).
        3. We set the sitewide background to your dark maroon `bg-brand-maroon`.
        4. We set the default text color to a light, visible gray `text-gray-100`.
      */}
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-brand-maroon antialiased`}>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}