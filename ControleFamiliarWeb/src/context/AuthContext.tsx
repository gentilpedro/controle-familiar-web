import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { api, TOKEN_STORAGE_KEY } from "../api/api";
import type {
  ApiEnvelope,
  AuthResponse,
  Familia,
  LoginPayload,
  MeResponse,
  RegistrarPayload,
  Usuario
} from "../types/Auth";

interface AuthContextValue {
  usuario: Usuario | null;
  familia: Familia | null;
  carregando: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  registrar: (payload: RegistrarPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [familia, setFamilia] = useState<Familia | null>(null);
  const [carregando, setCarregando] = useState(true);

  function aplicarSessao(resposta: AuthResponse) {
    localStorage.setItem(TOKEN_STORAGE_KEY, resposta.token);
    setUsuario(resposta.usuario);
    setFamilia(resposta.familia);
  }

  async function login(payload: LoginPayload) {
    const response = await api.post<ApiEnvelope<AuthResponse>>("/auth/login", payload);
    aplicarSessao(response.data.data!);
  }

  async function registrar(payload: RegistrarPayload) {
    const response = await api.post<ApiEnvelope<AuthResponse>>("/auth/registrar", payload);
    aplicarSessao(response.data.data!);
  }

  function logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUsuario(null);
    setFamilia(null);
  }

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!token) {
      setCarregando(false);
      return;
    }

    api
      .get<ApiEnvelope<MeResponse>>("/auth/me")
      .then((response) => {
        setUsuario(response.data.data!.usuario);
        setFamilia(response.data.data!.familia);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      })
      .finally(() => setCarregando(false));
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, familia, carregando, login, registrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  return context;
}
