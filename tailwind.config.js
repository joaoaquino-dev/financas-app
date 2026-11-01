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
        blue: { 50: '#edf3f9', 100: '#dce7f3', 200: '#bccfe3', 500: '#3d6388', 600: '#234c73', 700: '#1c3d5e', 800: '#19354f', 900: '#172b42' },
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
