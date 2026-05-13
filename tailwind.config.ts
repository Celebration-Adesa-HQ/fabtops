import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#F8ACAE',
          secondary: '#ED99BB',
          accent: '#BF88BD',
          purple: '#937FBE',
          dark: '#3B3B44',
          light: '#F9EBE8',
        },
      },
      spacing: {
        'luxury-sm': '2rem',
        'luxury-md': '4rem',
        'luxury-lg': '8rem',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
