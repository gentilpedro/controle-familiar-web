export function formatCurrency(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

/**
 * Aceita tanto datetime completo (`criadoEm`, com hora) quanto DateOnly puro
 * da API (`transacao.data`, "AAAA-MM-DD"). As duas formas precisam de
 * tratamento diferente: `new Date("2026-08-15")` sem componente de hora é
 * interpretado como meia-noite UTC — num fuso atrás de UTC (Brasil, UTC-3)
 * isso volta um dia na exibição. Data-only monta o Date a partir dos
 * componentes locais, sem passar pelo parser de string.
 */
export function formatDate(isoDateTime: string): string {
  const somenteData = /^\d{4}-\d{2}-\d{2}$/.test(isoDateTime);

  const data = somenteData
    ? (() => {
        const [ano, mes, dia] = isoDateTime.split("-").map(Number);
        return new Date(ano, mes - 1, dia);
      })()
    : new Date(isoDateTime);

  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}
