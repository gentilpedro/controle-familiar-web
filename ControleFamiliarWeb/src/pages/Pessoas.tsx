import { useState } from "react";
import { api } from "../api/api";
import type { Pessoa } from "../types/Pessoa";
import Modal from "../components/Modal";
import { useApiResource } from "../hooks/useApiResource";

export default function Pessoas() {
  const { dados: pessoas, carregando, erro, recarregar } = useApiResource<Pessoa>("/pessoas");

  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const [pessoaAtual, setPessoaAtual] = useState<Pessoa | null>(null);

  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState<number>(0);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erroAcao, setErroAcao] = useState("");
  const [sucesso, setSucesso] = useState("");

  function limparMensagens() {
    setErroAcao("");
    setSucesso("");
  }

  function abrirEditar(pessoa: Pessoa) {
    limparMensagens();
    setPessoaAtual(pessoa);
    setNome(pessoa.nome);
    setIdade(pessoa.idade);
    setEditModal(true);
  }

  async function salvarEdicao() {
    if (!pessoaAtual) return;

    limparMensagens();
    setEnviando(true);

    try {
      await api.patch(`/pessoas/${pessoaAtual.id}`, { nome, idade });
      setEditModal(false);
      setSucesso("Pessoa atualizada com sucesso.");
      await recarregar();
    } catch {
      setErroAcao("Não foi possível salvar as alterações.");
    } finally {
      setEnviando(false);
    }
  }

  async function criarPessoa(e: React.FormEvent) {
    e.preventDefault();

    limparMensagens();
    setEnviando(true);

    try {
      await api.post("/pessoas", { nome, idade });
      setNome("");
      setIdade(0);
      setMostrarForm(false);
      setSucesso("Pessoa cadastrada com sucesso.");
      await recarregar();
    } catch {
      setErroAcao("Não foi possível cadastrar a pessoa.");
    } finally {
      setEnviando(false);
    }
  }

  function abrirDelete(p: Pessoa) {
    limparMensagens();
    setPessoaAtual(p);
    setDeleteModal(true);
  }

  async function confirmarDelete() {
    if (!pessoaAtual) return;

    limparMensagens();
    setEnviando(true);

    try {
      await api.delete(`/pessoas/${pessoaAtual.id}`);
      setDeleteModal(false);
      setSucesso("Pessoa removida com sucesso.");
      await recarregar();
    } catch {
      setErroAcao("Não foi possível remover a pessoa.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pessoas</h1>
          <p className="page-subtitle">Gerencie as pessoas cadastradas no sistema.</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setMostrarForm(!mostrarForm)}
        >
          {mostrarForm ? "Fechar" : "Nova Pessoa"}
        </button>
      </div>

      {erroAcao && <div className="auth-error">{erroAcao}</div>}
      {sucesso && <div className="auth-success">{sucesso}</div>}

      {mostrarForm && (
        <div className="card">
          <form onSubmit={criarPessoa} className="form-row pessoas">
            <label className="sr-only" htmlFor="pessoa-nome-form">Nome da pessoa</label>
            <input
              id="pessoa-nome-form"
              className="input"
              placeholder="Nome da pessoa"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />

            <label className="sr-only" htmlFor="pessoa-idade-form">Idade</label>
            <input
              id="pessoa-idade-form"
              className="input"
              type="number"
              placeholder="Idade"
              value={idade}
              onChange={(e) => setIdade(Number(e.target.value))}
            />

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
                <th>Nome</th>
                <th>Idade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan={4}>Carregando...</td>
                </tr>
              ) : pessoas.length === 0 ? (
                <tr>
                  <td colSpan={4}>Nenhuma pessoa cadastrada ainda.</td>
                </tr>
              ) : (
                pessoas.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.nome}</td>
                    <td>{p.idade} anos</td>
                    <td className="table-actions">
                      <button
                        className="btn btn-success icon-btn"
                        aria-label="Editar pessoa"
                        onClick={() => abrirEditar(p)}>
                        ✏
                      </button>

                      <button
                        className="btn btn-danger icon-btn"
                        aria-label="Excluir pessoa"
                        onClick={() => abrirDelete(p)}>
                        🗑
                      </button>
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
          title="Editar Pessoa"
          onClose={() => setEditModal(false)}
        >

          <label className="sr-only" htmlFor="pessoa-nome-editar">Nome da pessoa</label>
          <input
            id="pessoa-nome-editar"
            className="input"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <label className="sr-only" htmlFor="pessoa-idade-editar">Idade</label>
          <input
            id="pessoa-idade-editar"
            className="input"
            type="number"
            value={idade}
            onChange={(e) => setIdade(Number(e.target.value))}
          />

          <button
            className="btn btn-success"
            onClick={salvarEdicao}
            disabled={enviando}
          >
            {enviando ? "Salvando..." : "Salvar"}
          </button>

        </Modal>


        {/* MODAL DELETE */}

        <Modal
          open={deleteModal}
          title="Confirmar Exclusão"
          onClose={() => setDeleteModal(false)}
        >

          <p>
            Deseja realmente excluir <b>{pessoaAtual?.nome}</b>?
          </p>

          <button
            className="btn btn-danger"
            onClick={confirmarDelete}
            disabled={enviando}
          >
            {enviando ? "Excluindo..." : "Excluir"}
          </button>

        </Modal>

      </div>
    </>
  );
}
