import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: "#ffffff",
      black: "#000000",
      // Primary brand color
      primary: {
        50: "#f0f9ff",
        100: "#e0f2fe",
        200: "#bae6fd",
        300: "#7dd3fc",
        400: "#38bdf8",
        500: "#0ea5e9",
        600: "#0284c7",
        700: "#0369a1",
        800: "#075985",
        900: "#0c3d66",
        950: "#082f49",
      },
      // Neutral theme
      dark: {
        50: "#f9fafb",
        100: "#f3f4f6",
        200: "#e5e7eb",
        300: "#d1d5db",
        400: "#9ca3af",
        500: "#6b7280",
        600: "#4b5563",
        700: "#374151",
        800: "#1f2937",
        900: "#111827",
        950: "#030712",
      },
      // Accent color
      accent: {
        50: "#fdf2f8",
        100: "#fce7f3",
        200: "#fbcfe8",
        300: "#f8a5d8",
        400: "#f472b6",
        500: "#ec4899",
        600: "#db2777",
        700: "#be185d",
        800: "#9d174d",
        900: "#831843",
      },
      // Foreground
      foreground: "#f1f5f9",
      // Status colors
      red: {
        50: "#fef2f2",
        100: "#fee2e2",
        200: "#fecaca",
        300: "#fca5a5",
        400: "#f87171",
        500: "#ef4444",
        600: "#dc2626",
        700: "#b91c1c",
      },
    },
    extend: {
      backgroundImage: {
        "gradient-dark": "linear-gradient(135deg, rgb(15, 23, 42) 0%, rgb(30, 41, 59) 100%)",
        "gradient-darker": "linear-gradient(135deg, rgb(7, 8, 18) 0%, rgb(15, 23, 42) 100%)",
        "gradient-accent": "linear-gradient(135deg, rgb(14, 165, 233) 0%, rgb(236, 72, 153) 100%)",
      },
      boxShadow: {
        "glow-blue": "0 0 20px rgba(14, 165, 233, 0.3)",
        "glow-pink": "0 0 20px rgba(236, 72, 153, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
  plugins: [],
};

export default config;
