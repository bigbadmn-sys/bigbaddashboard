import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        "bbos-bg": "var(--bbos-bg)",
        "bbos-surface": "var(--bbos-surface)",
        "bbos-panel": "var(--bbos-panel)",
        "bbos-raised": "var(--bbos-raised)",
        "bbos-border": "var(--bbos-border)",
        "bbos-muted": "var(--bbos-muted)",
        "bbos-dim": "var(--bbos-dim)",
        "bbos-text": "var(--bbos-text)",
        "bbos-subtext": "var(--bbos-subtext)",
        primary: "var(--primary)",
        amber: "var(--amber)",
        green: "var(--green)",
        danger: "var(--danger)",
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

export default config;
