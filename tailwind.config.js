/** @type {import('tailwindcss').Config} */
export default {
  content: ['./public/views/**/*.html', './public/js/**/*.js'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#eff6ff', 500: '#2563eb', 600: '#1d4ed8', 700: '#1e40af' }
      },
      boxShadow: {
        soft: '0 18px 45px rgba(15, 23, 42, .08)'
      }
    }
  },
  plugins: []
}
