/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand accents (theme-independent)
        brand: {
          violet: "#7c5cff",
          indigo: "#5b6cff",
          cyan: "#22d3ee",
          fuchsia: "#d946ef",
        },
        // Legacy dark palette (kept for a few fixed-dark surfaces)
        ink: {
          950: "#05060c",
          900: "#0a0b14",
          800: "#11131f",
          700: "#1a1d2e",
          600: "#272b40",
        },
        // Semantic, theme-aware tokens driven by CSS variables.
        // Use with opacity modifiers, e.g. bg-app-line/10, text-app-muted.
        app: {
          bg: "rgb(var(--app-bg) / <alpha-value>)",
          surface: "rgb(var(--app-surface) / <alpha-value>)",
          elevated: "rgb(var(--app-elevated) / <alpha-value>)",
          text: "rgb(var(--app-text) / <alpha-value>)",
          muted: "rgb(var(--app-muted) / <alpha-value>)",
          faint: "rgb(var(--app-faint) / <alpha-value>)",
          line: "rgb(var(--app-line) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"Space Grotesk"', '"Inter"', "ui-sans-serif", "sans-serif"],
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(124,92,255,0.25), 0 20px 60px -15px rgba(124,92,255,0.45)",
        "glow-cyan": "0 0 0 1px rgba(34,211,238,0.25), 0 20px 60px -15px rgba(34,211,238,0.4)",
        card: "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 20px 50px -25px rgba(0,0,0,0.8)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgb(var(--app-grid) / 0.6) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--app-grid) / 0.6) 1px, transparent 1px)",
      },
      keyframes: {
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-18px)" },
        },
      },
      animation: {
        "gradient-pan": "gradient-pan 8s ease infinite",
        shimmer: "shimmer 1.6s infinite",
        float: "float 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
