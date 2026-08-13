import { useState } from "react";
import { Link } from "react-router-dom";

import type { Fatura } from "../types/Fatura";
import { classeBadge, textoTipoTransacao } from "../utils/badge";
import { formatCurrency, formatDate } from "../utils/format";
import { useApiResource } from "../hooks/useApiResource";

// "AAAA-MM" no fuso local — o que <input type="month"> espera, mesmo helper
// do Painel do Mês e da tela de Transações.
function mesAtualLocal(): string {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  return `${ano}-${mes}`;
}

export default function Faturas() {
  const [mesSelecionado, setMesSelecionado] = useState(mesAtualLocal());
  const [ano, mes] = mesSelecionado.split("-").map(Number);

  // Faturas que VENCEM no mês escolhido — é o mês em que o dinheiro sai, que
  // foi a leitura pedida. A fatura que vence em setembro costuma ser de
  // compras de agosto, e o período aparece em cada cartão.
  const { dados: faturas, carregando, erro } = useApiResource<Fatura>(
    `/faturas?ano=${ano}&mes=${mes}`
  );

  // A fatura aberta de cada cartão fica no topo, independente do mês
  // escolhido: é o "quanto já gastei neste ciclo", a pergunta do dia a dia.
  // Ela só apareceria na parte de baixo no mês em que vier a vencer.
  const { dados: abertas } = useApiResource<Fatura>("/faturas/abertas");

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Faturas</h1>
          <p className="page-subtitle">
            O que cada cartão acumulou no ciclo e quando vence. Só entra o que foi lançado com a
            forma de pagamento do cartão — Pix, débito e dinheiro ficam de fora.
          </p>
        </div>

        <div>
          <label className="sr-only" htmlFor="faturas-mes">Mês de vencimento</label>
          <input
            id="faturas-mes"
            className="input"
            type="month"
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
          />
        </div>
      </div>

      {erro && <div className="auth-error">{erro}</div>}

      {abertas.length > 0 && (
        <div className="summary-grid">
          {abertas.map((f) => (
            <div className="summary-card" key={`aberta-${f.formaPagamentoId}`}>
              <div className="summary-label">{f.formaPagamento} · fatura aberta</div>
              <div className="summary-value despesa">{formatCurrency(f.total)}</div>
              <div style={{ color: "var(--tinta-suave)", fontSize: 13 }}>
                Fecha em {formatDate(f.dataFechamento)} · vence em {formatDate(f.dataVencimento)}
              </div>
            </div>
          ))}
        </div>
      )}

      {carregando ? (
        <p>Carregando faturas...</p>
      ) : faturas.length === 0 ? (
        <div className="card">
          <p className="empty-text" style={{ margin: 0 }}>
            {abertas.length === 0 ? (
              <>
                Nenhum cartão de crédito configurado ainda. Em{" "}
                <Link to="/painel/formas-pagamento">Formas de Pagamento</Link>, marque uma forma como
                cartão de crédito e informe o dia em que a fatura fecha e o dia em que vence.
              </>
            ) : (
              "Nenhuma fatura vence neste mês."
            )}
          </p>
        </div>
      ) : (
        faturas.map((f) => (
          <div className="card" key={`${f.formaPagamentoId}-${f.dataFechamento}`} style={{ marginBottom: 24 }}>
            <div className="page-header" style={{ marginBottom: 16 }}>
              <div>
                <h2 className="page-title" style={{ fontSize: 22 }}>
                  {f.formaPagamento}{" "}
                  {/*
                    Cores reaproveitadas do badge de Tipo, como o toggle de
                    Pago/Pendente já faz — âmbar pra "ainda em aberto",
                    vermelho pra "valor final, é o que vai sair".
                  */}
                  <span className={`badge ${f.fechada ? "badge-despesa" : "badge-ambas"}`}>
                    {f.fechada ? "Fechada" : "Aberta"}
                  </span>
                </h2>
                <p className="page-subtitle">
                  Compras de {formatDate(f.dataInicio)} a {formatDate(f.dataFechamento)} ·{" "}
                  {f.quantidadeLancamentos === 1
                    ? "1 lançamento"
                    : `${f.quantidadeLancamentos} lançamentos`}
                </p>
              </div>

              <div style={{ textAlign: "right" }}>
                <div className="summary-label">Vence em {formatDate(f.dataVencimento)}</div>
                <div className="summary-value despesa">{formatCurrency(f.total)}</div>
              </div>
            </div>

            <p className="empty-text" style={{ padding: "0 0 16px" }}>
              {situacaoDoPagamento(f)}
            </p>

            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th className="celula-id">Data</th>
                    <th>Descrição</th>
                    <th className="celula-valor">Valor</th>
                    <th>Tipo</th>
                    <th>Pessoa</th>
                    <th>Categoria</th>
                  </tr>
                </thead>
                <tbody>
                  {f.lancamentos.length === 0 ? (
                    <tr>
                      <td colSpan={6}>Nenhum lançamento neste ciclo.</td>
                    </tr>
                  ) : (
                    f.lancamentos.map((t) => (
                      <tr key={t.id}>
                        <td className="celula-id" data-rotulo="Data">{formatDate(t.data)}</td>
                        <td data-rotulo="Descrição">
                          {t.descricao}
                          {t.totalParcelas != null && (
                            <span className="badge" style={{ marginLeft: 8 }}>
                              {t.numeroParcela}/{t.totalParcelas}
                            </span>
                          )}
                        </td>
                        <td
                          data-rotulo="Valor"
                          className={
                            textoTipoTransacao(t.tipo) === "Receita"
                              ? "celula-valor credito"
                              : "celula-valor debito"
                          }
                        >
                          {formatCurrency(Number(t.valor))}
                        </td>
                        <td data-rotulo="Tipo">
                          <span className={classeBadge(textoTipoTransacao(t.tipo))}>
                            {textoTipoTransacao(t.tipo)}
                          </span>
                        </td>
                        <td data-rotulo="Pessoa">{t.pessoa}</td>
                        <td data-rotulo="Categoria">{t.categoria}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </>
  );
}

/**
 * Nada é lançado automaticamente: o pagamento continua sendo uma transação
 * que o usuário cria. Esta linha só compara o que já existe na categoria
 * vinculada, no mês do vencimento, com o total da fatura.
 */
function situacaoDoPagamento(f: Fatura): string {
  if (f.categoriaFaturaId == null)
    return "Sem categoria de pagamento vinculada — vincule uma em Formas de Pagamento para acompanhar aqui se a fatura já foi paga.";

  const lancado = f.totalPagamentosLancados ?? 0;

  if (lancado === 0)
    return `Nenhum pagamento lançado em "${f.categoriaFatura}" no mês do vencimento.`;

  if (lancado === f.total)
    return `Pagamento lançado em "${f.categoriaFatura}": ${formatCurrency(lancado)}.`;

  return `Pagamento lançado em "${f.categoriaFatura}": ${formatCurrency(lancado)} — diferente do total desta fatura (${formatCurrency(f.total)}).`;
}
