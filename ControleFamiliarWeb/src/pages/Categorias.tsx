import { useEffect, useState } from "react";
import { api } from "../api/api";
import type { Categoria } from "../types/Categoria";

export default function Categorias() {

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [descricao, setDescricao] = useState("");
  const [finalidade, setFinalidade] = useState(1);
  const [mostrarForm, setMostrarForm] = useState(false);

  async function carregar() {

    const response = await api.get("/categorias");

    setCategorias(response.data);

  }

  async function criarCategoria(e: React.FormEvent) {

    e.preventDefault();

    await api.post("/categorias", {
      descricao,
      finalidade
    });

    setDescricao("");
    setFinalidade(1);
    setMostrarForm(false);

    carregar();
  }

  function getFinalidadeTexto(finalidade: number) {

    if (finalidade === 1) return "Receita";
    if (finalidade === 2) return "Despesa";

    return "Ambas";
  }

  useEffect(() => {
    carregar();
  }, []);

  return (

    <div style={{ padding: "30px" }}>

      <h1>Categorias</h1>

      <button onClick={() => setMostrarForm(true)}>
        Nova Categoria
      </button>

      {mostrarForm && (

        <form onSubmit={criarCategoria} style={{ marginTop: "20px" }}>

          <input
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          <select
            value={finalidade}
            onChange={(e) => setFinalidade(Number(e.target.value))}
          >

            <option value={1}>Receita</option>
            <option value={2}>Despesa</option>
            <option value={3}>Ambas</option>

          </select>

          <button type="submit">
            Salvar
          </button>

        </form>

      )}

      <table border={1} cellPadding={10} style={{ marginTop: "20px", width: "100%" }}>

        <thead>

          <tr>
            <th>ID</th>
            <th>Descrição</th>
            <th>Finalidade</th>
          </tr>

        </thead>

        <tbody>

          {categorias.map((c) => (

            <tr key={c.id}>

              <td>{c.id}</td>
              <td>{c.descricao}</td>
              <td>{getFinalidadeTexto(c.finalidade)}</td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}