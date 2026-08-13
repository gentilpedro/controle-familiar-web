export interface FormaPagamento {
  id: number;
  descricao: string;
  // Forma base do sistema (Pix, Dinheiro, Saque): vem para todas as famílias
  // e a API recusa editar ou excluir. Serve para não oferecer a ação que
  // daria 403 — mesmo papel de Categoria.ehDoSistema.
  ehDoSistema: boolean;
  // Cartão de crédito: tem ciclo de fatura. Equivale aos dois dias
  // preenchidos — a API já entrega o booleano pronto pra não repetir a regra
  // aqui.
  ehCartaoCredito: boolean;
  diaFechamento: number | null;
  diaVencimento: number | null;
  // Categoria em que o pagamento da fatura é lançado (ex.: "Fatura
  // Santander"). Nada é lançado automaticamente: serve pra tela reconhecer o
  // pagamento que o usuário faz à mão.
  categoriaFaturaId: number | null;
  categoriaFatura: string | null;
}
