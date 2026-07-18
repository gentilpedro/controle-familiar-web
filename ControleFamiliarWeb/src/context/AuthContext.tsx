import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { api, TOKEN_STORAGE_KEY } from "../api/api";
import { AuthContext } from "./authContextObject";
import type {
  ApiEnvelope,
  AuthResponse,
  Familia,
  LoginPayload,
  MeResponse,
  RegistrarPayload,
  Usuario
} from "../types/Auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [familia, setFamilia] = useState<Familia | null>(null);
  const [carregando, setCarregando] = useState(() => !!localStorage.getItem(TOKEN_STORAGE_KEY));

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

  function atualizarUsuario(novoUsuario: Usuario) {
    setUsuario(novoUsuario);
  }

  function atualizarFamilia(novaFamilia: Familia) {
    setFamilia(novaFamilia);

    setUsuario((atual) => {
      if (!atual) return atual;
      const eu = novaFamilia.membros.find((m) => m.id === atual.id);
      return eu ? { ...atual, ehAdministrador: eu.ehAdministrador } : atual;
    });
  }

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!token) return;

    let cancelado = false;

    api
      .get<ApiEnvelope<MeResponse>>("/auth/me")
      .then((response) => {
        if (cancelado) return;
        setUsuario(response.data.data!.usuario);
        setFamilia(response.data.data!.familia);
      })
      .catch(() => {
        if (!cancelado) localStorage.removeItem(TOKEN_STORAGE_KEY);
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ usuario, familia, carregando, login, registrar, logout, atualizarFamilia, atualizarUsuario }}
    >
      {children}
    </AuthContext.Provider>
  );
}
