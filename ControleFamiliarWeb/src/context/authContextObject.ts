import { createContext } from "react";
import type { Familia, LoginPayload, RegistrarPayload, Usuario } from "../types/Auth";

export interface AuthContextValue {
  usuario: Usuario | null;
  familia: Familia | null;
  carregando: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  registrar: (payload: RegistrarPayload) => Promise<void>;
  logout: () => void;
  atualizarFamilia: (familia: Familia) => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
