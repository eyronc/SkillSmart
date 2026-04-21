/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0F172A', // Keep for deep contrast
        pDark: '#59167F',
        pMain: '#8601CE',
        pBrand: '#8627D9',
        pLight: '#9961FF',
        pAccent: '#ED9BFF',
        textPrimary: '#F8FAFC',
        textMuted: '#E2E8F0',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
