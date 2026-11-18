/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        vasati: {
          // 1. BRAND COLOUR THEME
          // Primary Colors
          royal: "#4B0082",            // Deep Royal Purple
          purple: "#5B0BB5",           // Rich Purple (Primary)
          "purple-vibrant": "#7200D9", // Vibrant Purple
          "purple-dark": "#4B0082",    // Deep Royal Purple
          "purple-light": "#7200D9",   // Vibrant Purple
          "purple-soft": "#F1E8FF",    // Soft purple background
          "purple-border": "#E8D9FD",  // Light lavender / subtle purple border

          // Secondary Colors
          orange: "#FF8A00",           // Orange
          "orange-gold": "#FFB000",     // Golden Orange
          "orange-dark": "#E66D00",
          "orange-light": "#FFF4E5",

          // Background Colors
          main: "#FFFFFF",             // Main background
          lavender: "#F8F3FF",         // Light lavender background
          card: "#FFFFFF",             // Card background

          // Text Colors
          dark: "#241044",             // Primary text
          text: "#241044",             // Primary text alias
          secondary: "#70677D",        // Secondary text
          muted: "#70677D",            // Secondary text alias
          white: "#FFFFFF",            // White text
        },
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        // 3. CARDS AND CONTAINERS: Soft lavender shadows
        'card': '0 8px 24px -4px rgba(91, 11, 181, 0.08), 0 2px 8px -2px rgba(114, 0, 217, 0.04)',
        'card-hover': '0 16px 36px -6px rgba(91, 11, 181, 0.16), 0 4px 12px -2px rgba(114, 0, 217, 0.06)',
        'nav': '0 -4px 20px rgba(75, 0, 130, 0.06)',
        'float': '0 10px 30px rgba(91, 11, 181, 0.28)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      }
    },
  },
  plugins: [],
}
