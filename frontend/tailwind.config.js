/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        dark: {
          100: "#1e1e2e",
          200: "#181825",
          300: "#11111b",
          400: "#0d0d17",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "bounce-dot": "bounceDot 1.4s infinite ease-in-out",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { transform: "translateY(10px)", opacity: 0 }, to: { transform: "translateY(0)", opacity: 1 } },
        bounceDot: {
          "0%, 80%, 100%": { transform: "scale(0)", opacity: 0.3 },
          "40%": { transform: "scale(1)", opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
