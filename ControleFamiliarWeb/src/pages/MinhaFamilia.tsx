import { useState } from "react";
import { api } from "../api/api";
import { useAuth } from "../hooks/useAuth";
import { useApiResource } from "../hooks/useApiResource";
import { mensagemDeErro } from "../utils/erro";
import Modal from "../components/Modal";
import type { ApiEnvelope, Familia } from "../types/Auth";
import type { Pessoa } from "../types/Pessoa";

export default function MinhaFamilia() {
  const { usuario, familia, atualizarFamilia } = useAuth();
  const { dados: pessoas, carregando: carregandoPessoas, recarregar: recarregarPessoas } =
    useApiResource<Pessoa>("/pessoas");

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregandoAcao, setCarregandoAcao] = useState<string | null>(null);

  const souAdministrador = familia?.membros.find((m) => m.id === usuario?.id)?.ehAdministrador ?? false;
  const linkConvite = familia ? `${window.location.origin}/registrar?codigo=${familia.codigoConvite}` : "";

  // A pessoa de um membro já aparece na tabela de Membros acima — listar de
  // novo aqui seria a mesma informação duas vezes. Dependentes é só quem não
  // tem conta.
  const dependentes = pessoas.filter((p) => !p.ehMembro);

  function limparMensagens() {
    setErro("");
    setSucesso("");
  }

  async function executar(chave: string, acao: () => Promise<{ data: ApiEnvelope<Familia> }>) {
    limparMensagens();
    setCarregandoAcao(chave);

    try {
      const response = await acao();
      atualizarFamilia(response.data.data!);
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setCarregandoAcao(null);
    }
  }

  function regenerarCodigo() {
    return executar("codigo", () => api.post<ApiEnvelope<Familia>>("/familia/regenerar-codigo"));
  }

  function removerMembro(membroId: number) {
    return executar(`remover-${membroId}`, () => api.delete<ApiEnvelope<Familia>>(`/familia/membros/${membroId}`));
  }

  function promoverMembro(membroId: number) {
    return executar(`promover-${membroId}`, () => api.post<ApiEnvelope<Familia>>(`/familia/membros/${membroId}/promover`));
  }

  function rebaixarMembro(membroId: number) {
    return executar(`rebaixar-${membroId}`, () => api.post<ApiEnvelope<Familia>>(`/familia/membros/${membroId}/rebaixar`));
  }

  async function copiarLinkConvite() {
    limparMensagens();

    try {
      await navigator.clipboard.writeText(linkConvite);
      setSucesso("Link de convite copiado — é só colar e mandar pra pessoa.");
    } catch {
      setErro("Não consegui copiar automaticamente. Copie o link manualmente.");
    }
  }

  // ---------- Dependentes (pessoas sem conta, cadastradas à mão) ----------

  const [mostrarFormDependente, setMostrarFormDependente] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [dependenteAtual, setDependenteAtual] = useState<Pessoa | null>(null);

  const [nomeDependente, setNomeDependente] = useState("");
  const [idadeDependente, setIdadeDependente] = useState<number>(0);
  const [cienciaMenor, setCienciaMenor] = useState(false);

  // LGPD, art. 14: cadastro de menor de idade exige confirmacao explicita
  // de que quem esta preenchendo e o responsavel legal.
  const ehMenor = idadeDependente < 18;

  function abrirEditarDependente(pessoa: Pessoa) {
    limparMensagens();
    setDependenteAtual(pessoa);
    setNomeDependente(pessoa.nome);
    setIdadeDependente(pessoa.idade);
    setCienciaMenor(false);
    setEditModal(true);
  }

  function abrirDeleteDependente(pessoa: Pessoa) {
    limparMensagens();
    setDependenteAtual(pessoa);
    setDeleteModal(true);
  }

  async function criarDependente(e: React.FormEvent) {
    e.preventDefault();

    limparMensagens();
    setCarregandoAcao("criar-dependente");

    try {
      await api.post("/pessoas", { nome: nomeDependente, idade: idadeDependente });
      setNomeDependente("");
      setIdadeDependente(0);
      setCienciaMenor(false);
      setMostrarFormDependente(false);
      setSucesso("Dependente cadastrado com sucesso.");
      await recarregarPessoas();
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setCarregandoAcao(null);
    }
  }

  async function salvarEdicaoDependente() {
    if (!dependenteAtual) return;

    // O modal não está dentro de um <form>, então o required nativo do
    // checkbox (usado no formulario de criacao) nao se aplica aqui — a
    // checagem precisa ser explicita.
    if (ehMenor && !cienciaMenor) {
      setErro("Confirme que é responsável legal pelo dependente antes de salvar.");
      return;
    }

    limparMensagens();
    setCarregandoAcao(`editar-${dependenteAtual.id}`);

    try {
      await api.patch(`/pessoas/${dependenteAtual.id}`, { nome: nomeDependente, idade: idadeDependente });
      setEditModal(false);
      setSucesso("Dependente atualizado com sucesso.");
      await recarregarPessoas();
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setCarregandoAcao(null);
    }
  }

  async function confirmarDeleteDependente() {
    if (!dependenteAtual) return;

    limparMensagens();
    setCarregandoAcao(`excluir-${dependenteAtual.id}`);

    try {
      await api.delete(`/pessoas/${dependenteAtual.id}`);
      setDeleteModal(false);
      setSucesso("Dependente removido com sucesso.");
      await recarregarPessoas();
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setCarregandoAcao(null);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Minha Família</h1>
          <p className="page-subtitle">
            {souAdministrador
              ? "Como administrador, você pode convidar e gerenciar os membros e dependentes da família."
              : "Compartilhe o código abaixo para outras pessoas entrarem e verem os mesmos dados."}
          </p>
        </div>
      </div>

      {erro && <div className="auth-error">{erro}</div>}
      {sucesso && <div className="auth-success">{sucesso}</div>}

      <div className="card">
        <p className="summary-label">Família</p>
        <h2 style={{ marginTop: 0 }}>{familia?.nome}</h2>

        <p className="summary-label">Código de convite</p>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span className="invite-code">{familia?.codigoConvite}</span>

          <button className="btn btn-primary" onClick={copiarLinkConvite}>
            Copiar link de convite
          </button>

          {souAdministrador && (
            <button
              className="btn btn-secondary"
              onClick={regenerarCodigo}
              disabled={carregandoAcao === "codigo"}
            >
              {carregandoAcao === "codigo" ? "Gerando..." : "Gerar novo código"}
            </button>
          )}
        </div>

        <p style={{ color: "var(--tinta-suave)", fontSize: 13, marginTop: 12, marginBottom: 0 }}>
          Manda o link pronto (whatsapp, e-mail, etc.) — quem abrir já cai no cadastro com o código preenchido.
        </p>
      </div>

      <div className="card">
        <h2 className="section-title">Membros</h2>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Papel</th>
                {souAdministrador && <th className="table-actions">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {familia?.membros.map((membro) => {
                const souEu = membro.id === usuario?.id;

                return (
                  <tr key={membro.id}>
                    <td data-rotulo="Nome">
                      {membro.nome}
                      {souEu && " (você)"}
                    </td>
                    <td data-rotulo="Papel">
                      {membro.ehAdministrador ? (
                        <span className="badge badge-ambas">Admin</span>
                      ) : (
                        <span className="badge">Membro</span>
                      )}
                    </td>
                    {souAdministrador && (
                      <td className="table-actions" data-rotulo="Ações">
                        {membro.ehAdministrador ? (
                          <button
                            className="btn btn-secondary"
                            disabled={carregandoAcao === `rebaixar-${membro.id}`}
                            onClick={() => rebaixarMembro(membro.id)}
                          >
                            Rebaixar
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary"
                            disabled={carregandoAcao === `promover-${membro.id}`}
                            onClick={() => promoverMembro(membro.id)}
                          >
                            Promover
                          </button>
                        )}

                        {!souEu && (
                          <button
                            className="btn btn-danger"
                            disabled={carregandoAcao === `remover-${membro.id}`}
                            onClick={() => removerMembro(membro.id)}
                          >
                            Remover
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="page-header" style={{ marginBottom: 16, paddingBottom: 0, border: "none" }}>
          <div>
            <h2 className="section-title" style={{ marginBottom: 4 }}>Dependentes</h2>
            <p className="page-subtitle" style={{ marginTop: 0 }}>
              Pessoas da família sem conta própria — filho pequeno, por exemplo. Elas aparecem no
              seletor de pessoa ao lançar uma transação, mas não fazem login.
            </p>
          </div>

          {souAdministrador && (
            <button
              className="btn btn-primary"
              onClick={() => setMostrarFormDependente(!mostrarFormDependente)}
            >
              {mostrarFormDependente ? "Fechar" : "Novo Dependente"}
            </button>
          )}
        </div>

        {mostrarFormDependente && souAdministrador && (
          <form onSubmit={criarDependente} className="form-row pessoas" style={{ marginBottom: 20 }}>
            <label className="sr-only" htmlFor="dependente-nome-form">Nome do dependente</label>
            <input
              id="dependente-nome-form"
              className="input"
              placeholder="Nome do dependente"
              value={nomeDependente}
              onChange={(e) => setNomeDependente(e.target.value)}
            />

            <label className="sr-only" htmlFor="dependente-idade-form">Idade</label>
            <input
              id="dependente-idade-form"
              className="input"
              type="number"
              placeholder="Idade"
              value={idadeDependente}
              onChange={(e) => setIdadeDependente(Number(e.target.value))}
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

            <button className="btn btn-success" type="submit" disabled={carregandoAcao === "criar-dependente"}>
              {carregandoAcao === "criar-dependente" ? "Salvando..." : "Salvar"}
            </button>

            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => setMostrarFormDependente(false)}
            >
              Cancelar
            </button>
          </form>
        )}

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Idade</th>
                {souAdministrador && <th className="table-actions">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {carregandoPessoas ? (
                <tr>
                  <td colSpan={souAdministrador ? 3 : 2}>Carregando...</td>
                </tr>
              ) : dependentes.length === 0 ? (
                <tr>
                  <td colSpan={souAdministrador ? 3 : 2}>Nenhum dependente cadastrado ainda.</td>
                </tr>
              ) : (
                dependentes.map((p) => (
                  <tr key={p.id}>
                    <td data-rotulo="Nome">{p.nome}</td>
                    <td data-rotulo="Idade">{p.idade} anos</td>
                    {souAdministrador && (
                      <td className="table-actions" data-rotulo="Ações">
                        <button
                          className="btn btn-success icon-btn"
                          aria-label="Editar dependente"
                          onClick={() => abrirEditarDependente(p)}>
                          ✏
                        </button>

                        <button
                          className="btn btn-danger icon-btn"
                          aria-label="Excluir dependente"
                          onClick={() => abrirDeleteDependente(p)}>
                          🗑
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Modal
          open={editModal}
          title="Editar Dependente"
          onClose={() => setEditModal(false)}
        >
          <label className="sr-only" htmlFor="dependente-nome-editar">Nome do dependente</label>
          <input
            id="dependente-nome-editar"
            className="input"
            value={nomeDependente}
            onChange={(e) => setNomeDependente(e.target.value)}
          />

          <label className="sr-only" htmlFor="dependente-idade-editar">Idade</label>
          <input
            id="dependente-idade-editar"
            className="input"
            type="number"
            value={idadeDependente}
            onChange={(e) => setIdadeDependente(Number(e.target.value))}
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

          {erro && <div className="auth-error">{erro}</div>}

          <button
            className="btn btn-success"
            onClick={salvarEdicaoDependente}
            disabled={carregandoAcao === `editar-${dependenteAtual?.id}`}
          >
            {carregandoAcao === `editar-${dependenteAtual?.id}` ? "Salvando..." : "Salvar"}
          </button>
        </Modal>

        <Modal
          open={deleteModal}
          title="Confirmar Exclusão"
          onClose={() => setDeleteModal(false)}
        >
          <p>
            Deseja realmente excluir <b>{dependenteAtual?.nome}</b>?
          </p>

          <button
            className="btn btn-danger"
            onClick={confirmarDeleteDependente}
            disabled={carregandoAcao === `excluir-${dependenteAtual?.id}`}
          >
            {carregandoAcao === `excluir-${dependenteAtual?.id}` ? "Excluindo..." : "Excluir"}
          </button>
        </Modal>
      </div>
    </>
  );
}
