// lib/theme.ts
// Shared color tokens for the app. Mirrors the "brand"/"accent"/"sos" scales
// in tailwind.config.js - use these in places that need raw hex values
// (icon colors, shadows, StyleSheet.create) rather than className.

export const colors = {
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
  accent: {
    100: "#ede9fe",
    300: "#c4b5fd",
    500: "#8b5cf6",
    600: "#7c3aed",
  },
  sos: {
    500: "#ef4444",
    600: "#dc2626",
  },
  success: {
    500: "#10b981",
  },
  background: "#FFF7F8",
  surface: "#ffffff",
  border: "#ffe4e6",
  textPrimary: "#28131a",
  textSecondary: "#8a6b73",
  textMuted: "#c98d9a",
};

export default colors;
