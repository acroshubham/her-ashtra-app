// lib/theme.ts
// Guardian AI design tokens. The `guardian` palette drives the redesigned dark
// UI; the legacy brand/accent/sos/success keys are preserved so existing
// screens that still import them keep working.

export const guardian = {
  // Brand
  primary: "#E53935", // Safety Red
  primaryDark: "#B71C1C",
  secondary: "#2563EB", // Guardian Blue
  secondaryDark: "#1E40AF",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",

  // Dark surfaces (default)
  bg: "#0B1220",
  bgElevated: "#0F1729",
  card: "#111827",
  cardAlt: "#1A2333",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.14)",
  glass: "rgba(255,255,255,0.05)",

  // Text
  text: "#FFFFFF",
  textDim: "#9CA3AF",
  textMuted: "#6B7280",

  // Gradients (start → end)
  gradRed: ["#E53935", "#F59E0B"] as const, // Red → Orange
  gradBlue: ["#2563EB", "#22D3EE"] as const, // Blue → Cyan
  gradGreen: ["#16A34A", "#22C55E"] as const,
  gradViolet: ["#7C3AED", "#2563EB"] as const,
  gradDark: ["#0B1220", "#111827"] as const,
} as const;

// Light-mode surface overrides (accents stay constant across themes).
export const guardianLight = {
  bg: "#F5F7FB",
  bgElevated: "#FFFFFF",
  card: "#FFFFFF",
  cardAlt: "#F1F5F9",
  border: "rgba(15,23,42,0.08)",
  borderStrong: "rgba(15,23,42,0.14)",
  glass: "rgba(15,23,42,0.03)",
  text: "#0B1220",
  textDim: "#475569",
  textMuted: "#94A3B8",
} as const;

// Category → color for Safe Haven place types (reused across screens).
export const CATEGORY_TINT: Record<string, string> = {
  police: "#3B82F6",
  hospital: "#EF4444",
  fire_station: "#F97316",
  petrol_pump: "#06B6D4",
  metro: "#8B5CF6",
  hotel: "#14B8A6",
  mall: "#D946EF",
  pharmacy: "#22C55E",
  government: "#94A3B8",
};

// ---- Legacy tokens (kept for backward compatibility) ----
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
  accent: { 100: "#ede9fe", 300: "#c4b5fd", 500: "#8b5cf6", 600: "#7c3aed" },
  sos: { 500: "#ef4444", 600: "#dc2626" },
  success: { 500: "#10b981" },
  background: "#FFF7F8",
  surface: "#ffffff",
  border: "#ffe4e6",
  textPrimary: "#28131a",
  textSecondary: "#8a6b73",
  textMuted: "#c98d9a",
};

export default colors;
