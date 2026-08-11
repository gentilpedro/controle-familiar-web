import { useState } from "react";
import { api } from "../api/api";

import type { Transacao } from "../types/Transacao";
import type { Categoria } from "../types/Categoria";
import type { Pessoa } from "../types/Pessoa";
import { classeBadge, textoTipoTransacao } from "../utils/badge";
import { formatCurrency } from "../utils/format";
import { useApiResource } from "../hooks/useApiResource";
import { useApiPaginado } from "../hooks/useApiPaginado";
import Paginacao from "../components/Paginacao";

// A API aceita até 200 por página; 20 mantém a tabela numa tela sem rolagem longa.
const TAMANHO_PAGINA = 20;

export default function Transacoes() {
  const {
    dados: transacoes,
    pagina,
    totalItens,
    totalPaginas,
    carregando,
    erro,
    irPara,
    recarregar,
  } = useApiPaginado<Transacao>("/transacoes", TAMANHO_PAGINA);

  // Pessoas e categorias alimentam os selects do formulário e vêm inteiras
  const { dados: pessoas } = useApiResource<Pessoa>("/pessoas");
  const { dados: categorias } = useApiResource<Categoria>("/categorias");

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState<number>(0);
  const [tipo, setTipo] = useState(1);
  const [pessoaId, setPessoaId] = useState<number | "">("");
  const [categoriaId, setCategoriaId] = useState<number | "">("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erroAcao, setErroAcao] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function criarTransacao(e: React.FormEvent) {
    e.preventDefault();

    setErroAcao("");
    setSucesso("");
    setEnviando(true);

    try {
      await api.post("/transacoes", {
        descricao,
        valor,
        tipo,
        pessoaId,
        categoriaId
      });

      setDescricao("");
      setValor(0);
      setTipo(1);
      setPessoaId("");
      setCategoriaId("");
      setMostrarForm(false);
      setSucesso("Transação cadastrada com sucesso.");

      await recarregar();
    } catch {
      setErroAcao("Não foi possível cadastrar a transação.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transações</h1>
          <p className="page-subtitle">Cadastre e acompanhe todas as movimentações financeiras.</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setMostrarForm(!mostrarForm)}
        >
          {mostrarForm ? "Fechar" : "Nova Transação"}
        </button>
      </div>

      {erroAcao && <div className="auth-error">{erroAcao}</div>}
      {sucesso && <div className="auth-success">{sucesso}</div>}

      {mostrarForm && (
        <div className="card">
          <form onSubmit={criarTransacao} className="form-row">
            <label className="sr-only" htmlFor="transacao-descricao">Descrição</label>
            <input
              id="transacao-descricao"
              className="input"
              placeholder="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />

            <label className="sr-only" htmlFor="transacao-valor">Valor</label>
            <input
              id="transacao-valor"
              className="input"
              type="number"
              placeholder="Valor"
              value={valor}
              onChange={(e) => setValor(Number(e.target.value))}
            />

            <label className="sr-only" htmlFor="transacao-tipo">Tipo</label>
            <select
              id="transacao-tipo"
              className="select"
              value={tipo}
              onChange={(e) => setTipo(Number(e.target.value))}
            >
              <option value={1}>Receita</option>
              <option value={2}>Despesa</option>
            </select>

            <label className="sr-only" htmlFor="transacao-pessoa">Pessoa</label>
            <select
              id="transacao-pessoa"
              className="select"
              value={pessoaId}
              onChange={(e) => setPessoaId(Number(e.target.value))}
            >
              <option value="">Selecionar Pessoa</option>
              {pessoas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="transacao-categoria">Categoria</label>
            <select
              id="transacao-categoria"
              className="select"
              value={categoriaId}
              onChange={(e) => setCategoriaId(Number(e.target.value))}
            >
              <option value="">Selecionar Categoria</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.descricao}
                </option>
              ))}
            </select>

            <button className="btn btn-success" type="submit" disabled={enviando}>
              {enviando ? "Salvando..." : "Salvar"}
            </button>

            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => setMostrarForm(false)}
            >
              Cancelar
            </button>
          </form>
        </div>
      )}

      <div className="card">
        {erro && <div className="auth-error">{erro}</div>}

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Descrição</th>
                <th className="celula-valor">Valor</th>
                <th>Tipo</th>
                <th>Pessoa</th>
                <th>Categoria</th>
              </tr>
            </thead>
            <tbody>
              {/*
                "Carregando" só na primeira carga: na troca de página as linhas
                antigas ficam à vista até as novas chegarem, senão a tabela
                pisca vazia e a altura da página pula a cada clique.
              */}
              {carregando && transacoes.length === 0 ? (
                <tr>
                  <td colSpan={6}>Carregando...</td>
                </tr>
              ) : transacoes.length === 0 ? (
                <tr>
                  <td colSpan={6}>Nenhuma transação cadastrada ainda.</td>
                </tr>
              ) : (
                transacoes.map((t) => (
                  <tr key={t.id}>
                    <td className="celula-id">{t.id}</td>
                    <td>{t.descricao}</td>
                    {/* Cor do valor segue o tipo, como num extrato: receita em
                        credito, despesa em debito. O badge ao lado mantem a
                        distincao legivel sem depender da cor. */}
                    <td
                      className={
                        textoTipoTransacao(t.tipo) === "Receita"
                          ? "celula-valor credito"
                          : "celula-valor debito"
                      }
                    >
                      {formatCurrency(Number(t.valor))}
                    </td>
                    <td>
                      <span className={classeBadge(textoTipoTransacao(t.tipo))}>
                        {textoTipoTransacao(t.tipo)}
                      </span>
                    </td>
                    <td>{t.pessoa}</td>
                    <td>{t.categoria}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Paginacao
          pagina={pagina}
          totalPaginas={totalPaginas}
          totalItens={totalItens}
          tamanhoPagina={TAMANHO_PAGINA}
          carregando={carregando}
          itemSingular="lançamento"
          itemPlural="lançamentos"
          onIrPara={irPara}
        />
      </div>
    </>
  );
}
