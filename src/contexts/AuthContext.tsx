import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

export interface Address {
  id: string;
  label: string;
  recipient: string;
  zipCode: string;
  street: string;
  number: string;
  district: string;
  city: string;
  state: string;
  complement?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  password?: string;
  addresses?: Address[];
  isAdmin?: boolean;
  createdAt?: string;
}

interface AuthCtx {
  user: User | null;
  isLoggedIn: boolean;
  login: (login: string, password: string) => { ok: boolean; isAdmin?: boolean; message?: string };
  register: (payload: { name: string; cpf: string; email: string; password: string }) => { ok: boolean; message?: string };
  logout: () => void;
  updateProfile: (payload: { name: string; cpf: string }) => { ok: boolean };
  addAddress: (payload: Omit<Address, 'id'>) => { ok: boolean; message?: string; address?: Address };
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);
export const useAuth = () => useContext(AuthContext);

const USER_KEY = "af_user";
const CLIENTS_KEY = "af_clients";

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
};

const saveJson = (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value));
const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback((loginValue: string, password: string) => {
    const normalized = loginValue.trim().toUpperCase();
    if (normalized === "ADM" && password === "ADM123@") {
      const adminUser: User = { id: "admin-1", name: "Administrador", email: "ADM", isAdmin: true };
      setUser(adminUser);
      saveJson(USER_KEY, adminUser);
      return { ok: true, isAdmin: true };
    }

    const clients = readJson<User[]>(CLIENTS_KEY, []);
    const found = clients.find(
      (client) => client.email.toLowerCase() === loginValue.trim().toLowerCase() && client.password === password,
    );

    if (!found) return { ok: false, message: "E-mail ou senha inválidos." };

    const session: User = {
      id: found.id,
      name: found.name,
      email: found.email,
      cpf: found.cpf,
      addresses: found.addresses || [],
      createdAt: found.createdAt,
    };
    setUser(session);
    saveJson(USER_KEY, session);
    return { ok: true, isAdmin: false };
  }, []);

  const register = useCallback((payload: { name: string; cpf: string; email: string; password: string }) => {
    const clients = readJson<User[]>(CLIENTS_KEY, []);
    const emailExists = clients.some((client) => client.email.toLowerCase() === payload.email.trim().toLowerCase());
    if (emailExists) return { ok: false, message: "Já existe uma conta com esse e-mail." };
    const cpfExists = clients.some((client) => (client.cpf || "") === payload.cpf.trim());
    if (cpfExists) return { ok: false, message: "Já existe uma conta com esse CPF." };

    const newClient: User = {
      id: makeId("user"),
      name: payload.name.trim(),
      cpf: payload.cpf.trim(),
      email: payload.email.trim(),
      password: payload.password,
      addresses: [],
      createdAt: new Date().toISOString(),
    };

    const updatedClients = [newClient, ...clients];
    saveJson(CLIENTS_KEY, updatedClients);

    const session: User = {
      id: newClient.id,
      name: newClient.name,
      email: newClient.email,
      cpf: newClient.cpf,
      addresses: [],
      createdAt: newClient.createdAt,
    };
    setUser(session);
    saveJson(USER_KEY, session);
    return { ok: true };
  }, []);

  const updateProfile = useCallback((payload: { name: string; cpf: string }) => {
    if (!user || user.isAdmin) return { ok: false } as any;
    const clients = readJson<User[]>(CLIENTS_KEY, []);
    const updatedClients = clients.map((client) => client.id === user.id ? { ...client, name: payload.name.trim(), cpf: payload.cpf.trim() } : client);
    saveJson(CLIENTS_KEY, updatedClients);
    const updatedUser = { ...user, name: payload.name.trim(), cpf: payload.cpf.trim() };
    setUser(updatedUser);
    saveJson(USER_KEY, updatedUser);
    return { ok: true };
  }, [user]);

  const addAddress = useCallback((payload: Omit<Address, 'id'>) => {
    if (!user || user.isAdmin) return { ok: false, message: "Usuário inválido." };
    const clients = readJson<User[]>(CLIENTS_KEY, []);
    const address: Address = { ...payload, id: makeId("addr") };
    const updatedClients = clients.map((client) => client.id === user.id ? { ...client, addresses: [...(client.addresses || []), address] } : client);
    saveJson(CLIENTS_KEY, updatedClients);
    const updatedUser = { ...user, addresses: [...(user.addresses || []), address] };
    setUser(updatedUser);
    saveJson(USER_KEY, updatedUser);
    return { ok: true, address };
  }, [user]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
  }, []);

  const value = useMemo(() => ({ user, isLoggedIn: !!user, login, register, logout, updateProfile, addAddress }), [user, login, register, logout, updateProfile, addAddress]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
