/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-brown': '#4E342E',
        'warm-taupe': '#8D6E63',
        'sandy-beige': '#D7CCC8',
        'pale-cream': '#FFF8E1',
      }
    },
  },
  plugins: [],
}
