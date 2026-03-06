/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        sage: {
          DEFAULT: 'var(--color-sage, #6B9E78)',
          dark: 'var(--color-sage-dark, #4e7a5a)',
        },
        mist: {
          DEFAULT: 'var(--color-mist, #A8C5B0)',
          pale: 'var(--color-mist-pale, #D4E6DA)',
        },
        cream: 'var(--color-cream, #FAF4EF)',
        forest: 'var(--color-forest, #2D3B35)',
        surface: 'var(--color-surface, #EEF5F0)',
      },
      fontFamily: {
        headline: ['Lora', 'serif'],
        body: ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
