/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 42, 23, 0.04)',
        xs: '0 1px 3px 0 rgba(0, 42, 23, 0.06)',
      },
      backdropBlur: {
        xs: '2px',
      },
      scale: {
        '98': '0.98',
      },
      colors: {
        palmeiras: {
          50: '#f0f7f3',
          100: '#dcf0e4',
          200: '#bde1cc',
          300: '#8ec9a6',
          400: '#4da674',
          500: '#008348',
          600: '#006437', // Verde Palestra / Oficial
          700: '#00502c',
          800: '#003e22',
          900: '#002a17',
        },
        gold: {
          50: '#fdfbf2',
          100: '#f9f4dd',
          500: '#d4a017',
          600: '#b8860b',
          700: '#946c0d',
        },
        blue: {
          50: '#f0f7f3',
          100: '#dcf0e4',
          200: '#bde1cc',
          500: '#008348',
          600: '#006437',
          700: '#00502c',
          800: '#003e22',
          900: '#002a17'
        },
        brand: {
          50: '#f0f7f3',
          100: '#dcf0e4',
          500: '#008348',
          600: '#006437',
          700: '#00502c',
          800: '#003e22',
        }
      }
    },
  },
  plugins: [],
}
