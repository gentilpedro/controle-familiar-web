import type { Transacao } from "./Transacao";

/**
 * Um ciclo de fatura de um cartão. É calculado pela API a partir das
 * transações lançadas com aquela forma de pagamento — não existe cadastro de
 * fatura, nada é gerado nem confirmado automaticamente.
 */
export interface Fatura {
  formaPagamentoId: number;
  formaPagamento: string;
  /** Primeiro dia do ciclo (dia seguinte ao fechamento anterior). */
  dataInicio: string;
  /** Último dia que ainda entra nesta fatura. */
  dataFechamento: string;
  /** Dia de pagar. */
  dataVencimento: string;
  /** Fechada = total final; aberta = ainda acumulando. */
  fechada: boolean;
  /** Despesas menos receitas do ciclo (estorno abate). */
  total: number;
  quantidadeLancamentos: number;
  categoriaFaturaId: number | null;
  categoriaFatura: string | null;
  /** Despesas já lançadas na categoria da fatura no mês do vencimento. Null sem categoria vinculada. */
  totalPagamentosLancados: number | null;
  lancamentos: Transacao[];
}
