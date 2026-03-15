import { useEffect, useState } from "react";
import { api } from "../api/api";
import type { Relatorio } from "../types/Relatorios";
import type { CategoriaResumo } from "../types/Categoria";

import {
  PieChart,
  Pie,
  Cell,
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
  const [categorias, setCategorias] = useState<CategoriaResumo[]>([]);

  async function carregar() {

    const pessoasResponse = await api.get("/relatorios/totais-por-pessoa");
    const categoriasResponse = await api.get("/relatorios/totais-por-categoria");

    setRelatorio(pessoasResponse.data.data);
    setCategorias(categoriasResponse.data);

  }

  useEffect(() => {
    carregar();
  }, []);

  if (!relatorio) return <p>Carregando...</p>;

  const cores = [
    "#ff9800",
    "#2196f3",
    "#4caf50",
    "#f44336",
    "#9c27b0"
  ];

  return (
    <div>

      <h1>Dashboard Financeiro</h1>

      {/* GRÁFICO DE BARRAS */}
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


      {/* GRÁFICO DE PIZZA */}
      <h2>Despesas por Categoria</h2>

      <ResponsiveContainer width="100%" height={300}>

        <PieChart>

          <Pie
            data={categorias}
            dataKey="total"
            nameKey="categoria"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >

            {categorias.map((entry, index) => (

              <Cell
                key={index}
                fill={cores[index % cores.length]}
              />

            ))}

          </Pie>

          <Tooltip />

          <Legend />

        </PieChart>

      </ResponsiveContainer>


      {/* TOTAIS GERAIS */}
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