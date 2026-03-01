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
          50: '#e1f5ff',
          100: '#b3e0ff',
          500: '#2196f3',
          600: '#1976d2',
          700: '#1565c0',
        },
        success: {
          50: '#e8f5e9',
          500: '#4caf50',
          700: '#388e3c',
        },
        error: {
          50: '#ffebee',
          500: '#f44336',
          700: '#d32f2f',
        },
        warning: {
          50: '#fff3e0',
          500: '#ff9800',
          700: '#f57c00',
        },
      },
    },
  },
  plugins: [],
}
