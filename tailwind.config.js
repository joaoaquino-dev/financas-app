/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#eff4ff',
          100: '#dbe9ff',
          500: '#3b82f6',
          600: '#1a56db',
          700: '#1e40af',
        }
      }
    },
  },
  plugins: [],
}
