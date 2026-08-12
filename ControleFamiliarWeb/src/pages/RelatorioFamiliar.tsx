import { useEffect, useState } from "react";
import { api } from "../api/api";
import type { Relatorio } from "../types/Relatorios";
import type { HistoricoFamiliaItem, AcaoHistoricoFamilia } from "../types/HistoricoFamilia";
import { formatCurrency, formatDate } from "../utils/format";

/*
 * Mesmo texto/cor usado no resto do app pra cada tipo de evento: entrada lê
 * como crédito (alguém chegou), remoção como débito (tirada por um admin),
 * criação e saída voluntária ficam neutras — não são "ganho" nem "perda" da
 * família no mesmo sentido.
 */
function classeBadgeHistorico(acao: AcaoHistoricoFamilia): string {
  switch (acao) {
    case "EntradaFamilia":
      return "badge badge-receita";
    case "RemocaoMembro":
      return "badge badge-despesa";
    default:
      return "badge badge-ambas";
  }
}

function textoAcaoHistorico(acao: AcaoHistoricoFamilia): string {
  switch (acao) {
    case "CriacaoFamilia":
      return "Fundou a família";
    case "EntradaFamilia":
      return "Entrou na família";
    case "RemocaoMembro":
      return "Removido da família";
    case "ExclusaoConta":
      return "Saiu da família";
  }
}

export default function RelatorioFamiliar() {
  const [relatorio, setRelatorio] = useState<Relatorio>();
  const [historico, setHistorico] = useState<HistoricoFamiliaItem[]>([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let cancelado = false;

    Promise.all([
      api.get<Relatorio>("/relatorios/totais-por-pessoa"),
      api.get<HistoricoFamiliaItem[]>("/familia/historico")
    ])
      .then(([relatorioResponse, historicoResponse]) => {
        if (cancelado) return;
        setRelatorio(relatorioResponse.data);
        setHistorico(historicoResponse.data);
      })
      .catch(() => {
        if (!cancelado) setErro("Não foi possível carregar o relatório familiar. Tente novamente.");
      });

    return () => {
      cancelado = true;
    };
  }, []);

  if (erro) return <div className="auth-error">{erro}</div>;

  if (!relatorio) return <p>Carregando...</p>;

  // Participação de cada pessoa no total da família — 0 quando a família
  // inteira não teve receita/despesa nenhuma, pra não dividir por zero.
  function participacao(valor: number, total: number): string {
    if (total === 0) return "—";
    return `${((valor / total) * 100).toFixed(1)}%`;
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Relatório Familiar</h1>
          <p className="page-subtitle">
            Quanto cada pessoa da família representa no total, e quem esteve na família ao longo do tempo.
          </p>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Saldo por pessoa</h2>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Pessoa</th>
                <th className="celula-valor">Receitas</th>
                <th className="celula-valor">% Receitas</th>
                <th className="celula-valor">Despesas</th>
                <th className="celula-valor">% Despesas</th>
                <th className="celula-valor">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {relatorio.pessoas.length === 0 ? (
                <tr>
                  <td colSpan={6}>Nenhuma transação registrada ainda.</td>
                </tr>
              ) : (
                relatorio.pessoas.map((p) => (
                  <tr key={p.pessoa}>
                    <td data-rotulo="Pessoa">{p.pessoa}</td>
                    <td className="celula-valor credito" data-rotulo="Receitas">
                      {formatCurrency(p.totalReceitas)}
                    </td>
                    <td className="celula-valor" data-rotulo="% Receitas">
                      {participacao(p.totalReceitas, relatorio.totalReceitas)}
                    </td>
                    <td className="celula-valor debito" data-rotulo="Despesas">
                      {formatCurrency(p.totalDespesas)}
                    </td>
                    <td className="celula-valor" data-rotulo="% Despesas">
                      {participacao(p.totalDespesas, relatorio.totalDespesas)}
                    </td>
                    <td
                      className={p.saldo >= 0 ? "celula-valor credito" : "celula-valor debito"}
                      data-rotulo="Saldo"
                    >
                      {formatCurrency(p.saldo)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Histórico da família</h2>

        {historico.length === 0 ? (
          <p className="empty-text">Nenhum evento registrado ainda.</p>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Pessoa</th>
                  <th>Evento</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {historico.map((item, indice) => (
                  // Sem id próprio no item — nome + ação + data não repete
                  // no mesmo segundo pra uma mesma família.
                  <tr key={`${item.criadoEm}-${indice}`}>
                    <td data-rotulo="Pessoa">{item.nomeAlvo ?? "—"}</td>
                    <td data-rotulo="Evento">
                      <span className={classeBadgeHistorico(item.acao)}>
                        {textoAcaoHistorico(item.acao)}
                      </span>
                    </td>
                    <td className="celula-id" data-rotulo="Data">{formatDate(item.criadoEm)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
