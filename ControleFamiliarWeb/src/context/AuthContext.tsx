import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { api } from "../api/api";
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
  // Começa carregando sempre: o cookie de sessão é HttpOnly, então não há como
  // o JavaScript olhar e saber de antemão se existe sessão. A única forma é
  // perguntar à API — e até a resposta chegar, o estado é "não sei".
  const [carregando, setCarregando] = useState(true);

  function aplicarSessao(resposta: AuthResponse) {
    // Nada é guardado no navegador: quem grava a sessão é a API, no cookie
    // HttpOnly da própria resposta. O `resposta.token` existe para clientes de
    // API (Scalar, curl) e é deliberadamente ignorado aqui.
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

  async function logout() {
    // Só a API consegue apagar um cookie HttpOnly, e o endpoint também revoga
    // o token no servidor. Se a chamada falhar (rede fora, sessão já expirada),
    // ainda assim limpamos o estado local — do contrário a interface ficaria
    // presa mostrando um usuário logado que não é mais.
    try {
      await api.post("/auth/logout");
    } catch {
      // Sem tratamento: a limpeza abaixo acontece de qualquer forma.
    }

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

  // Uma chamada a /auth/me no start é o que descobre se há sessão: 200 = o
  // cookie é válido, 401 = não há sessão. Antes dava para pular essa chamada
  // quando não havia token no localStorage; com cookie HttpOnly não dá, porque
  // o JavaScript não enxerga o cookie.
  useEffect(() => {
    let cancelado = false;

    api
      .get<ApiEnvelope<MeResponse>>("/auth/me")
      .then((response) => {
        if (cancelado) return;
        setUsuario(response.data.data!.usuario);
        setFamilia(response.data.data!.familia);
      })
      .catch(() => {
        // 401 aqui é o caso normal de visitante sem sessão, não um erro.
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
