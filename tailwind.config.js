/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/flowbite-react/lib/**/*.js",
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/modules/**/*.{js,ts,jsx,tsx}',
    './src/templates/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Education Theme Palette: Trustworthy, Clean, Accessible
        brand: {
          50: '#f0f9ff', // Sky 50
          100: '#e0f2fe', // Sky 100
          200: '#bae6fd', // Sky 200
          300: '#7dd3fc', // Sky 300
          400: '#38bdf8', // Sky 400
          500: '#0ea5e9', // Sky 500 (Primary Brand)
          600: '#0284c7', // Sky 600
          700: '#0369a1', // Sky 700
          800: '#075985', // Sky 800
          900: '#0c4a6e', // Sky 900
          950: '#082f49',
        },
        accent: {
          50: '#fff7ed', // Orange 50
          100: '#ffedd5', // Orange 100
          200: '#fed7aa', // Orange 200
          300: '#fdba74', // Orange 300
          400: '#fb923c', // Orange 400
          500: '#f97316', // Orange 500 (Secondary Action)
          600: '#ea580c', // Orange 600
          700: '#c2410c', // Orange 700
          800: '#9a3412', // Orange 800
          900: '#7c2d12', // Orange 900
        },
        neutral: {
          50: '#f8fafc', // Slate 50
          100: '#f1f5f9', // Slate 100
          200: '#e2e8f0', // Slate 200
          300: '#cbd5e1', // Slate 300
          400: '#94a3b8', // Slate 400
          500: '#64748b', // Slate 500
          600: '#475569', // Slate 600
          700: '#334155', // Slate 700
          800: '#1e293b', // Slate 800
          900: '#0f172a', // Slate 900
        },
        success: {
          50: '#f0fdfa', // Teal 50
          100: '#ccfbf1', // Teal 100
          200: '#99f6e4', // Teal 200
          300: '#5eead4', // Teal 300
          400: '#2dd4bf', // Teal 400
          500: '#14b8a6', // Teal 500
          600: '#0d9488', // Teal 600
          700: '#0f766e', // Teal 700
          800: '#115e59', // Teal 800
          900: '#134e4a', // Teal 900
        },
        warning: {
          50: '#fffbeb', // Amber 50
          100: '#fef3c7', // Amber 100
          200: '#fde68a', // Amber 200
          300: '#fcd34d', // Amber 300
          400: '#fbbf24', // Amber 400
          500: '#f59e0b', // Amber 500
          600: '#d97706', // Amber 600
          700: '#b45309', // Amber 700
          800: '#92400e', // Amber 800
          900: '#78350f', // Amber 900
        },
        danger: {
          50: '#fef2f2', // Red 50
          100: '#fee2e2', // Red 100
          200: '#fecaca', // Red 200
          300: '#fca5a5', // Red 300
          400: '#f87171', // Red 400
          500: '#ef4444', // Red 500
          600: '#dc2626', // Red 600
          700: '#b91c1c', // Red 700
          800: '#991b1b', // Red 800
          900: '#7f1d1d', // Red 900
        },
        // Cognitive level colors (Bloom's Taxonomy)
        cognitive: {
          c1: '#0ea5e9', // Remember (Blue)
          c2: '#14b8a6', // Understand (Teal)
          c3: '#f59e0b', // Apply (Amber)
          c4: '#f97316', // Analyze (Orange)
          c5: '#ef4444', // Evaluate (Red)
          c6: '#8b5cf6', // Create (Purple)
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'fade-out': 'fadeOut 0.3s ease-in',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'DEFAULT': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 15px rgba(14, 165, 233, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}