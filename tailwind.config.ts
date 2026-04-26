import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        maroon: { DEFAULT: '#800000', dark: '#6B0000', light: '#FF9999' },
        violet: {
          50: '#F5F0F8', 100: '#EDE8F5', 200: '#D8CEF0',
          300: '#C4B5D9', 400: '#A78BFA', 500: '#8B7AA0',
          600: '#5A4478', 700: '#2D1B4E', 800: '#241835', 900: '#1A1025',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
