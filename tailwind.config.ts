
import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				telecom: {
					50: '#f0f7ff',
					100: '#e0eefe',
					200: '#bae0fd',
					300: '#7cc8fb',
					400: '#36aaf5',
					500: '#0c91e6',
					600: '#0071c4',
					700: '#015a9f',
					800: '#064d83',
					900: '#0b426d',
					950: '#072a49',
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// LEGAL platform colors - Enhanced with Dark Mode variants
				legal: {
					primary: 'hsl(var(--legal-primary))',        // #4D2BFB
					'primary-light': 'hsl(var(--legal-primary-light))', // #6B46FC
					'primary-dark': 'hsl(var(--legal-primary-dark))',   // #3E1EF9
					secondary: 'hsl(var(--legal-secondary))',    // #03F9FF
					'secondary-light': 'hsl(var(--legal-secondary-light))', // #34FAFF
					'secondary-dark': 'hsl(var(--legal-secondary-dark))',   // #00D6E6
					dark: 'hsl(var(--legal-dark))',             // #020CBC
					'dark-light': 'hsl(var(--legal-dark-light))', // #0313FF
					accent: 'hsl(var(--legal-primary))',        // Para destaques
					cyan: 'hsl(var(--legal-secondary))',        // Ciano específico
				},
				// Dark Mode Background Tokens
				'bg-primary-dark': 'hsl(var(--bg-primary-dark))',     // #121212
				'bg-secondary-dark': 'hsl(var(--bg-secondary-dark))', // #1E1E1E
				'bg-tertiary-dark': 'hsl(var(--bg-tertiary-dark))',   // #2A2A2A
				// Dark Mode Text Tokens
				'text-primary-dark': 'hsl(var(--text-primary-dark))',   // #F5F5F5
				'text-secondary-dark': 'hsl(var(--text-secondary-dark))', // #CCCCCC
				'text-tertiary-dark': 'hsl(var(--text-tertiary-dark))',   // #999999
			},
			fontFamily: {
				sans: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
				'neue-haas': ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'], // Fallback for commercial font
			},
			fontSize: {
				// LEGAL Typography Scale - Mobile First
				'legal-h1': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '900' }], // 28px
				'legal-h1-lg': ['2rem', { lineHeight: '2.5rem', fontWeight: '900' }],   // 32px desktop
				'legal-h2': ['1.375rem', { lineHeight: '1.875rem', fontWeight: '700' }], // 22px
				'legal-h2-lg': ['1.625rem', { lineHeight: '2.125rem', fontWeight: '700' }], // 26px desktop
				'legal-h3': ['1.125rem', { lineHeight: '1.625rem', fontWeight: '600' }], // 18px
				'legal-h3-lg': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }], // 20px desktop
				'legal-body': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],    // 16px
				'legal-label': ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }],  // 12px
				'legal-label-lg': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }], // 14px
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			spacing: {
				// LEGAL Spacing Scale
				'legal-xs': '0.5rem',   // 8px
				'legal-sm': '0.75rem',  // 12px
				'legal-md': '1rem',     // 16px
				'legal-lg': '1.5rem',   // 24px
				'legal-xl': '2rem',     // 32px
				'legal-2xl': '2.5rem',  // 40px
				'legal-3xl': '3rem',    // 48px
			},
			boxShadow: {
				'legal-sm': '0 1px 2px 0 rgba(77, 43, 251, 0.05)',
				'legal': '0 4px 6px -1px rgba(77, 43, 251, 0.1), 0 2px 4px -1px rgba(77, 43, 251, 0.06)',
				'legal-md': '0 10px 15px -3px rgba(77, 43, 251, 0.1), 0 4px 6px -2px rgba(77, 43, 251, 0.05)',
				'legal-lg': '0 20px 25px -5px rgba(77, 43, 251, 0.1), 0 10px 10px -5px rgba(77, 43, 251, 0.04)',
				'legal-xl': '0 25px 50px -12px rgba(77, 43, 251, 0.25)',
				'legal-inner': 'inset 0 2px 4px 0 rgba(77, 43, 251, 0.06)',
				// Dark mode shadows
				'legal-dark': '0 4px 6px -1px rgba(3, 249, 255, 0.1), 0 2px 4px -1px rgba(3, 249, 255, 0.06)',
				'legal-dark-lg': '0 20px 25px -5px rgba(3, 249, 255, 0.1), 0 10px 10px -5px rgba(3, 249, 255, 0.04)',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'ripple': {
					'0%': {
						transform: 'scale(0)',
						opacity: '0.6'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '0'
					}
				},
				'sync-spin': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				'pulse-legal': {
					'0%, 100%': {
						opacity: '1'
					},
					'50%': {
						opacity: '0.7'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-up': {
					'0%': {
						transform: 'translateY(100%)'
					},
					'100%': {
						transform: 'translateY(0)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'ripple': 'ripple 0.8s ease-out forwards',
				'sync-spin': 'sync-spin 1s linear infinite',
				'pulse-legal': 'pulse-legal 1.5s ease-in-out infinite',
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-up': 'slide-up 0.3s ease-out'
			},
			backdropBlur: {
				xs: '2px',
			}
		}
	},
        plugins: [animate],
} satisfies Config;
