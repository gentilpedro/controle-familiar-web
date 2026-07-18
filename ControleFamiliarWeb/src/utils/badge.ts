type TextoBadge = "Receita" | "Despesa" | "Ambas";

export function classeBadge(texto: TextoBadge): string {
  switch (texto) {
    case "Receita":
      return "badge badge-receita";
    case "Despesa":
      return "badge badge-despesa";
    case "Ambas":
      return "badge badge-ambas";
  }
}

export function textoTipoTransacao(tipo: number): "Receita" | "Despesa" {
  return tipo === 1 ? "Receita" : "Despesa";
}

export function textoFinalidadeCategoria(finalidade: number): TextoBadge {
  if (finalidade === 1) return "Receita";
  if (finalidade === 2) return "Despesa";
  return "Ambas";
}
