/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
          960: '#000000',
          970: '#ffffff'
        },
        available: '#10b981', // Green for available slots
        booked: '#ef4444',    // Red for booked slots
        user: '#3b82f6',      // Blue for user's booked slots
        locked: '#f59e0b',    // Yellow for locked slots
      },
    },
  },
  plugins: [],
} 