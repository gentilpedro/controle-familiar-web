import { useEffect, useState } from "react";
import { api } from "../api/api";
import type { Relatorio } from "../types/Relatorios";
import type { CategoriaResumo } from "../types/Categoria";
import { formatCurrency } from "../utils/format";

import {
  BarChart,
  Bar,
  LabelList,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

/*
 * Espelham os tokens do app.css. Recharts escreve o valor direto no atributo
 * SVG, entao aqui vao os hex em vez de var(--credito) — evita depender de como
 * cada navegador resolve custom property dentro de atributo de apresentacao.
 */
const COR_CREDITO = "#1f7a4c";
const COR_DEBITO = "#b4472f";
const COR_PAUTA = "#c9d6c4";
const COR_TINTA_SUAVE = "#4a5c53";

const FONTE_CIFRA =
  'ui-monospace, "Cascadia Mono", "SF Mono", Consolas, "Liberation Mono", monospace';

/* Eixos e rotulos usam a mono tabular, como as cifras das tabelas */
const eixoTick = {
  fill: COR_TINTA_SUAVE,
  fontSize: 12,
  fontFamily: FONTE_CIFRA,
};

export default function Relatorios() {

  const [relatorio, setRelatorio] = useState<Relatorio>();
  const [categorias, setCategorias] = useState<CategoriaResumo[]>([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let cancelado = false;

    Promise.all([
      api.get<Relatorio>("/relatorios/totais-por-pessoa"),
      api.get<CategoriaResumo[]>("/relatorios/totais-por-categoria")
    ])
      .then(([pessoasResponse, categoriasResponse]) => {
        if (cancelado) return;
        setRelatorio(pessoasResponse.data);
        setCategorias(categoriasResponse.data);
      })
      .catch(() => {
        if (!cancelado) setErro("Não foi possível carregar o relatório. Tente novamente.");
      });

    return () => {
      cancelado = true;
    };
  }, []);

  if (erro) return <div className="auth-error">{erro}</div>;

  if (!relatorio) return <p>Carregando...</p>;

  // Maior primeiro: num grafico ranqueado a ordem e a informacao
  const categoriasOrdenadas = [...categorias].sort((a, b) => b.total - a.total);
async function baixarExcelPessoa() {

  const response = await api.get("/relatorios/excel-pessoa", {
    responseType: "blob"
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));

  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", "relatorio-pessoas.xlsx");

  document.body.appendChild(link);

  link.click();

  link.remove();
}

async function baixarExcelCategoria() {

  const response = await api.get("/relatorios/excel-categoria", {
    responseType: "blob"
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));

  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", "relatorio-categorias.xlsx");

  document.body.appendChild(link);

  link.click();

  link.remove();
}

const saldoLiquido = relatorio.totalReceitas - relatorio.totalDespesas;

return (
  <>
    <div className="page-header">
      <div>
        <h1 className="page-title">Dashboard Financeiro</h1>
        <p className="page-subtitle">Acompanhe receitas, despesas e saldo geral.</p>
      </div>
    </div>

    <div className="summary-grid">
      <div className="summary-card">
        <div className="summary-label">Receitas</div>
        <div className="summary-value receita">
          {formatCurrency(relatorio.totalReceitas)}
        </div>
      </div>

      <div className="summary-card">
        <div className="summary-label">Despesas</div>
        <div className="summary-value despesa">
          {formatCurrency(relatorio.totalDespesas)}
        </div>
      </div>

      <div className="summary-card">
        <div className="summary-label">Saldo Líquido</div>
        <div className="summary-value saldo">
          {formatCurrency(saldoLiquido)}
        </div>
      </div>
    </div>
    <div className="Section-DespXPessoa">
        <button className="btn btn-danger btn-excel"
             onClick={baixarExcelPessoa}>
        Exportar Excel
      </button>
      <div className="chart-card">
        <h2 className="section-title">Receitas vs Despesas por Pessoa</h2>
        {/*
          Verde x vermelho e a convencao do razao, mas o par tem separacao
          fraca em deuteranopia (dE 6.6). Os rotulos de valor sobre cada barra
          sao a codificacao secundaria que torna as duas series distinguiveis
          sem depender da cor.
        */}
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={relatorio.pessoas} margin={{ top: 20 }}>
            <CartesianGrid vertical={false} stroke={COR_PAUTA} />
            <XAxis
              dataKey="pessoa"
              tick={eixoTick}
              axisLine={{ stroke: COR_PAUTA }}
              tickLine={false}
            />
            <YAxis
              tick={eixoTick}
              axisLine={false}
              tickLine={false}
              width={72}
              tickFormatter={(v: number) => formatCurrency(v).replace(/\s/g, "")}
            />
            <Tooltip
              cursor={{ fill: "rgba(15, 31, 24, 0.04)" }}
              formatter={(v: number) => formatCurrency(v)}
              contentStyle={{
                background: "#fcfdfb",
                border: `1px solid ${COR_PAUTA}`,
                borderRadius: 8,
                fontFamily: FONTE_CIFRA,
                fontSize: 13,
              }}
            />
            <Legend iconType="square" wrapperStyle={{ fontSize: 14, paddingTop: 8 }} />
            <Bar dataKey="totalReceitas" fill={COR_CREDITO} name="Receitas" radius={[4, 4, 0, 0]}>
              <LabelList
                dataKey="totalReceitas"
                position="top"
                formatter={(v: number) => formatCurrency(v)}
                style={{ fill: COR_TINTA_SUAVE, fontSize: 11, fontFamily: FONTE_CIFRA }}
              />
            </Bar>
            <Bar dataKey="totalDespesas" fill={COR_DEBITO} name="Despesas" radius={[4, 4, 0, 0]}>
              <LabelList
                dataKey="totalDespesas"
                position="top"
                formatter={(v: number) => formatCurrency(v)}
                style={{ fill: COR_TINTA_SUAVE, fontSize: 11, fontFamily: FONTE_CIFRA }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  
    
    <div className="section-DespXCateg">
         <button className="btn btn-danger btn-excel"
             onClick={baixarExcelCategoria}>
        Exportar Excel
      </button>
    <div className="chart-card">
      <h2 className="section-title">Despesas por Categoria</h2>
      {/*
        Era uma pizza com 5 cores. Cada fatia encosta em todas as outras, e
        cinco tons distinguiveis entre si nao existem nesta paleta — no teste de
        todos os pares, roxo x azul dava dE 1.2 em deuteranopia. Barras
        ranqueadas resolvem na raiz: a categoria e identificada pelo rotulo do
        eixo, a cor deixa de carregar informacao (uma so, a de despesa) e
        comparar tamanhos, que e a pergunta real, fica direto.
      */}
      <ResponsiveContainer width="100%" height={Math.max(200, categoriasOrdenadas.length * 44 + 40)}>
        <BarChart
          data={categoriasOrdenadas}
          layout="vertical"
          margin={{ left: 8, right: 84, top: 4, bottom: 4 }}
        >
          <CartesianGrid horizontal={false} stroke={COR_PAUTA} />
          <XAxis
            type="number"
            tick={eixoTick}
            axisLine={{ stroke: COR_PAUTA }}
            tickLine={false}
            tickFormatter={(v: number) => formatCurrency(v).replace(/\s/g, "")}
          />
          <YAxis
            type="category"
            dataKey="categoria"
            width={140}
            tick={{ fill: COR_TINTA_SUAVE, fontSize: 14 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(15, 31, 24, 0.04)" }}
            formatter={(v: number) => formatCurrency(v)}
            contentStyle={{
              background: "#fcfdfb",
              border: `1px solid ${COR_PAUTA}`,
              borderRadius: 8,
              fontFamily: FONTE_CIFRA,
              fontSize: 13,
            }}
          />
          <Bar dataKey="total" fill={COR_DEBITO} name="Despesas" barSize={18} radius={[0, 4, 4, 0]}>
            <LabelList
              dataKey="total"
              position="right"
              formatter={(v: number) => formatCurrency(v)}
              style={{ fill: COR_TINTA_SUAVE, fontSize: 12, fontFamily: FONTE_CIFRA }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
    </div>
  </>
);
}