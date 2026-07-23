/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Guardian AI palette
        guardian: {
          primary: "#E53935",
          secondary: "#2563EB",
          success: "#22C55E",
          warning: "#F59E0B",
          bg: "#0B1220",
          bgel: "#0F1729",
          card: "#111827",
          cardalt: "#1A2333",
          ink: "#FFFFFF",
          dim: "#9CA3AF",
          muted: "#6B7280",
        },
        // Legacy scales (kept so existing screens don't break)
        brand: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
        },
        accent: { 100: "#ede9fe", 300: "#c4b5fd", 500: "#8b5cf6", 600: "#7c3aed" },
        sos: { 500: "#ef4444", 600: "#dc2626" },
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
      },
    },
  },
  plugins: [],
}
