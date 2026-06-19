/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wood': {
          50: '#FAF7F2',
          100: '#F5F0E8',
          200: '#E8DFD0',
          300: '#D4C4A8',
          400: '#C9A961',
          500: '#8B6914',
          600: '#7A5A10',
          700: '#65490C',
          800: '#503909',
          900: '#3A2906',
        },
        'sage': {
          400: '#7CB342',
          500: '#689F38',
          600: '#558B2F',
        },
        'coral': {
          400: '#FF8A65',
          500: '#FF7043',
          600: '#F4511E',
        },
        'mist': {
          300: '#CFD8DC',
          400: '#B0BEC5',
          500: '#90A4AE',
        },
        'brick': {
          400: '#E57373',
          500: '#EF5350',
          600: '#F44336',
        },
        'bronze': {
          400: '#D4B87A',
          500: '#C9A961',
          600: '#B8943F',
        },
        'cream': {
          50: '#FDFBF7',
          100: '#FAF7F2',
          200: '#F5F0E8',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(139, 105, 20, 0.08)',
        'card': '0 4px 16px rgba(139, 105, 20, 0.1)',
        'float': '0 8px 32px rgba(139, 105, 20, 0.12)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
