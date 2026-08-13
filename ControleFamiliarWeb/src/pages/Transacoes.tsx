import { useState } from "react";
import { api } from "../api/api";

import type { Transacao } from "../types/Transacao";
import type { Categoria } from "../types/Categoria";
import type { FormaPagamento } from "../types/FormaPagamento";
import type { Pessoa } from "../types/Pessoa";
import { classeBadge, textoTipoTransacao } from "../utils/badge";
import { formatCurrency, formatDate } from "../utils/format";
import { useApiResource } from "../hooks/useApiResource";
import { useApiPaginado } from "../hooks/useApiPaginado";
import { mensagemDeErro } from "../utils/erro";
import Modal from "../components/Modal";
import Paginacao from "../components/Paginacao";

// A API aceita até 200 por página; 20 mantém a tabela numa tela sem rolagem longa.
const TAMANHO_PAGINA = 20;

// Mesma numeração de TipoTransacao (1 Receita, 2 Despesa) usada por
// Categoria.finalidade — é o que permite herdar o tipo direto da categoria
// sem tradução.
const FINALIDADE_AMBAS = 3;

// "AAAA-MM-DD" no fuso local — o valor que <input type="date"> espera. Não
// usa toISOString() puro: ele converte pra UTC primeiro, e perto da meia-noite
// isso pode voltar o dia errado dependendo do fuso de quem está usando.
function hojeLocalISO(): string {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

// "AAAA-MM" no fuso local — o que <input type="month"> espera. Mesmo helper
// do Painel do Mês, repetido aqui em vez de compartilhado: são duas linhas
// que dependem só de Date, e cada tela usa o valor pra uma coisa diferente.
function mesAtualLocal(): string {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  return `${ano}-${mes}`;
}

export default function Transacoes() {
  // Abre no mês corrente: o histórico inteiro numa tela só polui a leitura, e
  // o que se olha no dia a dia é o mês que está correndo. String vazia =
  // "todos os meses", o escape pra procurar um lançamento antigo.
  const [mesSelecionado, setMesSelecionado] = useState(mesAtualLocal());

  // A API exige ano e mes juntos (ou nenhum dos dois) — undefined some da
  // query string no useApiPaginado, então o filtro vazio vira "sem filtro".
  const [anoFiltro, mesFiltro] = mesSelecionado
    ? mesSelecionado.split("-").map(Number)
    : [undefined, undefined];

  const {
    dados: transacoes,
    pagina,
    totalItens,
    totalPaginas,
    carregando,
    erro,
    irPara,
    recarregar,
  } = useApiPaginado<Transacao>("/transacoes", TAMANHO_PAGINA, { ano: anoFiltro, mes: mesFiltro });

  // Trocar de mês precisa voltar pra página 1: a página 4 do mês passado pode
  // nem existir no mês novo, e a tabela apareceria vazia sem explicação.
  function handleMesChange(novoMes: string) {
    setMesSelecionado(novoMes);
    irPara(1);
  }

  // Pessoas, categorias e formas de pagamento alimentam os selects do
  // formulário e vêm inteiras
  const { dados: pessoas } = useApiResource<Pessoa>("/pessoas");
  const { dados: categorias } = useApiResource<Categoria>("/categorias");
  const { dados: formasPagamento } = useApiResource<FormaPagamento>("/formas-pagamento");

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState<number>(0);
  const [data, setData] = useState(hojeLocalISO());
  const [tipo, setTipo] = useState(1);
  const [pago, setPago] = useState(true);
  const [pessoaId, setPessoaId] = useState<number | "">("");
  const [categoriaId, setCategoriaId] = useState<number | "">("");
  const [formaPagamentoId, setFormaPagamentoId] = useState<number | "">("");
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

  // Um lançamento datado fora do mês filtrado não apareceria na tabela depois
  // de salvo — o usuário veria "cadastrada com sucesso" e uma lista sem ela.
  // Acompanhar a data do que acabou de ser criado evita o susto. Com o filtro
  // desligado ("todos os meses") não há o que ajustar.
  function irParaOMesDaData(dataISO: string) {
    const mesDaData = dataISO.slice(0, 7);

    if (mesSelecionado && mesSelecionado !== mesDaData) setMesSelecionado(mesDaData);
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
        data,
        pago,
        pessoaId,
        categoriaId,
        // "" = nenhuma escolhida; a API trata o campo como opcional.
        formaPagamentoId: formaPagamentoId === "" ? null : formaPagamentoId
      });

      setDescricao("");
      setValor(0);
      setData(hojeLocalISO());
      setTipo(1);
      setPago(true);
      setPessoaId("");
      setCategoriaId("");
      setFormaPagamentoId("");
      setMostrarForm(false);
      setSucesso("Transação cadastrada com sucesso.");

      irParaOMesDaData(data);
      await recarregar();
    } catch (e) {
      setErroAcao(mensagemDeErro(e));
    } finally {
      setEnviando(false);
    }
  }

  // ---------- Editar / excluir ----------

  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [transacaoAtual, setTransacaoAtual] = useState<Transacao | null>(null);

  const [descricaoEdicao, setDescricaoEdicao] = useState("");
  const [valorEdicao, setValorEdicao] = useState<number>(0);
  const [dataEdicao, setDataEdicao] = useState("");
  const [tipoEdicao, setTipoEdicao] = useState(1);
  const [pagoEdicao, setPagoEdicao] = useState(true);
  const [pessoaIdEdicao, setPessoaIdEdicao] = useState<number | "">("");
  const [categoriaIdEdicao, setCategoriaIdEdicao] = useState<number | "">("");
  const [formaPagamentoIdEdicao, setFormaPagamentoIdEdicao] = useState<number | "">("");
  // Só tem efeito quando a transação pertence a uma série (parcelamento ou
  // divisão percentual) — a API ignora fora desse caso.
  const [aplicarAFuturas, setAplicarAFuturas] = useState(false);
  const [excluirFuturas, setExcluirFuturas] = useState(false);

  const categoriaSelecionadaEdicao = categorias.find((c) => c.id === categoriaIdEdicao);
  const tipoHerdaDaCategoriaEdicao =
    categoriaSelecionadaEdicao != null && categoriaSelecionadaEdicao.finalidade !== FINALIDADE_AMBAS;

  function handleCategoriaChangeEdicao(id: number) {
    setCategoriaIdEdicao(id);

    const categoria = categorias.find((c) => c.id === id);
    if (categoria && categoria.finalidade !== FINALIDADE_AMBAS) {
      setTipoEdicao(categoria.finalidade);
    }
  }

  function abrirEditar(t: Transacao) {
    setErroAcao("");
    setSucesso("");
    setTransacaoAtual(t);
    setDescricaoEdicao(t.descricao);
    setValorEdicao(t.valor);
    setDataEdicao(t.data);
    setTipoEdicao(t.tipo);
    setPagoEdicao(t.pago);
    setPessoaIdEdicao(t.pessoaId);
    setCategoriaIdEdicao(t.categoriaId);
    setFormaPagamentoIdEdicao(t.formaPagamentoId ?? "");
    setAplicarAFuturas(false);
    setEditModal(true);
  }

  async function salvarEdicao() {
    if (!transacaoAtual) return;

    setErroAcao("");
    setSucesso("");
    setEnviando(true);

    try {
      await api.patch(`/transacoes/${transacaoAtual.id}`, {
        descricao: descricaoEdicao,
        valor: valorEdicao,
        data: dataEdicao,
        pago: pagoEdicao,
        tipo: tipoEdicao,
        pessoaId: pessoaIdEdicao,
        categoriaId: categoriaIdEdicao,
        formaPagamentoId: formaPagamentoIdEdicao === "" ? null : formaPagamentoIdEdicao,
        // Num PATCH parcial, "campo ausente" e "campo null" chegam iguais na
        // API — é esta flag que diferencia "não mexi nisso" de "quero tirar a
        // forma de pagamento".
        removerFormaPagamento: formaPagamentoIdEdicao === "",
        aplicarAFuturas
      });
      setEditModal(false);
      setSucesso("Transação atualizada com sucesso.");

      irParaOMesDaData(dataEdicao);
      await recarregar();
    } catch (e) {
      setErroAcao(mensagemDeErro(e));
    } finally {
      setEnviando(false);
    }
  }

  // Toggle direto na tabela — não abre modal, não mexe em mais nada da
  // transação. PATCH /transacoes/{id}/pago existe justamente pra esse clique
  // rápido não precisar carregar Pessoa/Categoria/Tipo de novo.
  async function alternarPago(t: Transacao) {
    setErroAcao("");
    setSucesso("");

    try {
      await api.patch(`/transacoes/${t.id}/pago`, { pago: !t.pago });
      await recarregar();
    } catch (e) {
      setErroAcao(mensagemDeErro(e));
    }
  }

  function abrirDelete(t: Transacao) {
    setErroAcao("");
    setSucesso("");
    setTransacaoAtual(t);
    setExcluirFuturas(false);
    setDeleteModal(true);
  }

  async function confirmarDelete() {
    if (!transacaoAtual) return;

    setErroAcao("");
    setSucesso("");
    setEnviando(true);

    try {
      await api.delete(`/transacoes/${transacaoAtual.id}?excluirFuturas=${excluirFuturas}`);
      setDeleteModal(false);
      setSucesso("Transação removida com sucesso.");
      await recarregar();
    } catch (e) {
      setErroAcao(mensagemDeErro(e));
    } finally {
      setEnviando(false);
    }
  }

  // ---------- Compra parcelada ----------

  const [modalParcelada, setModalParcelada] = useState(false);
  const [descricaoParcelada, setDescricaoParcelada] = useState("");
  const [valorTotalParcelada, setValorTotalParcelada] = useState<number>(0);
  const [numeroParcelas, setNumeroParcelas] = useState<number>(2);
  const [tipoParcelada, setTipoParcelada] = useState(2);
  const [dataPrimeiraParcela, setDataPrimeiraParcela] = useState(hojeLocalISO());
  const [pessoaIdParcelada, setPessoaIdParcelada] = useState<number | "">("");
  const [categoriaIdParcelada, setCategoriaIdParcelada] = useState<number | "">("");
  const [formaPagamentoIdParcelada, setFormaPagamentoIdParcelada] = useState<number | "">("");

  // Compra parcelada aceita Receita também (ex.: um recebimento a prazo
  // dividido em meses) — o select de categoria segue o Tipo escolhido, do
  // mesmo jeito que o formulário avulso segue a Categoria.
  const categoriasDaParcelada = categorias.filter(
    (c) => c.finalidade === tipoParcelada || c.finalidade === FINALIDADE_AMBAS
  );

  // Dia 29/30/31 pode não existir em algum mês da série (fevereiro, meses de
  // 30 dias) — a API cai no último dia daquele mês em vez de recusar, mas o
  // aviso evita surpresa quando a parcela de fevereiro cair no 28 em vez do
  // dia esperado.
  const diaPodeFaltarEmAlgunsMeses = new Date(dataPrimeiraParcela).getUTCDate() >= 29;

  function abrirModalParcelada() {
    setErroAcao("");
    setSucesso("");
    setDescricaoParcelada("");
    setValorTotalParcelada(0);
    setNumeroParcelas(2);
    setTipoParcelada(2);
    setDataPrimeiraParcela(hojeLocalISO());
    setPessoaIdParcelada("");
    setCategoriaIdParcelada("");
    setFormaPagamentoIdParcelada("");
    setModalParcelada(true);
  }

  // Trocar o Tipo pode invalidar a categoria já escolhida (ex.: uma categoria
  // só de Despesa some do select ao trocar pra Receita) — limpa pra não
  // mandar um categoriaId que não bate mais com o tipo.
  function handleTipoParceladaChange(novoTipo: number) {
    setTipoParcelada(novoTipo);
    setCategoriaIdParcelada("");
  }

  async function criarParcelada() {
    setErroAcao("");
    setSucesso("");
    setEnviando(true);

    try {
      await api.post("/transacoes/parceladas", {
        descricao: descricaoParcelada,
        valorTotal: valorTotalParcelada,
        numeroParcelas,
        tipo: tipoParcelada,
        dataPrimeiraParcela,
        pessoaId: pessoaIdParcelada,
        categoriaId: categoriaIdParcelada,
        formaPagamentoId: formaPagamentoIdParcelada === "" ? null : formaPagamentoIdParcelada
      });
      setModalParcelada(false);
      setSucesso("Compra parcelada cadastrada com sucesso.");

      // As parcelas seguintes caem nos meses à frente; a primeira é a que dá
      // pra mostrar agora sem trocar de mês por conta própria mais de uma vez.
      irParaOMesDaData(dataPrimeiraParcela);
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

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <label className="sr-only" htmlFor="transacoes-mes">Mês</label>
          <input
            id="transacoes-mes"
            className="input"
            type="month"
            style={{ width: "auto" }}
            value={mesSelecionado}
            onChange={(e) => handleMesChange(e.target.value)}
          />

          {/* Limpar o campo de mês é possível pelo teclado, mas nem todo
              navegador mostra o botão de limpar — o atalho deixa "ver tudo"
              e "voltar ao mês corrente" explícitos. */}
          <button
            className="btn btn-secondary"
            onClick={() => handleMesChange(mesSelecionado ? "" : mesAtualLocal())}
          >
            {mesSelecionado ? "Ver todos os meses" : "Ver mês atual"}
          </button>

          <button
            className="btn btn-secondary"
            onClick={abrirModalParcelada}
          >
            Nova Compra Parcelada
          </button>

          <button
            className="btn btn-primary"
            onClick={() => setMostrarForm(!mostrarForm)}
          >
            {mostrarForm ? "Fechar" : "Nova Transação"}
          </button>
        </div>
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

            <label className="sr-only" htmlFor="transacao-data">Data</label>
            <input
              id="transacao-data"
              className="input"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
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

            <label className="sr-only" htmlFor="transacao-forma-pagamento">Forma de pagamento</label>
            <select
              id="transacao-forma-pagamento"
              className="select"
              value={formaPagamentoId}
              onChange={(e) => setFormaPagamentoId(e.target.value === "" ? "" : Number(e.target.value))}
            >
              <option value="">Forma de pagamento</option>
              {formasPagamento.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.descricao}
                </option>
              ))}
            </select>

            {/* Coluna própria: .form-row tem exatamente 9 tracks (uma por
                campo + os 2 botões), então um 10º item aqui empurraria o
                Cancelar sozinho pra linha de baixo se não ocupasse a linha
                inteira. */}
            <label className="auth-checkbox" style={{ gridColumn: "1 / -1" }}>
              <input
                type="checkbox"
                checked={pago}
                onChange={(e) => setPago(e.target.checked)}
              />
              {tipo === 1 ? "Já recebido" : "Já pago"}
            </label>

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
                <th className="celula-id">Data</th>
                <th>Descrição</th>
                <th className="celula-valor">Valor</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Pessoa</th>
                <th>Categoria</th>
                <th>Pagamento</th>
                <th className="table-actions">Ações</th>
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
                  <td colSpan={10}>Carregando...</td>
                </tr>
              ) : transacoes.length === 0 ? (
                <tr>
                  <td colSpan={10}>
                    {mesSelecionado
                      ? "Nenhuma transação neste mês. Troque o mês ou veja todos os meses."
                      : "Nenhuma transação cadastrada ainda."}
                  </td>
                </tr>
              ) : (
                transacoes.map((t) => (
                  <tr key={t.id}>
                    <td className="celula-id" data-rotulo="ID">{t.id}</td>
                    <td className="celula-id" data-rotulo="Data">{formatDate(t.data)}</td>
                    <td data-rotulo="Descrição">
                      {t.descricao}
                      {t.totalParcelas != null && (
                        <span className="badge" style={{ marginLeft: 8 }}>
                          {t.numeroParcela}/{t.totalParcelas}
                        </span>
                      )}
                    </td>
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
                    {/* Traço e não vazio: o campo é opcional, e a célula em
                        branco parece dado faltando por erro. */}
                    <td data-rotulo="Pagamento">{t.formaPagamento ?? "—"}</td>
                    <td className="table-actions" data-rotulo="Ações">
                      <button
                        className="btn btn-success icon-btn"
                        aria-label="Editar transação"
                        onClick={() => abrirEditar(t)}>
                        ✏
                      </button>

                      <button
                        className="btn btn-danger icon-btn"
                        aria-label="Excluir transação"
                        onClick={() => abrirDelete(t)}>
                        🗑
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Modal
          open={editModal}
          title="Editar Transação"
          onClose={() => setEditModal(false)}
        >
          <label className="sr-only" htmlFor="transacao-descricao-editar">Descrição</label>
          <input
            id="transacao-descricao-editar"
            className="input"
            placeholder="Descrição"
            value={descricaoEdicao}
            onChange={(e) => setDescricaoEdicao(e.target.value)}
          />

          <label className="sr-only" htmlFor="transacao-valor-editar">Valor</label>
          <input
            id="transacao-valor-editar"
            className="input"
            type="number"
            placeholder="Valor"
            value={valorEdicao}
            onChange={(e) => setValorEdicao(Number(e.target.value))}
          />

          <label className="sr-only" htmlFor="transacao-data-editar">Data</label>
          <input
            id="transacao-data-editar"
            className="input"
            type="date"
            value={dataEdicao}
            onChange={(e) => setDataEdicao(e.target.value)}
          />

          {!tipoHerdaDaCategoriaEdicao && (
            <>
              <label className="sr-only" htmlFor="transacao-tipo-editar">Tipo</label>
              <select
                id="transacao-tipo-editar"
                className="select"
                value={tipoEdicao}
                onChange={(e) => setTipoEdicao(Number(e.target.value))}
              >
                <option value={1}>Receita</option>
                <option value={2}>Despesa</option>
              </select>
            </>
          )}

          <label className="sr-only" htmlFor="transacao-pessoa-editar">Pessoa</label>
          <select
            id="transacao-pessoa-editar"
            className="select"
            value={pessoaIdEdicao}
            onChange={(e) => setPessoaIdEdicao(Number(e.target.value))}
          >
            {pessoas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="transacao-categoria-editar">Categoria</label>
          <select
            id="transacao-categoria-editar"
            className="select"
            value={categoriaIdEdicao}
            onChange={(e) => handleCategoriaChangeEdicao(Number(e.target.value))}
          >
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.descricao}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="transacao-forma-pagamento-editar">Forma de pagamento</label>
          <select
            id="transacao-forma-pagamento-editar"
            className="select"
            value={formaPagamentoIdEdicao}
            onChange={(e) => setFormaPagamentoIdEdicao(e.target.value === "" ? "" : Number(e.target.value))}
          >
            <option value="">Sem forma de pagamento</option>
            {formasPagamento.map((f) => (
              <option key={f.id} value={f.id}>
                {f.descricao}
              </option>
            ))}
          </select>

          <label className="auth-checkbox">
            <input
              type="checkbox"
              checked={pagoEdicao}
              onChange={(e) => setPagoEdicao(e.target.checked)}
            />
            {tipoEdicao === 1 ? "Já recebido" : "Já pago"}
          </label>

          {/*
            Só aparece quando a transação pertence a uma série — parcelamento
            (bloco 7) ou divisão percentual (bloco 8). Sem série, a API
            ignora o campo de qualquer forma, mas escondê-lo evita perguntar
            algo que não faz sentido pra uma transação avulsa.
          */}
          {transacaoAtual?.serieId != null && (
            <label className="auth-checkbox">
              <input
                type="checkbox"
                checked={aplicarAFuturas}
                onChange={(e) => setAplicarAFuturas(e.target.checked)}
              />
              Aplicar esta mudança também às ocorrências futuras desta série
              {transacaoAtual.numeroParcela != null && transacaoAtual.totalParcelas != null && (
                <> (parcela {transacaoAtual.numeroParcela}/{transacaoAtual.totalParcelas})</>
              )}
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

        <Modal
          open={deleteModal}
          title="Confirmar Exclusão"
          onClose={() => setDeleteModal(false)}
        >
          <p>
            Deseja realmente excluir <b>{transacaoAtual?.descricao}</b>?
          </p>

          {transacaoAtual?.serieId != null && (
            <label className="auth-checkbox">
              <input
                type="checkbox"
                checked={excluirFuturas}
                onChange={(e) => setExcluirFuturas(e.target.checked)}
              />
              Excluir também as ocorrências futuras desta série
              {transacaoAtual.numeroParcela != null && transacaoAtual.totalParcelas != null && (
                <> (parcela {transacaoAtual.numeroParcela}/{transacaoAtual.totalParcelas})</>
              )}
            </label>
          )}

          {erroAcao && <div className="auth-error">{erroAcao}</div>}

          <button
            className="btn btn-danger"
            onClick={confirmarDelete}
            disabled={enviando}
          >
            {enviando ? "Excluindo..." : "Excluir"}
          </button>
        </Modal>

        <Modal
          open={modalParcelada}
          title="Nova Compra Parcelada"
          onClose={() => setModalParcelada(false)}
        >
          <label className="sr-only" htmlFor="parcelada-descricao">Descrição</label>
          <input
            id="parcelada-descricao"
            className="input"
            placeholder="Descrição (ex.: Notebook)"
            value={descricaoParcelada}
            onChange={(e) => setDescricaoParcelada(e.target.value)}
          />

          <label className="sr-only" htmlFor="parcelada-valor-total">Valor total</label>
          <input
            id="parcelada-valor-total"
            className="input"
            type="number"
            placeholder="Valor total"
            value={valorTotalParcelada}
            onChange={(e) => setValorTotalParcelada(Number(e.target.value))}
          />

          <label className="sr-only" htmlFor="parcelada-numero-parcelas">Número de parcelas</label>
          <input
            id="parcelada-numero-parcelas"
            className="input"
            type="number"
            min={2}
            max={60}
            placeholder="Número de parcelas"
            value={numeroParcelas}
            onChange={(e) => setNumeroParcelas(Number(e.target.value))}
          />

          <label className="sr-only" htmlFor="parcelada-data-primeira">Data da primeira parcela</label>
          <input
            id="parcelada-data-primeira"
            className="input"
            type="date"
            value={dataPrimeiraParcela}
            onChange={(e) => setDataPrimeiraParcela(e.target.value)}
          />

          {diaPodeFaltarEmAlgunsMeses && (
            <p style={{ color: "var(--tinta-suave)", fontSize: 13, margin: 0 }}>
              Alguns meses não têm esse dia — a parcela correspondente cai no último dia do mês.
            </p>
          )}

          <label className="sr-only" htmlFor="parcelada-tipo">Tipo</label>
          <select
            id="parcelada-tipo"
            className="select"
            value={tipoParcelada}
            onChange={(e) => handleTipoParceladaChange(Number(e.target.value))}
          >
            <option value={1}>Receita</option>
            <option value={2}>Despesa</option>
          </select>

          <label className="sr-only" htmlFor="parcelada-pessoa">Pessoa</label>
          <select
            id="parcelada-pessoa"
            className="select"
            value={pessoaIdParcelada}
            onChange={(e) => setPessoaIdParcelada(Number(e.target.value))}
          >
            <option value="">Selecionar Pessoa</option>
            {pessoas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="parcelada-categoria">Categoria</label>
          <select
            id="parcelada-categoria"
            className="select"
            value={categoriaIdParcelada}
            onChange={(e) => setCategoriaIdParcelada(Number(e.target.value))}
          >
            <option value="">Selecionar Categoria</option>
            {categoriasDaParcelada.map((c) => (
              <option key={c.id} value={c.id}>
                {c.descricao}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="parcelada-forma-pagamento">Forma de pagamento</label>
          <select
            id="parcelada-forma-pagamento"
            className="select"
            value={formaPagamentoIdParcelada}
            onChange={(e) => setFormaPagamentoIdParcelada(e.target.value === "" ? "" : Number(e.target.value))}
          >
            <option value="">Forma de pagamento (opcional)</option>
            {formasPagamento.map((f) => (
              <option key={f.id} value={f.id}>
                {f.descricao}
              </option>
            ))}
          </select>

          {erroAcao && <div className="auth-error">{erroAcao}</div>}

          <button
            className="btn btn-success"
            onClick={criarParcelada}
            disabled={enviando}
          >
            {enviando ? "Salvando..." : "Salvar"}
          </button>
        </Modal>

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
