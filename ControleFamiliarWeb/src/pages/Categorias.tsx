import { useState } from "react";
import { api } from "../api/api";
import type { Categoria } from "../types/Categoria";
import { classeBadge, textoFinalidadeCategoria } from "../utils/badge";
import { useApiResource } from "../hooks/useApiResource";

export default function Categorias() {
  const { dados: categorias, carregando, erro, recarregar } = useApiResource<Categoria>("/categorias");

  const [descricao, setDescricao] = useState("");
  const [finalidade, setFinalidade] = useState(1);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erroAcao, setErroAcao] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function criarCategoria(e: React.FormEvent) {
    e.preventDefault();

    setErroAcao("");
    setSucesso("");
    setEnviando(true);

    try {
      await api.post("/categorias", { descricao, finalidade });

      setDescricao("");
      setFinalidade(1);
      setMostrarForm(false);
      setSucesso("Categoria cadastrada com sucesso.");
      await recarregar();
    } catch {
      setErroAcao("Não foi possível cadastrar a categoria.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Categorias</h1>
          <p className="page-subtitle">Organize receitas e despesas por categoria.</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setMostrarForm(!mostrarForm)}
        >
          {mostrarForm ? "Fechar" : "Nova Categoria"}
        </button>
      </div>

      {erroAcao && <div className="auth-error">{erroAcao}</div>}
      {sucesso && <div className="auth-success">{sucesso}</div>}

      {mostrarForm && (
        <div className="card">
          <form onSubmit={criarCategoria} className="form-row categorias">
            <label className="sr-only" htmlFor="categoria-descricao">Descrição da categoria</label>
            <input
              id="categoria-descricao"
              className="input"
              placeholder="Descrição da categoria"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />

            <label className="sr-only" htmlFor="categoria-finalidade">Finalidade</label>
            <select
              id="categoria-finalidade"
              className="select"
              value={finalidade}
              onChange={(e) => setFinalidade(Number(e.target.value))}
            >
              <option value={1}>Receita</option>
              <option value={2}>Despesa</option>
              <option value={3}>Ambas</option>
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
                <th>Finalidade</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan={3}>Carregando...</td>
                </tr>
              ) : categorias.length === 0 ? (
                <tr>
                  <td colSpan={3}>Nenhuma categoria cadastrada ainda.</td>
                </tr>
              ) : (
                categorias.map((c) => (
                  <tr key={c.id}>
                    <td className="celula-id">{c.id}</td>
                    <td>{c.descricao}</td>
                    <td>
                      <span className={classeBadge(textoFinalidadeCategoria(c.finalidade))}>
                        {textoFinalidadeCategoria(c.finalidade)}
                      </span>
                    </td>
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
