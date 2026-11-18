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
          purple: "#5C16C5",
          "purple-dark": "#430E96",
          "purple-light": "#7C3AED",
          "purple-gradient": "linear-gradient(135deg, #5C16C5 0%, #7C3AED 100%)",
          "purple-soft": "#F4EEFF",
          "purple-border": "#E9D9FD",
          lavender: "#F8F6FC",
          orange: "#FF7A00",
          "orange-dark": "#E66800",
          "orange-light": "#FFF3EB",
          dark: "#1A102A",
          muted: "#6B7280",
        },
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(92, 22, 197, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 12px 30px -4px rgba(92, 22, 197, 0.16), 0 4px 8px -2px rgba(0, 0, 0, 0.06)',
        'nav': '0 -4px 20px rgba(0, 0, 0, 0.06)',
        'float': '0 8px 30px rgba(92, 22, 197, 0.25)',
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

