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
        blue: { 50: '#eff7f0', 100: '#deeedf', 200: '#bedbc6', 500: '#328454', 600: '#14613e', 700: '#125334', 800: '#10452c', 900: '#123c2d' },
        brand: {
          50:  '#eff7f0',
          100: '#deeedf',
          500: '#328454',
          600: '#14613e',
          700: '#125334',
        }
      }
    },
  },
  plugins: [],
}
