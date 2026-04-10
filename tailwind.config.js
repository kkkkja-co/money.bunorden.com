module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          light: '#F2F2F7',
          dark: '#1C1C1E',
        },
        text: {
          primary: '#1C1C1E',
          secondary: '#636366',
        },
        accent: '#007AFF',
        danger: '#FF3B30',
        success: '#34C759',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        input: '12px',
        pill: '9999px',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      boxShadow: {
        subtle: '0 2px 20px rgba(0,0,0,0.06)',
      },
      letterSpacing: {
        tight: '-0.02em',
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}
