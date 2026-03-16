import { useEffect, useState } from "react";
import { api } from "../api/api";
import type { Pessoa } from "../types/Pessoa";

export default function Pessoas() {

  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState<number>(0);
  const [mostrarForm, setMostrarForm] = useState(false);

  async function carregar() {

    const response = await api.get("/pessoas");

    setPessoas(response.data);

  }

  async function criarPessoa(e: React.FormEvent) {

    e.preventDefault();

    await api.post("/pessoas", {
      nome,
      idade
    });

    setNome("");
    setIdade(0);
    setMostrarForm(false);

    carregar();

  }

  useEffect(() => {
    carregar();
  }, []);

  return (

    <div style={{ padding: "30px" }}>

      <h1>Pessoas</h1>

      <button
        onClick={() => setMostrarForm(true)}
        style={{ marginBottom: "20px" }}
      >
        Nova Pessoa
      </button>

      {mostrarForm && (

        <form onSubmit={criarPessoa} style={{ marginBottom: "30px" }}>

          <input
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={{ marginRight: "10px" }}
          />

          <input
            placeholder="Idade"
            type="number"
            value={idade}
            onChange={(e) => setIdade(Number(e.target.value))}
            style={{ marginRight: "10px" }}
          />

          <button type="submit">
            Salvar
          </button>

          <button
            type="button"
            onClick={() => setMostrarForm(false)}
            style={{ marginLeft: "10px" }}
          >
            Cancelar
          </button>

        </form>

      )}

      <table border={1} cellPadding={10} width="100%">

        <thead>

          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Idade</th>
          </tr>

        </thead>

        <tbody>

          {pessoas.map(p => (

            <tr key={p.id}>

              <td>{p.id}</td>
              <td>{p.nome}</td>
              <td>{p.idade} anos</td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}