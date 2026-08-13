import { useState } from "react";
import { api } from "../api/api";
import type { Categoria } from "../types/Categoria";
import type { FormaPagamento } from "../types/FormaPagamento";
import Modal from "../components/Modal";
import { useApiResource } from "../hooks/useApiResource";
import { mensagemDeErro } from "../utils/erro";

export default function FormasPagamento() {
  const { dados: formas, carregando, erro, recarregar } = useApiResource<FormaPagamento>("/formas-pagamento");
  const { dados: categorias } = useApiResource<Categoria>("/categorias");

  const [descricao, setDescricao] = useState("");
  const [ehCartao, setEhCartao] = useState(false);
  const [diaFechamento, setDiaFechamento] = useState<number | "">("");
  const [diaVencimento, setDiaVencimento] = useState<number | "">("");
  const [categoriaFaturaId, setCategoriaFaturaId] = useState<number | "">("");

  const [mostrarForm, setMostrarForm] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erroAcao, setErroAcao] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [formaAtual, setFormaAtual] = useState<FormaPagamento | null>(null);

  function limparMensagens() {
    setErroAcao("");
    setSucesso("");
  }

  // O formulário de criação divide os campos com o modal de edição: sem
  // limpar, "Nova Forma de Pagamento" abriria preenchido com o que foi
  // editado por último.
  function limparCampos() {
    setDescricao("");
    setEhCartao(false);
    setDiaFechamento("");
    setDiaVencimento("");
    setCategoriaFaturaId("");
  }

  // Os dois dias andam juntos na API (um só é 400) e a categoria da fatura só
  // se aplica a cartão — desmarcar "é cartão de crédito" manda os três
  // limpos de uma vez, via RemoverCartao no PATCH.
  function corpoDoCartao() {
    if (!ehCartao) return { diaFechamento: null, diaVencimento: null, categoriaFaturaId: null };

    return {
      diaFechamento: diaFechamento === "" ? null : diaFechamento,
      diaVencimento: diaVencimento === "" ? null : diaVencimento,
      categoriaFaturaId: categoriaFaturaId === "" ? null : categoriaFaturaId
    };
  }

  function abrirEditar(forma: FormaPagamento) {
    limparMensagens();
    setFormaAtual(forma);
    setDescricao(forma.descricao);
    setEhCartao(forma.ehCartaoCredito);
    setDiaFechamento(forma.diaFechamento ?? "");
    setDiaVencimento(forma.diaVencimento ?? "");
    setCategoriaFaturaId(forma.categoriaFaturaId ?? "");
    setEditModal(true);
  }

  function fecharEditar() {
    setEditModal(false);
    limparCampos();
  }

  async function salvarEdicao() {
    if (!formaAtual) return;

    // O PATCH ignora campo vazio (atualização parcial), então salvar sem
    // descrição responderia 200 sem mudar nada — parece que salvou e não salvou.
    if (!descricao.trim()) {
      setErroAcao("Informe a descrição da forma de pagamento.");
      return;
    }

    limparMensagens();
    setEnviando(true);

    try {
      await api.patch(`/formas-pagamento/${formaAtual.id}`, {
        descricao,
        ...corpoDoCartao(),
        removerCartao: !ehCartao
      });
      fecharEditar();
      setSucesso("Forma de pagamento atualizada com sucesso.");
      await recarregar();
    } catch (e) {
      setErroAcao(mensagemDeErro(e));
    } finally {
      setEnviando(false);
    }
  }

  function abrirDelete(forma: FormaPagamento) {
    limparMensagens();
    setFormaAtual(forma);
    setDeleteModal(true);
  }

  async function confirmarDelete() {
    if (!formaAtual) return;

    limparMensagens();
    setEnviando(true);

    try {
      await api.delete(`/formas-pagamento/${formaAtual.id}`);
      setDeleteModal(false);
      setSucesso("Forma de pagamento removida com sucesso.");
      await recarregar();
    } catch (e) {
      // A API recusa excluir forma já usada por alguma transação — a
      // explicação dela é mais útil que um texto fixo daqui.
      setErroAcao(mensagemDeErro(e));
    } finally {
      setEnviando(false);
    }
  }

  async function criarForma(e: React.FormEvent) {
    e.preventDefault();

    limparMensagens();
    setEnviando(true);

    try {
      await api.post("/formas-pagamento", { descricao, ...corpoDoCartao() });

      limparCampos();
      setMostrarForm(false);
      setSucesso("Forma de pagamento cadastrada com sucesso.");
      await recarregar();
    } catch (e) {
      setErroAcao(mensagemDeErro(e));
    } finally {
      setEnviando(false);
    }
  }

  // Campos do ciclo, compartilhados pelo formulário de criação e pelo modal
  // de edição — a diferença entre os dois é só o layout em volta.
  function camposDoCartao(sufixo: string) {
    return (
      <>
        <label className="sr-only" htmlFor={`forma-fechamento${sufixo}`}>Dia do fechamento</label>
        <input
          id={`forma-fechamento${sufixo}`}
          className="input"
          type="number"
          min={1}
          max={31}
          placeholder="Fecha dia"
          value={diaFechamento}
          onChange={(e) => setDiaFechamento(e.target.value === "" ? "" : Number(e.target.value))}
        />

        <label className="sr-only" htmlFor={`forma-vencimento${sufixo}`}>Dia do vencimento</label>
        <input
          id={`forma-vencimento${sufixo}`}
          className="input"
          type="number"
          min={1}
          max={31}
          placeholder="Vence dia"
          value={diaVencimento}
          onChange={(e) => setDiaVencimento(e.target.value === "" ? "" : Number(e.target.value))}
        />

        <label className="sr-only" htmlFor={`forma-categoria-fatura${sufixo}`}>Categoria do pagamento da fatura</label>
        <select
          id={`forma-categoria-fatura${sufixo}`}
          className="select"
          value={categoriaFaturaId}
          onChange={(e) => setCategoriaFaturaId(e.target.value === "" ? "" : Number(e.target.value))}
        >
          <option value="">Categoria da fatura (opcional)</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.descricao}
            </option>
          ))}
        </select>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Formas de Pagamento</h1>
          <p className="page-subtitle">Por onde o dinheiro entra e sai: Pix, dinheiro, saque, cartão...</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setMostrarForm(!mostrarForm)}
        >
          {mostrarForm ? "Fechar" : "Nova Forma de Pagamento"}
        </button>
      </div>

      {erroAcao && !editModal && !deleteModal && <div className="auth-error">{erroAcao}</div>}
      {sucesso && <div className="auth-success">{sucesso}</div>}

      {mostrarForm && (
        <div className="card">
          {/*
            Duas configurações de grid, não uma com campos escondidos: com os
            campos do cartão fora do fluxo, os botões cairiam em colunas do
            meio. A classe `cartao` troca o número de tracks junto com o que
            está na tela.
          */}
          <form onSubmit={criarForma} className={`form-row formas-pagamento${ehCartao ? " cartao" : ""}`}>
            <label className="auth-checkbox" style={{ gridColumn: "1 / -1" }}>
              <input
                type="checkbox"
                checked={ehCartao}
                onChange={(e) => setEhCartao(e.target.checked)}
              />
              É cartão de crédito (tem fatura que fecha e vence)
            </label>

            <label className="sr-only" htmlFor="forma-descricao">Descrição da forma de pagamento</label>
            <input
              id="forma-descricao"
              className="input"
              placeholder="Descrição (ex.: Crédito Santander)"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />

            {ehCartao && camposDoCartao("")}

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
                <th>Origem</th>
                <th>Fatura</th>
                <th className="table-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan={5}>Carregando...</td>
                </tr>
              ) : formas.length === 0 ? (
                <tr>
                  <td colSpan={5}>Nenhuma forma de pagamento cadastrada ainda.</td>
                </tr>
              ) : (
                formas.map((f) => (
                  <tr key={f.id}>
                    <td className="celula-id" data-rotulo="ID">{f.id}</td>
                    <td data-rotulo="Descrição">{f.descricao}</td>
                    <td data-rotulo="Origem">
                      <span className="badge">{f.ehDoSistema ? "Padrão" : "Da família"}</span>
                    </td>
                    <td data-rotulo="Fatura">
                      {f.ehCartaoCredito ? (
                        <>
                          Fecha dia {f.diaFechamento} · vence dia {f.diaVencimento}
                          {f.categoriaFatura && (
                            <div style={{ color: "var(--tinta-suave)", fontSize: 13 }}>
                              Pagamento em {f.categoriaFatura}
                            </div>
                          )}
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="table-actions" data-rotulo="Ações">
                      {/* Forma do sistema é compartilhada por todas as
                          famílias: a API responde 403, então nem oferece. */}
                      {!f.ehDoSistema && (
                        <>
                          <button
                            className="btn btn-success icon-btn"
                            aria-label={`Editar forma de pagamento ${f.descricao}`}
                            onClick={() => abrirEditar(f)}>
                            ✏
                          </button>

                          <button
                            className="btn btn-danger icon-btn"
                            aria-label={`Excluir forma de pagamento ${f.descricao}`}
                            onClick={() => abrirDelete(f)}>
                            🗑
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Modal
          open={editModal}
          title="Editar Forma de Pagamento"
          onClose={fecharEditar}
        >
          <label className="sr-only" htmlFor="forma-descricao-editar">Descrição da forma de pagamento</label>
          <input
            id="forma-descricao-editar"
            className="input"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          <label className="auth-checkbox">
            <input
              type="checkbox"
              checked={ehCartao}
              onChange={(e) => setEhCartao(e.target.checked)}
            />
            É cartão de crédito (tem fatura que fecha e vence)
          </label>

          {ehCartao && camposDoCartao("-editar")}

          {erroAcao && <div className="auth-error">{erroAcao}</div>}

          <button
            className="btn btn-success"
            onClick={salvarEdicao}
            disabled={enviando}
          >
            {enviando ? "Salvando..." : "Salvar"}
          </button>
        </Modal>

        <Modal
          open={deleteModal}
          title="Confirmar Exclusão"
          onClose={() => setDeleteModal(false)}
        >
          <p>
            Deseja realmente excluir <b>{formaAtual?.descricao}</b>?
          </p>

          {erroAcao && <div className="auth-error">{erroAcao}</div>}

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
