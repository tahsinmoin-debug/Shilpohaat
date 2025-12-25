import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // --- THIS IS THE NEW PART ---
      // We are telling Tailwind what "font-sans" and "font-heading" mean,
      // matching the variables we will set up in layout.tsx.
      fontFamily: {
        sans: ["var(--font-manrope)"],
        heading: ["var(--font-cormorant)"],
      },
      // We are adding your brand colors so you can use them easily
      // e.g., <div className="bg-brand-maroon">
      colors: {
        "brand-maroon": "#4E0303",
        // Replace yellow accents with oceanic blues to match the global artwork
        // Using CSS variables from globals.css keeps palette centralized
        "brand-gold": "var(--accent-strong)",
        "brand-gold-antique": "var(--accent)",
      },
      // --- END OF NEW PART ---
    },
  },
  plugins: [],
};
export default config;