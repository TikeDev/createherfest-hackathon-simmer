/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Simmer brand tokens
        sage: {
          DEFAULT: 'var(--color-sage, #6B9E78)',
          dark: 'var(--color-sage-dark, #4e7a5a)',
        },
        mist: {
          DEFAULT: 'var(--color-mist, #A8C5B0)',
          pale: 'var(--color-mist-pale, #D4E6DA)',
        },
        cream: 'var(--color-cream, #FAF4EF)',
        'cream-text': 'var(--color-cream-text, #FAF4EF)',
        forest: 'var(--color-forest, #2D3B35)',
        surface: 'var(--color-surface, #EEF5F0)',
        // shadcn semantic tokens
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: 'var(--destructive)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        headline: ['Lora', 'serif'],
        body: ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
