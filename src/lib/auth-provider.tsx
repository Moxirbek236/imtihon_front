"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Role, User } from "@/lib/api/types";
import axiosClient from "@/api/axios";
import { parseLoginResponse, persistAuthSession, getHomeRouteForRole, clearAuthSession, normalizeRole } from "@/lib/routes";

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: Role | null;
  isReady: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  login: (phone: string, password: string) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadFromStorage = useCallback(() => {
    if (typeof window === "undefined") {
      return { token: null, role: null, user: null };
    }
    const t = localStorage.getItem("token");
    const r = localStorage.getItem("role") as Role | null;
    let u: User | null = null;
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) u = JSON.parse(userStr);
    } catch {}
    return { token: t, role: r, user: u };
  }, []);

  useEffect(() => {
    const stored = loadFromStorage();
    if (stored.token) {
      setToken(stored.token);
      setRole(stored.role);
      setUser(stored.user);
    }
    setIsReady(true);
    setIsLoading(false);
  }, [loadFromStorage]);

  // Set default authorization header on mount
  useEffect(() => {
    if (token) {
      import("@/lib/api/client").then((mod) => {
        mod.default.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      });
    }
  }, [token]);

  const login = useCallback(
    async (phone: string, password: string) => {
      const res = await axiosClient.post("/auth/login", { phone, password });
      const { token: t, role: r, user: u, success } = parseLoginResponse(res.data);

      if (!success || !t) {
        throw new Error("Login muvaffaqiyatsiz");
      }

      persistAuthSession(t, r, u);

      setToken(t);
      setRole((r?.toUpperCase() as Role) || null);
      setUser(u as User | null);

      router.replace(getHomeRouteForRole(r));

      return res.data;
    },
    [router]
  );

  const logout = useCallback(() => {
    clearAuthSession();
    setToken(null);
    setRole(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isReady,
        isLoading,
        isAuthenticated: !!token,
        isSuperAdmin: normalizeRole(role) === "SUPERADMIN",
        isTeacher: normalizeRole(role) === "TEACHER",
        isStudent: normalizeRole(role) === "STUDENT",
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
