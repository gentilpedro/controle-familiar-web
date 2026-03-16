import { useEffect, useState } from "react";
import { api } from "../api/api";

import type { Transacao } from "../types/Transacao";
import type { Categoria } from "../types/Categoria";
import type { Pessoa } from "../types/Pessoa";

export default function Transacoes() {

  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState<number>(0);
  const [tipo, setTipo] = useState(1);
  const [pessoaId, setPessoaId] = useState<number>();
  const [categoriaId, setCategoriaId] = useState<number>();

  const [mostrarForm, setMostrarForm] = useState(false);

  async function carregar() {

    const transacoesRes = await api.get("/transacoes");
    const pessoasRes = await api.get("/pessoas");
    const categoriasRes = await api.get("/categorias");

    setTransacoes(transacoesRes.data);
    setPessoas(pessoasRes.data);
    setCategorias(categoriasRes.data);

  }

  async function criarTransacao(e: React.FormEvent) {

    e.preventDefault();

    await api.post("/transacoes", {
      descricao,
      valor,
      tipo,
      pessoaId,
      categoriaId
    });

    setDescricao("");
    setValor(0);

    setMostrarForm(false);

    carregar();
  }

  function getTipoTexto(tipo: number) {

    if (tipo === 1) return "Receita";

    return "Despesa";

  }

  useEffect(() => {
    carregar();
  }, []);

  return (

    <div style={{ padding: "30px" }}>

      <h1>Transações</h1>

      <button
        onClick={() => setMostrarForm(true)}
        style={{ marginBottom: "20px" }}
      >
        Nova Transação
      </button>

      {mostrarForm && (

        <form onSubmit={criarTransacao} style={{ marginBottom: "30px" }}>

          <input
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            style={{ marginRight: "10px" }}
          />

          <input
            type="number"
            placeholder="Valor"
            value={valor}
            onChange={(e) => setValor(Number(e.target.value))}
            style={{ marginRight: "10px" }}
          />

          <label>Tipo:</label>

          <select
            value={tipo}
            onChange={(e) => setTipo(Number(e.target.value))}
            style={{ marginRight: "10px" }}
          >

            <option value={1}>Receita</option>
            <option value={2}>Despesa</option>

          </select>

          <label>Pessoa:</label>

          <select
            onChange={(e) => setPessoaId(Number(e.target.value))}
            style={{ marginRight: "10px" }}
          >

            <option>Selecionar Pessoa</option>

            {pessoas.map(p => (

              <option key={p.id} value={p.id}>
                {p.nome}
              </option>

            ))}

          </select>

          <label>Categoria:</label>

          <select
            onChange={(e) => setCategoriaId(Number(e.target.value))}
            style={{ marginRight: "10px" }}
          >

            <option>Selecionar Categoria</option>

            {categorias.map(c => (

              <option key={c.id} value={c.id}>
                {c.descricao}
              </option>

            ))}

          </select>

          <button type="submit">
            Salvar
          </button>

        </form>

      )}

      <table border={1} cellPadding={10} width="100%">

        <thead>

          <tr>

            <th>ID</th>
            <th>Descrição</th>
            <th>Valor</th>
            <th>Tipo</th>
            <th>Pessoa</th>
            <th>Categoria</th>

          </tr>

        </thead>

        <tbody>

          {transacoes.map(t => (

            <tr key={t.id}>

              <td>{t.id}</td>
              <td>{t.descricao}</td>
              <td>R$ {t.valor}</td>
              <td>{getTipoTexto(t.tipo)}</td>
              <td>{t.pessoa}</td>
              <td>{t.categoria}</td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}