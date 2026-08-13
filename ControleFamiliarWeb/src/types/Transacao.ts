export interface Transacao {
  id: number;
  descricao: string;
  valor: number;
  tipo: number;
  /** ISO "AAAA-MM-DD" — formato nativo de DateOnly na resposta da API e do <input type="date">. */
  data: string;
  /** Confirmada (paga/recebida) ou pendente — rótulo depende do tipo, o campo é o mesmo. */
  pago: boolean;
  pessoa: string;
  categoria: string;
  /** Null quando a transação não tem forma de pagamento — o campo é opcional. */
  formaPagamento: string | null;
  /** Ids reais — casar de volta pelo nome pra pré-selecionar um formulário de edição seria frágil. */
  pessoaId: number;
  categoriaId: number;
  formaPagamentoId: number | null;
  /** Presentes só quando a transação nasceu de um parcelamento ou de uma divisão percentual. */
  serieId: string | null;
  numeroParcela: number | null;
  totalParcelas: number | null;
}