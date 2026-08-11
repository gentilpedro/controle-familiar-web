import { useState } from "react";
import { api } from "../api/api";
import type { Categoria } from "../types/Categoria";
import Modal from "../components/Modal";
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

  const [editModal, setEditModal] = useState(false);
  const [categoriaAtual, setCategoriaAtual] = useState<Categoria | null>(null);

  function limparMensagens() {
    setErroAcao("");
    setSucesso("");
  }

  function abrirEditar(categoria: Categoria) {
    limparMensagens();
    setCategoriaAtual(categoria);
    setDescricao(categoria.descricao);
    setFinalidade(categoria.finalidade);
    setEditModal(true);
  }

  function fecharEditar() {
    setEditModal(false);
    // O formulario de criacao divide estes dois campos com o modal: sem a
    // limpeza, "Nova Categoria" abriria preenchido com o que foi editado.
    setDescricao("");
    setFinalidade(1);
  }

  async function salvarEdicao() {
    if (!categoriaAtual) return;

    // O PATCH ignora campo vazio (atualizacao parcial), entao salvar sem
    // descricao responderia 200 sem mudar nada — parece que salvou e nao salvou.
    if (!descricao.trim()) {
      setErroAcao("Informe a descrição da categoria.");
      return;
    }

    limparMensagens();
    setEnviando(true);

    try {
      await api.patch(`/categorias/${categoriaAtual.id}`, { descricao, finalidade });
      fecharEditar();
      setSucesso("Categoria atualizada com sucesso.");
      await recarregar();
    } catch {
      setErroAcao("Não foi possível salvar as alterações.");
    } finally {
      setEnviando(false);
    }
  }

  async function criarCategoria(e: React.FormEvent) {
    e.preventDefault();

    limparMensagens();
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
                <th className="celula-id">ID</th>
                <th>Descrição</th>
                <th>Finalidade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan={4}>Carregando...</td>
                </tr>
              ) : categorias.length === 0 ? (
                <tr>
                  <td colSpan={4}>Nenhuma categoria cadastrada ainda.</td>
                </tr>
              ) : (
                categorias.map((c) => (
                  <tr key={c.id}>
                    <td className="celula-id" data-rotulo="ID">{c.id}</td>
                    <td data-rotulo="Descrição">{c.descricao}</td>
                    <td data-rotulo="Finalidade">
                      <span className={classeBadge(textoFinalidadeCategoria(c.finalidade))}>
                        {textoFinalidadeCategoria(c.finalidade)}
                      </span>
                    </td>
                    <td className="table-actions">
                      {/* Categoria do sistema e compartilhada por todas as
                          familias: a API responde 403, entao nem oferece. */}
                      {!c.ehDoSistema && (
                        <button
                          className="btn btn-success icon-btn"
                          aria-label={`Editar categoria ${c.descricao}`}
                          onClick={() => abrirEditar(c)}>
                          ✏
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MODAL EDITAR */}

        <Modal
          open={editModal}
          title="Editar Categoria"
          onClose={fecharEditar}
        >

          <label className="sr-only" htmlFor="categoria-descricao-editar">Descrição da categoria</label>
          <input
            id="categoria-descricao-editar"
            className="input"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          <label className="sr-only" htmlFor="categoria-finalidade-editar">Finalidade</label>
          <select
            id="categoria-finalidade-editar"
            className="select"
            value={finalidade}
            onChange={(e) => setFinalidade(Number(e.target.value))}
          >
            <option value={1}>Receita</option>
            <option value={2}>Despesa</option>
            <option value={3}>Ambas</option>
          </select>

          {erroAcao && <div className="auth-error">{erroAcao}</div>}

          <button
            className="btn btn-success"
            onClick={salvarEdicao}
            disabled={enviando}
          >
            {enviando ? "Salvando..." : "Salvar"}
          </button>

        </Modal>

      </div>
    </>
  );
}
