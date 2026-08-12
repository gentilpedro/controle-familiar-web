export interface Transacao {
  id: number;
  descricao: string;
  valor: number;
  tipo: number;
  /** ISO "AAAA-MM-DD" — formato nativo de DateOnly na resposta da API e do <input type="date">. */
  data: string;
  pessoa: string;
  categoria: string;
}