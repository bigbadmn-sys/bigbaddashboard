/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        "bbos-bg":      "#0a0a0a",
        "bbos-surface": "#131313",
        "bbos-panel":   "#1a1a1a",
        "bbos-raised":  "#212121",
        "bbos-border":  "#2a2a2a",
        "bbos-muted":   "#3a3939",
        "bbos-dim":     "#555555",
        "bbos-text":    "#e5e2e1",
        "bbos-subtext": "#8a919e",
        "primary":      "#4a9eff",
        "amber":        "#f5a623",
        "green":        "#14e28c",
        "danger":       "#ff4444",
      },
      borderRadius: { DEFAULT: "0px", lg: "0px", xl: "0px", full: "9999px" },
      fontFamily: {
        mono: ["JetBrains Mono", "monospace"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
