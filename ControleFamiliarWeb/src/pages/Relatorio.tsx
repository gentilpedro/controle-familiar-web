import { useEffect, useState } from "react";
import { api } from "../api/api";
import type { Relatorio } from "../types/Relatorios";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";



export default function Relatorios() {

  const [relatorio, setRelatorio] = useState<Relatorio>();

  async function carregar() {

    const response = await api.get("/relatorios/totais-por-pessoa");

    setRelatorio(response.data.data);

  }

  useEffect(() => {
    carregar();
  }, []);

  if (!relatorio) return <p>Carregando...</p>;

  return (
    <div>

      <h1>Dashboard Financeiro</h1>

      <h2>Receitas vs Despesas</h2>

      <ResponsiveContainer width="100%" height={300}>

        <BarChart data={relatorio.pessoas}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="pessoa" />

          <YAxis />

          <Tooltip />

          <Legend />

          <Bar dataKey="totalReceitas" fill="#4caf50" name="Receitas" />

          <Bar dataKey="totalDespesas" fill="#f44336" name="Despesas" />

        </BarChart>

      </ResponsiveContainer>

      <h2>Totais Gerais</h2>

      <p>
        Receitas: <b>R$ {relatorio.totalReceitas}</b>
      </p>

      <p>
        Despesas: <b>R$ {relatorio.totalDespesas}</b>
      </p>

      <p>
        Saldo Líquido: <b>R$ {relatorio.saldoLiquido}</b>
      </p>

    </div>
  );
}