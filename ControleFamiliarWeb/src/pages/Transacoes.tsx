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


  async function carregar() {

    const transacoesRes = await api.get("/transacoes");
    const pessoasRes = await api.get("/pessoas");
    const categoriasRes = await api.get("/categorias");

    setTransacoes(transacoesRes.data.data);
    setPessoas(pessoasRes.data.data);
    setCategorias(categoriasRes.data.data);

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

    carregar();

  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div>

      <h1>Transações</h1>

      <form onSubmit={criarTransacao} style={{marginBottom:"20px"}}>

        <input
          placeholder="Descrição"
          value={descricao}
          onChange={(e)=>setDescricao(e.target.value)}
        />

        <input
          type="number"
          placeholder="Valor"
          value={valor}
          onChange={(e)=>setValor(Number(e.target.value))}
        />
        <label htmlFor="tipo">Tipo: </label>
        <select
         id="tipo"
         onChange={(e)=>setTipo(Number(e.target.value))}>

          <option value={1}>Receita</option>
          <option value={2}>Despesa</option>

        </select>

        <label htmlFor="pessoa">Pessoa: </label>
        <select
        id="pessoa"
        onChange={(e)=>setPessoaId(Number(e.target.value))}>

          <option>Selecionar Pessoa</option>

          {pessoas.map(p => (

            <option key={p.id} value={p.id}>
              {p.nome}
            </option>

          ))}

        </select>
        <label htmlFor="categoria">Categoria: </label>
        <select
         id="categoria"
         onChange={(e)=>setCategoriaId(Number(e.target.value))}>

          <option>Selecionar Categoria</option>

          {categorias.map(c => (

            <option key={c.id} value={c.id}>
              {c.descricao}
            </option>

          ))}

        </select>

        <button type="submit">
          Criar
        </button>

      </form>

      <ul>

        {transacoes.map(t => (

          <li key={t.id}>
            {t.descricao} - R$ {t.valor} ({t.pessoa})
          </li>

        ))}

      </ul>

    </div>
  );
}