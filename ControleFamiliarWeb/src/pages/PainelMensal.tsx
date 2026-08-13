import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/api";

import type { Fatura } from "../types/Fatura";
import type { Transacao } from "../types/Transacao";
import type { ApiEnvelope } from "../types/Auth";
import type { ResumoMensal } from "../types/PainelMensal";
import { classeBadge, textoTipoTransacao } from "../utils/badge";
import { formatCurrency, formatDate } from "../utils/format";
import { useApiResource } from "../hooks/useApiResource";
import { mensagemDeErro } from "../utils/erro";

// "AAAA-MM" no fuso local — o que <input type="month"> espera. Usa os
// getters locais direto (sem passar por string ISO), então não tem o mesmo
// risco de fuso que motivou o formatDate/hojeLocalISO de Transacoes.tsx.
function mesAtualLocal(): string {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  return `${ano}-${mes}`;
}

export default function PainelMensal() {
  const [mesSelecionado, setMesSelecionado] = useState(mesAtualLocal());
  const [ano, mes] = mesSelecionado.split("-").map(Number);

  // Filtro de período pela própria API (ano/mes na query). Antes isto buscava
  // uma janela de 200 lançamentos e filtrava por mês no cliente — o que
  // escondia meses inteiros assim que a família passava de 200 transações no
  // total, porque a janela só alcançava os mais recentes.
  const { dados: transacoesDoMes, carregando, erro, recarregar } = useApiResource<Transacao>(
    `/transacoes?pagina=1&tamanhoPagina=200&ano=${ano}&mes=${mes}`
  );

  // Faturas que vencem neste mês. É só aviso: a fatura não é lançamento, não
  // entra em receita/despesa/saldo — quem entra é o pagamento que o usuário
  // lança quando paga. Somar aqui contaria duas vezes (as compras do cartão
  // já estão na lista acima, cada uma na data em que foram feitas).
  const { dados: faturasDoMes } = useApiResource<Fatura>(`/faturas?ano=${ano}&mes=${mes}`);
  const totalFaturas = faturasDoMes.reduce((soma, f) => soma + f.total, 0);

  const [resumo, setResumo] = useState<ResumoMensal | null>(null);
  const [resumoCarregando, setResumoCarregando] = useState(true);
  const [resumoErro, setResumoErro] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [erroAcao, setErroAcao] = useState("");
  const [sucesso, setSucesso] = useState("");

  const buscarResumo = useCallback(async () => {
    setResumoErro("");

    try {
      const response = await api.get<ApiEnvelope<ResumoMensal>>("/painel-mensal", { params: { ano, mes } });
      setResumo(response.data.data!);
    } catch {
      setResumoErro("Não foi possível carregar o resumo do mês. Tente novamente.");
    }
  }, [ano, mes]);

  useEffect(() => {
    let cancelado = false;

    setResumoCarregando(true);
    buscarResumo().finally(() => {
      if (!cancelado) setResumoCarregando(false);
    });

    return () => {
      cancelado = true;
    };
  }, [buscarResumo]);

  // Mesmo toggle direto da tabela de Transações — só que aqui também refaz o
  // resumo, já que confirmar/desconfirmar muda receitas/despesas confirmadas
  // versus pendentes.
  async function alternarPago(t: Transacao) {
    setErroAcao("");
    setSucesso("");

    try {
      await api.patch(`/transacoes/${t.id}/pago`, { pago: !t.pago });
      await Promise.all([recarregar(), buscarResumo()]);
    } catch (e) {
      setErroAcao(mensagemDeErro(e));
    }
  }

  async function fecharMes() {
    setErroAcao("");
    setSucesso("");
    setEnviando(true);

    try {
      await api.post("/painel-mensal/fechar", { ano, mes });
      setSucesso("Mês fechado — o saldo foi lançado como transação no mês seguinte.");
      await buscarResumo();
    } catch (e) {
      setErroAcao(mensagemDeErro(e));
    } finally {
      setEnviando(false);
    }
  }

  if (erro) return <div className="auth-error">{erro}</div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Painel do Mês</h1>
          <p className="page-subtitle">Quanto entrou, quanto saiu, e quanto sobra pra levar pro próximo mês.</p>
        </div>

        <div>
          <label className="sr-only" htmlFor="painel-mes">Mês</label>
          <input
            id="painel-mes"
            className="input"
            type="month"
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
          />
        </div>
      </div>

      {erroAcao && <div className="auth-error">{erroAcao}</div>}
      {sucesso && <div className="auth-success">{sucesso}</div>}

      {resumoErro && <div className="auth-error">{resumoErro}</div>}

      {resumoCarregando || !resumo ? (
        <p>Carregando resumo...</p>
      ) : (
        <>
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-label">Receitas confirmadas</div>
              <div className="summary-value receita">
                {formatCurrency(resumo.totalReceitasConfirmadas)}
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-label">Despesas confirmadas</div>
              <div className="summary-value despesa">
                {formatCurrency(resumo.totalDespesasConfirmadas)}
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-label">Saldo do mês</div>
              <div
                className="summary-value saldo"
                style={{ color: resumo.saldo >= 0 ? "var(--credito)" : "var(--debito)" }}
              >
                {formatCurrency(resumo.saldo)}
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-label">Pendências</div>
              <div style={{ display: "flex", gap: 16 }}>
                <div>
                  <div className="summary-label" style={{ marginBottom: 4 }}>A receber</div>
                  <div className="summary-value receita" style={{ fontSize: 18 }}>
                    {formatCurrency(resumo.totalReceitasPendentes)}
                  </div>
                </div>
                <div>
                  <div className="summary-label" style={{ marginBottom: 4 }}>A pagar</div>
                  <div className="summary-value despesa" style={{ fontSize: 18 }}>
                    {formatCurrency(resumo.totalDespesasPendentes)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/*
            Fora da summary-grid de propósito: aqueles cards são o saldo do
            mês, e a fatura não entra nele. Aqui embaixo, com o aviso
            explícito, não há como confundir com mais uma parcela da conta.
          */}
          {faturasDoMes.length > 0 && (
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="summary-label">Faturas de cartão vencendo neste mês</div>
              <div className="summary-value despesa">{formatCurrency(totalFaturas)}</div>
              <p className="empty-text" style={{ padding: "8px 0 0" }}>
                {faturasDoMes
                  .map((f) => `${f.formaPagamento}: ${formatCurrency(f.total)} em ${formatDate(f.dataVencimento)}`)
                  .join(" · ")}
                . Não entra no saldo acima — o que conta é o pagamento que você lançar.{" "}
                <Link to="/painel/faturas">Ver faturas</Link>
              </p>
            </div>
          )}

          <div className="card" style={{ marginBottom: 24 }}>
            {resumo.mesFechado ? (
              <p className="empty-text" style={{ margin: 0 }}>
                Mês fechado em {formatDate(resumo.fechadoEm!)}.
              </p>
            ) : (
              <button className="btn btn-primary" onClick={fecharMes} disabled={enviando}>
                {enviando ? "Fechando..." : "Fechar mês e levar saldo pro próximo"}
              </button>
            )}
          </div>
        </>
      )}

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th className="celula-id">Data</th>
                <th>Descrição</th>
                <th className="celula-valor">Valor</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Pessoa</th>
                <th>Categoria</th>
                <th>Pagamento</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan={8}>Carregando...</td>
                </tr>
              ) : transacoesDoMes.length === 0 ? (
                <tr>
                  <td colSpan={8}>Nenhuma transação neste mês.</td>
                </tr>
              ) : (
                transacoesDoMes.map((t) => (
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
                    <td data-rotulo="Status">
                      <button
                        type="button"
                        className={`badge badge-btn ${t.pago ? "badge-receita" : "badge-ambas"}`}
                        onClick={() => alternarPago(t)}
                      >
                        {t.pago ? (textoTipoTransacao(t.tipo) === "Receita" ? "Recebido" : "Pago") : "Pendente"}
                      </button>
                    </td>
                    <td data-rotulo="Pessoa">{t.pessoa}</td>
                    <td data-rotulo="Categoria">{t.categoria}</td>
                    <td data-rotulo="Pagamento">{t.formaPagamento ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
