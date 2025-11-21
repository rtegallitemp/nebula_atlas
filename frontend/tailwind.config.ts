import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        nebula: {
          50: "#F5F8FF",
          100: "#EAEFFF",
          200: "#D6DEFF",
          300: "#B3C2FF",
          400: "#8EA5FF",
          500: "#6B87FF",
          600: "#4C65E6",
          700: "#394CC0",
          800: "#2C3B97",
          900: "#232F76"
        },
        aurora: {
          400: "#00F0FF",
          500: "#00D0FF",
          600: "#00B0FF"
        }
      },
      boxShadow: {
        neon: "0 0 20px rgba(0,240,255,0.25), 0 0 50px rgba(107,135,255,0.15)"
      },
      animation: {
        "float-slow": "float 6s ease-in-out infinite",
        "glow": "glow 2.5s ease-in-out infinite"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" }
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 0 rgba(0,240,255,0)" },
          "50%": { boxShadow: "0 0 30px rgba(0,240,255,0.35)" }
        }
      }
    }
  },
  plugins: []
} satisfies Config;


