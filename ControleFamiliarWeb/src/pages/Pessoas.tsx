import { useState } from "react";
import { api } from "../api/api";
import type { Pessoa } from "../types/Pessoa";
import Modal from "../components/Modal";
import { useApiResource } from "../hooks/useApiResource";
import { mensagemDeErro } from "../utils/erro";

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
  const [cienciaMenor, setCienciaMenor] = useState(false);

  // LGPD, art. 14: cadastro de menor de idade exige confirmacao explicita
  // de que quem esta preenchendo e o responsavel legal.
  const ehMenor = idade < 18;

  function limparMensagens() {
    setErroAcao("");
    setSucesso("");
  }

  function abrirEditar(pessoa: Pessoa) {
    limparMensagens();
    setPessoaAtual(pessoa);
    setNome(pessoa.nome);
    setIdade(pessoa.idade);
    setCienciaMenor(false);
    setEditModal(true);
  }

  async function salvarEdicao() {
    if (!pessoaAtual) return;

    // O modal de edicao nao esta dentro de um <form>, entao o required
    // nativo do checkbox (usado no formulario de criacao) nao se aplica
    // aqui - a checagem precisa ser explicita.
    if (ehMenor && !cienciaMenor) {
      setErroAcao("Confirme que é responsável legal pela pessoa antes de salvar.");
      return;
    }

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
      setCienciaMenor(false);
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
    } catch (erro) {
      // A API recusa (400) excluir pessoa vinculada a um membro, com a
      // explicação pronta na mensagem — por isso mensagemDeErro aqui, não um
      // texto fixo genérico.
      setErroAcao(mensagemDeErro(erro));
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

            {ehMenor && (
              <label className="auth-checkbox" style={{ gridColumn: "1 / -1" }}>
                <input
                  type="checkbox"
                  checked={cienciaMenor}
                  onChange={(e) => setCienciaMenor(e.target.checked)}
                  required
                />
                Confirmo que sou responsável legal por esta pessoa e autorizo o cadastro dos dados dela.
              </label>
            )}

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
                <th>Nome</th>
                <th>Idade</th>
                <th className="table-actions">Ações</th>
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
                    <td className="celula-id" data-rotulo="ID">{p.id}</td>
                    <td data-rotulo="Nome">{p.nome}</td>
                    <td data-rotulo="Idade">{p.idade} anos</td>
                    <td className="table-actions" data-rotulo="Ações">
                      <button
                        className="btn btn-success icon-btn"
                        aria-label="Editar pessoa"
                        onClick={() => abrirEditar(p)}>
                        ✏
                      </button>

                      {/*
                        Pessoa de um membro só sai pela tela de Minha Família —
                        a API recusa (400) excluir por aqui. Esconder o botão
                        poupa a viagem ao servidor para descobrir isso.
                      */}
                      {!p.ehMembro && (
                        <button
                          className="btn btn-danger icon-btn"
                          aria-label="Excluir pessoa"
                          onClick={() => abrirDelete(p)}>
                          🗑
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

          {ehMenor && (
            <label className="auth-checkbox">
              <input
                type="checkbox"
                checked={cienciaMenor}
                onChange={(e) => setCienciaMenor(e.target.checked)}
              />
              Confirmo que sou responsável legal por esta pessoa e autorizo o cadastro dos dados dela.
            </label>
          )}

          {erroAcao && <div className="auth-error">{erroAcao}</div>}

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
