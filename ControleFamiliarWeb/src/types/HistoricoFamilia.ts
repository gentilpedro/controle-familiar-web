export type AcaoHistoricoFamilia = "CriacaoFamilia" | "EntradaFamilia" | "RemocaoMembro" | "ExclusaoConta";

export interface HistoricoFamiliaItem {
  acao: AcaoHistoricoFamilia;
  nomeAlvo: string | null;
  criadoEm: string;
}
