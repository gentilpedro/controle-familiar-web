export interface Categoria {
  id: number;
  descricao: string;
  finalidade: number;
  // Categoria base do sistema: vem para todas as famílias e a API recusa
  // editar ou excluir. Serve para não oferecer a ação que daria 403.
  ehDoSistema: boolean;
}

export interface CategoriaResumo{
  categoria: string;
  total: number;
}