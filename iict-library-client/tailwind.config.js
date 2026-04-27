/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-brown': '#1f2a24',
        'warm-taupe': '#4b5b54',
        'sandy-beige': '#ded6c8',
        'pale-cream': '#f7f1e7',
        'library-gold': '#b68a3a',
        'library-forest': '#3a5a40',
        'library-mist': '#e7ece7',
        'library-ink': '#1f2a24',
      }
    },
  },
  plugins: [],
}
