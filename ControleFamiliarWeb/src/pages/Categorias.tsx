import { useEffect, useState } from "react";
import { api } from "../api/api";

import type { Categoria } from "../types/Categoria";


export default function Categorias() {

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [descricao, setDescricao] = useState("");
  const [finalidade, setFinalidade] = useState(1);

  async function carregar() {

    const response = await api.get("/categorias");

    setCategorias(response.data.data);

  }

  async function criarCategoria(e: React.FormEvent) {

    e.preventDefault();

    await api.post("/categorias", {
      descricao,
      finalidade
    });

    setDescricao("");
    setFinalidade(1);

    carregar();

  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div>

      <h1>Categorias</h1>

      <form onSubmit={criarCategoria} style={{marginBottom:"20px"}}>

        <input
          placeholder="Descrição"
          value={descricao}
          onChange={(e)=>setDescricao(e.target.value)}
        />

        <label htmlFor="finalidade">Finalidade: </label>
        <select
          id="finalidade"
          value={finalidade}
          onChange={(e)=>setFinalidade(Number(e.target.value))}
        >

          <option value={1}>Receita</option>
          <option value={2}>Despesa</option>
          <option value={3}>Ambas</option>

        </select>

        <button type="submit">
          Criar
        </button>

      </form>

      <ul>

        {categorias.map(c => (

          <li key={c.id}>
            {c.descricao} - {c.finalidade}
          </li>

        ))}

      </ul>

    </div>
  );
}