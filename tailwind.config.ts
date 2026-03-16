import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#050816",
        panel: "#0b1222",
        line: "rgba(255,255,255,0.08)",
        "cyan-glow": "#03e9f4",
        "whatsapp-green": "#25d366",
        neon: {
          cyan: "#03e9f4",
          violet: "#a855f7",
          blue: "#2563eb",
          green: "#25d366",
        },
      },
      boxShadow: {
        glow: "0 0 40px rgba(3, 233, 244, 0.3)",
        "glow-cyan": "0 0 40px rgba(3, 233, 244, 0.25), 0 0 20px rgba(3, 233, 244, 0.15)",
        "glow-green": "0 0 40px rgba(37, 211, 102, 0.25), 0 0 20px rgba(37, 211, 102, 0.15)",
        violet: "0 0 35px rgba(168, 85, 247, 0.16)",
        "btn-glow": "inset 0 0 20px rgba(3, 233, 244, 0.2), 0 0 30px rgba(3, 233, 244, 0.15)",
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at top left, rgba(3, 233, 244, 0.12), transparent 30%), radial-gradient(circle at top right, rgba(168, 85, 247, 0.16), transparent 35%), linear-gradient(180deg, #040814, #070b17 60%, #050816)",
        card: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
        "hero-gradient": "linear-gradient(135deg, rgba(3, 233, 244, 0.1), rgba(37, 211, 102, 0.05), rgba(168, 85, 247, 0.08))",
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
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-15px)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        glow: "glow 3s ease-in-out infinite",
        scan: "scan 3s linear infinite",
        fadeInUp: "fadeInUp 0.6s ease-out",
        float: "float 3s ease-in-out infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;