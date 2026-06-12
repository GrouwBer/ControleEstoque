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
        // Our design system — warm cream + copper
        canvas: {
          DEFAULT: "var(--bg-canvas)",
        },
        card: {
          DEFAULT: "var(--bg-card)",
          hover: "var(--bg-card-hover)",
        },
        input: {
          DEFAULT: "var(--bg-input)",
        },
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          foreground: "var(--accent-foreground)",
        },
        status: {
          available: "var(--color-available)",
          reserved: "var(--color-reserved)",
          sold: "var(--color-sold)",
        },
        // shadcn semantic tokens — all mapped to our CSS variables
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        ring: "var(--ring)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
      },
      borderRadius: {
        card: "var(--radius-card)",
        btn: "var(--radius-btn)",
        pill: "9999px",
      },
      boxShadow: {
        card: "0 0 0 1px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.04)",
        "card-hover": "0 0 0 1px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)",
      },
      maxWidth: {
        container: "1320px",
      },
      spacing: {
        touch: "44px",
      },
      transitionDuration: {
        "200": "200ms",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
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
