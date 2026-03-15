import { useEffect, useState } from "react";
import { api } from "../api/api";
import type { Pessoa } from "../types/Pessoa";

export default function Pessoas() {

  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState<number>(0);

  async function carregar() {

    const response = await api.get("/pessoas");

    setPessoas(response.data.data);

  }

  async function criarPessoa(e: React.FormEvent) {

    e.preventDefault();

    await api.post("/pessoas", {
      nome,
      idade
    });

    setNome("");
    setIdade(0);

    carregar();

  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div>

      <h1>Pessoas</h1>

      <form onSubmit={criarPessoa} style={{marginBottom:"20px"}}>

        <input
          placeholder="Nome"
          value={nome}
          onChange={(e)=>setNome(e.target.value)}
        />

        <input
          placeholder="Idade"
          type="number"
          value={idade}
          onChange={(e)=>setIdade(Number(e.target.value))}
        />

        <button type="submit">
          Criar
        </button>

      </form>

      <ul>

        {pessoas.map(p => (

          <li key={p.id}>
            {p.nome} - {p.idade} anos
          </li>

        ))}

      </ul>

    </div>
  );
}