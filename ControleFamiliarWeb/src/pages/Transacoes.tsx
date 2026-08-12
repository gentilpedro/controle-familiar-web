import { useState } from "react";
import { api } from "../api/api";

import type { Transacao } from "../types/Transacao";
import type { Categoria } from "../types/Categoria";
import type { Pessoa } from "../types/Pessoa";
import { classeBadge, textoTipoTransacao } from "../utils/badge";
import { formatCurrency } from "../utils/format";
import { useApiResource } from "../hooks/useApiResource";
import { mensagemDeErro } from "../utils/erro";

// Mesma numeração de TipoTransacao (1 Receita, 2 Despesa) usada por
// Categoria.finalidade — é o que permite herdar o tipo direto da categoria
// sem tradução.
const FINALIDADE_AMBAS = 3;

export default function Transacoes() {
  const { dados: transacoes, carregando, erro, recarregar } = useApiResource<Transacao>("/transacoes");
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

  // A categoria já carrega se é Receita, Despesa ou Ambas — perguntar Tipo de
  // novo quando ela já decide sozinha é pedir a mesma informação duas vezes
  // (e abre brecha pra escolher uma combinação que a API rejeita). Só quando
  // a categoria aceita as duas finalidades é que a escolha continua manual.
  const categoriaSelecionada = categorias.find((c) => c.id === categoriaId);
  const tipoHerdaDaCategoria = categoriaSelecionada != null && categoriaSelecionada.finalidade !== FINALIDADE_AMBAS;

  function handleCategoriaChange(id: number) {
    setCategoriaId(id);

    const categoria = categorias.find((c) => c.id === id);
    if (categoria && categoria.finalidade !== FINALIDADE_AMBAS) {
      setTipo(categoria.finalidade);
    }
  }

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
    } catch (e) {
      setErroAcao(mensagemDeErro(e));
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

            {tipoHerdaDaCategoria ? (
              // Mesma altura de .select (44px), pra não pular o layout ao
              // trocar de categoria: só o conteúdo muda, o slot no grid não.
              <span
                className={classeBadge(textoTipoTransacao(tipo))}
                style={{ height: 44, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
              >
                {textoTipoTransacao(tipo)}
              </span>
            ) : (
              <>
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
              </>
            )}

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
              onChange={(e) => handleCategoriaChange(Number(e.target.value))}
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
                <th className="celula-id">ID</th>
                <th>Descrição</th>
                <th className="celula-valor">Valor</th>
                <th>Tipo</th>
                <th>Pessoa</th>
                <th>Categoria</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
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
                    <td className="celula-id" data-rotulo="ID">{t.id}</td>
                    <td data-rotulo="Descrição">{t.descricao}</td>
                    {/* Cor do valor segue o tipo, como num extrato: receita em
                        credito, despesa em debito. O badge ao lado mantem a
                        distincao legivel sem depender da cor. */}
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
    </>
  );
}
