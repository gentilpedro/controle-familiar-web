export interface ResumoMensal {
  totalReceitasConfirmadas: number;
  totalReceitasPendentes: number;
  totalDespesasConfirmadas: number;
  totalDespesasPendentes: number;
  /** Receitas confirmadas − despesas confirmadas — pendência não entra na conta. */
  saldo: number;
  mesFechado: boolean;
  /** Datetime ISO completo (com hora) — passa por formatDate normalmente, sem o cuidado de fuso do campo Data (sem hora). */
  fechadoEm: string | null;
}
