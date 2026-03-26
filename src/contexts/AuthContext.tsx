import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, type Address, type User } from "@/lib/api";

interface AuthCtx {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (login: string, password: string) => Promise<{ ok: boolean; isAdmin?: boolean; message?: string }>;
  register: (payload: { name: string; cpf: string; email: string; password: string }) => Promise<{ ok: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (payload: { name: string; cpf: string }) => Promise<{ ok: boolean }>;
  addAddress: (payload: Omit<Address, "id">) => Promise<{ ok: boolean; message?: string; address?: Address }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);
export const useAuth = () => useContext(AuthContext);
export type { Address, User };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await api.me();
      setUser(res.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshUser();
  }, []);

  const login = async (loginValue: string, password: string) => {
    try {
      const res = await api.login(loginValue, password);
      setUser(res.user);
      return { ok: true, isAdmin: !!res.user.isAdmin };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : "Falha no login." };
    }
  };

  const register = async (payload: { name: string; cpf: string; email: string; password: string }) => {
    try {
      const res = await api.register(payload);
      setUser(res.user);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : "Falha no cadastro." };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (payload: { name: string; cpf: string }) => {
    try {
      const res = await api.updateProfile(payload);
      setUser(res.user);
      return { ok: true };
    } catch {
      return { ok: false };
    }
  };

  const addAddress = async (payload: Omit<Address, "id">) => {
    try {
      const res = await api.addAddress(payload);
      const address = res.addresses[0];
      setUser((current) => current ? { ...current, addresses: res.addresses } : current);
      return { ok: true, address };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : "Falha ao salvar endereço." };
    }
  };

  const value = useMemo(() => ({ user, isLoggedIn: !!user, loading, login, register, logout, updateProfile, addAddress, refreshUser }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
