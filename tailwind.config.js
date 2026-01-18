/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./login.html",
    "./register.html",
    "./tools.html",
    "./js/**/*.js",
    "./data/**/*.json"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6D9F71',
          50: '#f6f9f7',
          100: '#e3f0e6',
          200: '#c8e1d0',
          300: '#a3d0b3',
          400: '#7dbf92',
          500: '#6D9F71',
          600: '#5a865e',
          700: '#4a6d4e',
          800: '#3c543f',
          900: '#2f3d33',
          light: '#8FBC8F',
          dark: '#4A7C59'
        },
        secondary: '#FFB6C1',
        accent: '#FFD166',
        happy: '#FFEAA7',
        calm: '#A7E6FF',
        sad: '#D8C3FF',
        anxious: '#FFB8B8',
        energetic: '#C5FFB8',
        neutral: '#F0F0F0',
      },
      fontFamily: {
        'sans': ['Anuphan', 'Noto Sans Thai', 'Sarabun', 'Kanit', 'Prompt', 'Thai', 'Segoe UI', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}
