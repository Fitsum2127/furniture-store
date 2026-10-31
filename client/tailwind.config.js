// client/tailwind.config.js
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
    },
  },
  plugins: [],
};