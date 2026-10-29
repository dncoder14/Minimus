/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#0B0B0F', // page background
        surface: '#15151C', // cards and panels
        elevated: '#1D1D26', // modals, dropdowns, hover surfaces
        line: '#292932', // borders and dividers
        amber: { DEFAULT: '#FFC247', dark: '#E5A92E' }, // primary accent
        ember: '#F97316', // secondary accent
        muted: '#A1A1AA', // secondary text
        ink: '#F4F4F5', // primary text
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        control: '8px',
      },
      boxShadow: {
        card: '0 8px 24px -12px rgba(0, 0, 0, 0.6)',
        pop: '0 16px 40px -12px rgba(0, 0, 0, 0.7)',
      },
      screens: {
        xs: '475px',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        // Each drifting column holds its posters twice, so moving by exactly half loops seamlessly
        driftUp: { '0%': { transform: 'translateY(0)' }, '100%': { transform: 'translateY(-50%)' } },
        driftDown: { '0%': { transform: 'translateY(-50%)' }, '100%': { transform: 'translateY(0)' } },
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease-out both',
        'drift-up': 'driftUp 80s linear infinite',
        'drift-down': 'driftDown 95s linear infinite',
      },
    },
  },
  plugins: [],
}
