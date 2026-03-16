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

      {mostrarForm && (
        <div className="card">
          <form onSubmit={criarPessoa} className="form-row pessoas">
            <input
              className="input"
              placeholder="Nome da pessoa"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />

            <input
              className="input"
              type="number"
              placeholder="Idade"
              value={idade}
              onChange={(e) => setIdade(Number(e.target.value))}
            />

            <button className="btn btn-success" type="submit">
              Salvar
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
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Idade</th>
              </tr>
            </thead>
            <tbody>
              {pessoas.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.nome}</td>
                  <td>{p.idade} anos</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

}