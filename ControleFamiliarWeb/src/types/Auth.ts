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
  idade: number;
  modoFamilia: "Nova" | "Entrar";
  nomeFamilia?: string;
  codigoConvite?: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface AtualizarPerfilPayload {
  nome?: string;
  email?: string;
}

export interface ExportacaoPessoa {
  id: number;
  nome: string;
  idade: number;
}

export interface ExportacaoCategoria {
  id: number;
  descricao: string;
  finalidade: string;
}

export interface ExportacaoTransacao {
  id: number;
  descricao: string;
  valor: number;
  tipo: string;
  pessoa: string;
  categoria: string;
}

export interface ExportacaoDados {
  usuario: Usuario;
  familia: {
    id: number;
    nome: string;
    codigoConvite: string;
    criadoEm: string;
  };
  pessoas: ExportacaoPessoa[];
  categorias: ExportacaoCategoria[];
  transacoes: ExportacaoTransacao[];
}
