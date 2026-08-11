import { createContext } from "react";
import type { Familia, LoginPayload, RegistrarPayload, Usuario } from "../types/Auth";

export interface AuthContextValue {
  usuario: Usuario | null;
  familia: Familia | null;
  carregando: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  registrar: (payload: RegistrarPayload) => Promise<void>;
  // Assíncrono porque agora chama a API: só ela consegue apagar o cookie
  // HttpOnly e revogar o token no servidor.
  logout: () => Promise<void>;
  atualizarFamilia: (familia: Familia) => void;
  atualizarUsuario: (usuario: Usuario) => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
