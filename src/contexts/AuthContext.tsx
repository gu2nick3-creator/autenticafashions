import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/api/client";
import type { Address, User } from "@/types/api";

interface AuthCtx {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (login: string, password: string) => Promise<{ ok: boolean; isAdmin?: boolean; message?: string }>;
  register: (payload: { name: string; cpf: string; email: string; password: string }) => Promise<{ ok: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (payload: { name: string; cpf: string }) => Promise<{ ok: boolean; message?: string }>;
  addAddress: (payload: Omit<Address, "id">) => Promise<{ ok: boolean; message?: string; address?: Address }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const me = await api.get<User>("/auth/me");
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (login: string, password: string) => {
    try {
      const data = await api.post<{ user: User }>("/auth/login", { login, password });
      setUser(data.user);
      return { ok: true, isAdmin: data.user.role === "admin" };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : "Falha no login." };
    }
  }, []);

  const register = useCallback(async (payload: { name: string; cpf: string; email: string; password: string }) => {
    try {
      const data = await api.post<{ user: User }>("/auth/register", payload);
      setUser(data.user);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : "Falha no cadastro." };
    }
  }, []);

  const logout = useCallback(async () => {
    await api.post("/auth/logout");
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload: { name: string; cpf: string }) => {
    try {
      const updated = await api.put<User>("/account/profile", payload);
      setUser(updated);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : "Falha ao atualizar perfil." };
    }
  }, []);

  const addAddress = useCallback(async (payload: Omit<Address, "id">) => {
    try {
      const address = await api.post<Address>("/account/addresses", payload);
      await refreshUser();
      return { ok: true, address };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : "Falha ao adicionar endereço." };
    }
  }, [refreshUser]);

  const value = useMemo(() => ({ user, isLoggedIn: !!user, loading, login, register, logout, updateProfile, addAddress, refreshUser }), [user, loading, login, register, logout, updateProfile, addAddress, refreshUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
