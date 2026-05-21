/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        border: "#E2E8F0",
        input: "#E2E8F0",
        ring: "#019C7F",
        background: "#F8FAFC",
        foreground: "#0F172A",
        meal: {
          primary: "#9b87f5",
          secondary: "#7E69AB",
          light: "#D6BCFA",
          success: "#F2FCE2",
          warning: "#FEF7CD",
          accent: "#FEC6A1",
        },
        primary: {
          DEFAULT: "#019C7F",
          light: "#76C893",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F37C21",
          light: "#FFC570",
          foreground: "#FFFFFF",
        },
        neutral: {
          darkest: "#0C0C20",
          dark: "#757575",
          light: "#B3B3B3",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#EEF2F6",
          foreground: "#64748B",
        },
        accent: {
          DEFAULT: "#E6F5F1",
          foreground: "#017A63",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F172A",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F172A",
        },
        overlay: "rgba(0, 0, 0, 0.4)",
        overlay50: "rgba(0, 0, 0, 0.5)",
        overlay60: "rgba(0, 0, 0, 0.6)",
        "primary-muted": "rgba(1, 156, 127, 0.1)",
        "primary-soft": "rgba(1, 156, 127, 0.9)",
        "secondary-muted": "rgba(243, 124, 33, 0.1)",
        "secondary-soft": "rgba(243, 124, 33, 0.2)",
        "secondary-light-muted": "rgba(255, 197, 112, 0.2)",
        "white-muted": "rgba(255, 255, 255, 0.9)",
        "green-muted": "rgba(240, 253, 244, 0.3)",
        "red-muted": "rgba(254, 242, 242, 0.3)",
        "success-bg": "#F2FCE2",
        "success-text": "#2E7D32",
        mealText: "#6C7278",
        orderText: "#3B4054",
        homeBg: "#FFFDF6",
        headerBg: "#FDF8F4",
        avatarBg: "#E8F5E9",
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "4px",
      },
    },
  },
  plugins: [],
};
