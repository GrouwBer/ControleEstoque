import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      fontSize: {
        base: "17px",
      },
      colors: {
        canvas: {
          DEFAULT: "#faf7f0",
          dark: "#0d0d0e",
        },
        card: {
          DEFAULT: "#ffffff",
          hover: "#f8f4ec",
          dark: "#141415",
          "dark-hover": "#1c1c1d",
        },
        input: {
          DEFAULT: "#f8f4ec",
          dark: "#1a1a1c",
        },
        text: {
          primary: "#1e1b18",
          secondary: "#5c5751",
          muted: "#8c8680",
          "primary-dark": "#f0efed",
          "secondary-dark": "#b8b5b0",
          "muted-dark": "#7c7872",
        },
        accent: {
          DEFAULT: "#b26d2a",
          hover: "#925720",
          dark: "#d49a50",
          "dark-hover": "#e0ae66",
        },
        status: {
          available: "#2e7d32",
          reserved: "#b8860b",
          sold: "#c0392b",
        },
      },
      borderRadius: {
        card: "12px",
        btn: "6px",
        pill: "9999px",
      },
      boxShadow: {
        card: "0 0 0 1px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.04)",
        "card-hover":
          "0 0 0 1px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)",
      },
      maxWidth: {
        container: "1320px",
      },
      spacing: {
        "touch": "44px",
      },
      transitionDuration: {
        "200": "200ms",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-out-right": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(100%)" },
        },
        "count-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-out-right": "slide-out-right 0.3s ease-in",
        "count-up": "count-up 0.6s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
