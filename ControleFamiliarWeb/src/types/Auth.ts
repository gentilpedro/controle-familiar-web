export interface Usuario {
  id: number;
  nome: string;
  email: string;
  ehAdministrador: boolean;
}

export interface Membro {
  id: number;
  nome: string;
  ehAdministrador: boolean;
}

export interface Familia {
  id: number;
  nome: string;
  codigoConvite: string;
  membros: Membro[];
}

export interface AuthResponse {
  token: string;
  expiraEm: string;
  usuario: Usuario;
  familia: Familia;
}

export interface MeResponse {
  usuario: Usuario;
  familia: Familia;
}

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface RegistrarPayload {
  nome: string;
  email: string;
  senha: string;
  modoFamilia: "Nova" | "Entrar";
  nomeFamilia?: string;
  codigoConvite?: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
}
