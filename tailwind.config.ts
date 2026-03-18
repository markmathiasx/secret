import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Base colors
        base: "#050816",
        panel: "#0b1222",
        line: "rgba(255,255,255,0.08)",

        // Brand colors
        "cyan-glow": "#03e9f4",
        "whatsapp-green": "#25d366",
        "brand-primary": "#03e9f4",
        "brand-secondary": "#25d366",

        // Neon palette
        neon: {
          cyan: "#03e9f4",
          violet: "#a855f7",
          blue: "#2563eb",
          green: "#25d366",
          pink: "#ec4899",
          orange: "#f97316",
        },

        // Semantic colors
        success: "#25d366",
        warning: "#f97316",
        error: "#ef4444",
        info: "#03e9f4",

        // Gradients
        gradient: {
          start: "#03e9f4",
          middle: "#a855f7",
          end: "#25d366",
        },
      },

      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },

      fontSize: {
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
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },

      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },

      boxShadow: {
        glow: "0 0 40px rgba(3, 233, 244, 0.3)",
        cyan: "0 0 24px rgba(3, 233, 244, 0.18), 0 0 48px rgba(3, 233, 244, 0.1)",
        "glow-cyan": "0 0 40px rgba(3, 233, 244, 0.25), 0 0 20px rgba(3, 233, 244, 0.15)",
        "glow-green": "0 0 40px rgba(37, 211, 102, 0.25), 0 0 20px rgba(37, 211, 102, 0.15)",
        "glow-violet": "0 0 35px rgba(168, 85, 247, 0.16), 0 0 15px rgba(168, 85, 247, 0.1)",
        violet: "0 0 35px rgba(168, 85, 247, 0.16)",
        "btn-glow": "inset 0 0 20px rgba(3, 233, 244, 0.2), 0 0 30px rgba(3, 233, 244, 0.15)",
        "card-hover": "0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)",
      },

      backgroundImage: {
        mesh: "radial-gradient(circle at top left, rgba(3, 233, 244, 0.12), transparent 30%), radial-gradient(circle at top right, rgba(168, 85, 247, 0.16), transparent 35%), linear-gradient(180deg, #040814, #070b17 60%, #050816)",
        card: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
        "hero-gradient": "linear-gradient(135deg, rgba(3, 233, 244, 0.1), rgba(37, 211, 102, 0.05), rgba(168, 85, 247, 0.08))",
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
        "cyber-grid": "linear-gradient(rgba(3, 233, 244, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(3, 233, 244, 0.1) 1px, transparent 1px)",
      },

      keyframes: {
        glow: {
          "0%, 100%": { textShadow: "0 0 20px rgba(3, 233, 244, 0.5), 0 0 40px rgba(3, 233, 244, 0.3)" },
          "50%": { textShadow: "0 0 30px rgba(3, 233, 244, 0.8), 0 0 60px rgba(3, 233, 244, 0.5)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateY(100%)", opacity: "0" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-15px)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        bounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "cyber-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(3, 233, 244, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(3, 233, 244, 0.6), 0 0 60px rgba(3, 233, 244, 0.4)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },

      animation: {
        glow: "glow 3s ease-in-out infinite",
        scan: "scan 3s linear infinite",
        fadeInUp: "fadeInUp 0.6s ease-out",
        fadeInDown: "fadeInDown 0.6s ease-out",
        slideInLeft: "slideInLeft 0.6s ease-out",
        slideInRight: "slideInRight 0.6s ease-out",
        float: "float 3s ease-in-out infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        bounce: "bounce 1s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "cyber-pulse": "cyber-pulse 2s ease-in-out infinite",
        scaleIn: "scaleIn 0.3s ease-out",
        fadeIn: "fadeIn 0.3s ease-out",
      },

      backdropBlur: {
        xs: '2px',
      },

      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
};

export default config;
