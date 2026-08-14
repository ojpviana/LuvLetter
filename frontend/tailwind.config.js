/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Helvetica', 'sans-serif'],
        serif: ['Playfair Display', 'Lora', 'serif'],
        pixel: ['"Pixelify Sans"', 'monospace'],
      },
      colors: {
        'creme': '#FAFAF9', // bg-stone-50 equivalent
        'rose-gold': '#FCA5A5', // rose-300 equivalent
        'sage-green': '#A7F3D0',
        'slate-dark': '#1F2937', // text-gray-800
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'float-heart': 'floatHeart 6s linear infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatHeart: {
          '0%': { transform: 'translateY(0) scale(0.8)' },
          '100%': { transform: 'translateY(-130vh) scale(1.2)' },
        },
      },
    },
  },
  plugins: [],
}
