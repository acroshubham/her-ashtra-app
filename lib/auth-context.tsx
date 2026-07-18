// lib/auth-context.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiFetch, ApiError, getToken, setToken, clearToken } from "./api";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
}

interface AuthResult {
  error?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (email: string, password: string, fullName?: string, phone?: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const me = await apiFetch<AuthUser>("/api/auth/me");
      setUser(me);
    } catch (err) {
      console.warn("[AuthContext] Failed to refresh user, clearing session:", err);
      await clearToken();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refreshUser();
      setLoading(false);
    })();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      const data = await apiFetch<{ token: string; user: AuthUser }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      await setToken(data.token);
      setUser(data.user);
      return {};
    } catch (err) {
      console.error("[AuthContext] Login failed:", err);
      const message = err instanceof ApiError ? err.message : `Login failed: ${(err as Error).message || err}`;
      return { error: message };
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, fullName?: string, phone?: string): Promise<AuthResult> => {
      try {
        const data = await apiFetch<{ token: string; user: AuthUser }>("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ email, password, fullName, phone }),
        });
        await setToken(data.token);
        setUser(data.user);
        return {};
      } catch (err) {
        console.error("[AuthContext] Registration failed:", err);
        const message = err instanceof ApiError ? err.message : `Registration failed: ${(err as Error).message || err}`;
        return { error: message };
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    await clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
