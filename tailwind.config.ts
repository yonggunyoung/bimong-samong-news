import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#8B5CF6",
          light: "#EDE9FE",
          lighter: "#F5F3FF",
          dark: "#6D28D9",
          hover: "#7C3AED",
        },
      },
      fontFamily: {
        sans: ["var(--font-noto)", "Noto Sans KR", "sans-serif"],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "#111827",
            h2: { color: "#111827" },
            h3: { color: "#111827" },
            a: { color: "#8B5CF6" },
            strong: { color: "#111827" },
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
