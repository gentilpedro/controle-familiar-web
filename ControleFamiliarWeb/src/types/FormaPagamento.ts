export interface FormaPagamento {
  id: number;
  descricao: string;
  // Forma base do sistema (Pix, Dinheiro, Saque): vem para todas as famílias
  // e a API recusa editar ou excluir. Serve para não oferecer a ação que
  // daria 403 — mesmo papel de Categoria.ehDoSistema.
  ehDoSistema: boolean;
}
