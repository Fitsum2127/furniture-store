/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', '"Noto Sans Ethiopic"', 'serif'],
        sans: ['Inter', '"Noto Sans Ethiopic"', 'system-ui', 'sans-serif'],
      },
      colors: {
        olive: { DEFAULT: '#6b7a4f', dark: '#556040', light: '#8a9a6b' },
        sand: {
          50: '#faf8f5',
          100: '#f3ede4',
          200: '#e8dccb',
          300: '#d9c6aa',
          400: '#c4a882',
          500: '#b08968',
        },
      },
      // Every hover/color change on the site now takes 0.6 seconds and eases out gently.
      // Make the numbers bigger for even slower hovers.
      transitionDuration: { DEFAULT: '600ms' },
      transitionTimingFunction: { DEFAULT: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    },
  },
  plugins: [],
};