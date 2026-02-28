import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        base: "#050816",
        panel: "#0b1222",
        line: "rgba(255,255,255,0.08)",
        neon: {
          cyan: "#2ad4ff",
          violet: "#a855f7",
          blue: "#2563eb"
        }
      },
      boxShadow: {
        glow: "0 0 40px rgba(42, 212, 255, 0.18)",
        violet: "0 0 35px rgba(168, 85, 247, 0.16)"
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at top left, rgba(42, 212, 255, 0.12), transparent 30%), radial-gradient(circle at top right, rgba(168, 85, 247, 0.16), transparent 35%), linear-gradient(180deg, #040814, #070b17 60%, #050816)",
        card: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))"
      }
    }
  },
  plugins: []
};

export default config;
