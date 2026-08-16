/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        container: {
            center: true,
            padding: '1rem',
        },
        extend: {
            colors: {
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                primary: {
                    DEFAULT: 'var(--primary)',
                    foreground: 'var(--primary-foreground)',
                    hover: 'var(--primary-hover)',
                },
                accent: {
                    DEFAULT: 'var(--accent)',
                    foreground: 'var(--accent-foreground)',
                },
                secondary: {
                    DEFAULT: 'var(--secondary)',
                    foreground: 'var(--secondary-foreground)',
                },
                muted: {
                    DEFAULT: 'var(--muted)',
                    foreground: 'var(--muted-foreground)',
                },
                card: {
                    DEFAULT: 'var(--card)',
                    foreground: 'var(--card-foreground)',
                },
                border: 'var(--border)',
                input: 'var(--input)',
                ring: 'var(--ring)',
                surface: 'var(--bg-surface)',
                'text-primary': 'var(--text-primary)',
                'text-secondary': 'var(--text-secondary)',
                'text-muted': 'var(--text-muted)',
                success: 'var(--success)',
                warning: 'var(--warning)',
                danger: 'var(--danger)',
            },
            borderRadius: {
                DEFAULT: 'var(--radius)',
                lg: 'calc(var(--radius) + 2px)',
                md: 'var(--radius)',
                sm: 'calc(var(--radius) - 2px)',
            },
            fontFamily: {
                sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
                mono: ['var(--font-geist-mono)', 'JetBrains Mono', 'monospace'],
            },
            fontSize: {
                'hero': ['2.25rem', { lineHeight: '2.75rem', letterSpacing: '-0.02em', fontWeight: '700' }],
                'display': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em', fontWeight: '600' }],
            },
            boxShadow: {
                'glow-blue': '0 0 24px rgba(37, 99, 235, 0.3), 0 0 48px rgba(37, 99, 235, 0.1)',
                'glow-subtle': '0 0 12px rgba(37, 99, 235, 0.15)',
                'card': '0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3)',
            },
            animation: {
                'fade-in': 'fadeIn 200ms ease forwards',
                'fade-in-up': 'fadeInUp 200ms ease forwards',
                'stream-pulse': 'streamPulse 1.2s ease-in-out infinite',
                'shimmer': 'shimmer 1.5s infinite',
            },
        },
    },
    plugins: [require('@tailwindcss/typography')],
};