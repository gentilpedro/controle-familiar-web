import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "../components/Layout";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import RotaNaoEncontrada from "./RotaNaoEncontrada";

const Home = lazy(() => import("../pages/Home"));
const Categorias = lazy(() => import("../pages/Categorias"));
const Transacoes = lazy(() => import("../pages/Transacoes"));
const Relatorios = lazy(() => import("../pages/Relatorio"));
const RelatorioFamiliar = lazy(() => import("../pages/RelatorioFamiliar"));
const Login = lazy(() => import("../pages/Login"));
const Registrar = lazy(() => import("../pages/Registrar"));
const MinhaFamilia = lazy(() => import("../pages/MinhaFamilia"));
const MeusDados = lazy(() => import("../pages/MeusDados"));
const Privacidade = lazy(() => import("../pages/Privacidade"));
const Landing = lazy(() => import("../pages/Landing"));

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<div className="page">Carregando...</div>}>
          <Routes>
            <Route path="/" element={<Landing />} />

            <Route path="/login" element={<Login />} />

            <Route path="/registrar" element={<Registrar />} />

            <Route path="/privacidade" element={<Privacidade />} />

            <Route
              path="/painel"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Home />} />
              <Route path="categorias" element={<Categorias />} />
              <Route path="transacoes" element={<Transacoes />} />
              <Route path="relatorios" element={<Relatorios />} />
              {/*
                Sem gate de família aqui: quem digita a URL direto numa
                família sozinha só vê tabela e histórico vazios, não um erro.
                O item some do menu (Layout), mas a rota continua acessível.
              */}
              <Route path="relatorio-familiar" element={<RelatorioFamiliar />} />
              <Route path="minha-familia" element={<MinhaFamilia />} />
              <Route path="meus-dados" element={<MeusDados />} />

              {/* Subrota inexistente do painel renderizaria o Layout com o
                  Outlet vazio: sidebar e area de conteudo em branco. */}
              <Route path="*" element={<Navigate to="/painel" replace />} />
            </Route>

            <Route path="*" element={<RotaNaoEncontrada />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
