/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 10-color minimal palette
        teal: {
          DEFAULT: '#14b8a6',
          dark: '#0d9488',
        },
        gray: {
          50: '#f9fafb',
          200: '#e5e7eb',
          500: '#6b7280',
          800: '#1f2937',
        },
        red: {
          DEFAULT: '#ef4444',
        },
        amber: {
          DEFAULT: '#f59e0b',
        },
        green: {
          DEFAULT: '#10b981',
        },
      },
    },
  },
  plugins: [],
}
