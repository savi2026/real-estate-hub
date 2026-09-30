/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B1120",
        surface: "#141B2E",
        surfaceRaised: "#1C2540",
        hairline: "#2A3555",
        muted: "#8B93B0",
        paper: "#EDEFF7",
        marigold: "#6366F1",
        marigoldDim: "#4F46E5",
        good: "#34D399",
        risk: "#F87171",
      },
      fontFamily: {
        serif: ['"DM Serif Display"', "serif"],
        brand: ['"Playfair Display"', "serif"],
        sans: ["Manrope", "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};