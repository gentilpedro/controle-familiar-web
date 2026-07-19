export interface AssinaturaStatus {
  temAcesso: boolean;
  statusIndividual: string;
  statusFamilia: string;
  trialIndividualUsado: boolean;
  assinaturaIndividualValidaAte: string | null;
  assinaturaFamiliaValidaAte: string | null;
}

export type TipoPlano = 1 | 2;

export interface CheckoutResponse {
  url: string;
}

export interface PortalResponse {
  url: string;
}
