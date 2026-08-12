export interface Pessoa {
  id: number;
  nome: string;
  idade: number;
  /** True quando esta pessoa representa uma conta da família — nasceu no cadastro, não à mão. */
  ehMembro: boolean;
}