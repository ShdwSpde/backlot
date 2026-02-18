import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        backlot: {
          bg: "#0A0A0F",
          surface: "#1A1525",
          lavender: "#B8A9D4",
          gold: "#C5A644",
          tropical: "#2DD4BF",
          text: "#F5F5F5",
          muted: "#8B8B9E",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
