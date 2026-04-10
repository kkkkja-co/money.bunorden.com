/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
          secondary: '#8b5cf6',
        },
        success: '#34c759',
        danger: '#ff3b30',
        warning: '#ff9500',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        input: '12px',
        pill: '9999px',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
      },
      boxShadow: {
        subtle: '0 2px 20px rgba(0,0,0,0.06)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        glow: '0 8px 24px rgba(59, 130, 246, 0.3)',
      },
      letterSpacing: {
        tight: '-0.02em',
        tighter: '-0.04em',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}
