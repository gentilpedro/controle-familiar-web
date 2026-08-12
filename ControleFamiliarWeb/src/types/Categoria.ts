export interface Categoria {
  id: number;
  descricao: string;
  finalidade: number;
  // Categoria base do sistema: vem para todas as famílias e a API recusa
  // editar ou excluir. Serve para não oferecer a ação que daria 403.
  ehDoSistema: boolean;
  // Libera o fluxo de salário por percentual — hoje só a categoria de
  // sistema "Salário" tem isto. Usar o flag em vez de comparar descricao
  // evita o front depender de um nome de categoria específico.
  aceitaDivisaoPercentual: boolean;
}

export interface CategoriaResumo{
  categoria: string;
  total: number;
}