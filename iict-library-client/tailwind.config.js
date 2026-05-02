/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-brown': '#1a1c1a',
        'warm-taupe': '#5e4447',
        'sandy-beige': '#1a1c1a',
        'pale-cream': '#FDFFF5',
        'library-gold': '#c5ab9d',
        'library-forest': '#5e4447',
        'library-mist': '#c5ab9d',
        'library-ink': '#1a1c1a',
        'paper': '#FDFFF5',
        'paper-soft': '#f7f8ec',
        'plum': '#5e4447',
        'taupe': '#c5ab9d',
      }
    },
  },
  plugins: [],
}
