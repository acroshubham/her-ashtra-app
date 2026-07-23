// lib/theme-context.tsx
// Guardian AI theme provider. Dark by default, with a persisted light-mode
// toggle. Accent colors (red/blue/gradients) stay constant across modes; only
// surfaces and text swap. Consume via useTheme().
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { guardian, guardianLight } from "./theme";

export type ThemeMode = "dark" | "light";

export interface ThemePalette {
  mode: ThemeMode;
  // surfaces + text (mode-dependent)
  bg: string;
  bgElevated: string;
  card: string;
  cardAlt: string;
  border: string;
  borderStrong: string;
  glass: string;
  text: string;
  textDim: string;
  textMuted: string;
  // accents (constant)
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
}

interface ThemeContextValue {
  theme: ThemePalette;
  mode: ThemeMode;
  toggle: () => void;
  setMode: (m: ThemeMode) => void;
}

const STORAGE_KEY = "guardian.themeMode";

function build(mode: ThemeMode): ThemePalette {
  const surfaces = mode === "dark" ? guardian : { ...guardian, ...guardianLight };
  return {
    mode,
    bg: surfaces.bg,
    bgElevated: surfaces.bgElevated,
    card: surfaces.card,
    cardAlt: surfaces.cardAlt,
    border: surfaces.border,
    borderStrong: surfaces.borderStrong,
    glass: surfaces.glass,
    text: surfaces.text,
    textDim: surfaces.textDim,
    textMuted: surfaces.textMuted,
    primary: guardian.primary,
    secondary: guardian.secondary,
    success: guardian.success,
    warning: guardian.warning,
    danger: guardian.danger,
  };
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("dark");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => {
        if (v === "light" || v === "dark") setModeState(v);
      })
      .catch(() => {});
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(STORAGE_KEY, m).catch(() => {});
  }, []);

  const toggle = useCallback(() => setMode(mode === "dark" ? "light" : "dark"), [mode, setMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme: build(mode), mode, toggle, setMode }),
    [mode, toggle, setMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
