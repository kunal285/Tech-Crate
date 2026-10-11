/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#032762',       // Mobile BRAND.primaryNavy
          secondaryBlue: '#034697',
          blue: '#0262B8',
          primary: '#2563EB',    // Mobile Colors.primary
          primaryDark: '#1D4ED8',
          primaryLight: '#DBEAFE',
          purple: '#7C3AED',     // Mobile Colors.secondary
          orange: '#F97316',     // Mobile BRAND.accentOrange
          cyan: '#02C9CC',       // Mobile BRAND.cyan
          darkNavy: '#061A3A',
          bg: '#F8FAFC',         // Mobile Colors.background
          surface: '#FFFFFF',
        },
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        DEFAULT: '12px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
      },
      boxShadow: {
        'mobile-sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'mobile-md': '0 2px 4px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'mobile-lg': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};
